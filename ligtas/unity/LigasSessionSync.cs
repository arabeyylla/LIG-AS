// LigasSessionSync.cs
//
// Game Code syncing between the LIG+AS mobile game and the web portal, via the
// Supabase RPC functions in supabase/migrations/20260922_game_code_sessions.sql.
//
//   1. Player types the Game Code shown on the web  ->  SubmitGameCode()
//        POST /rest/v1/rpc/validate_game_code   { p_game_code, p_guest_id }
//        the session is linked to this device's guest id (the last device to enter
//        the code wins, until a result has been uploaded).
//        ok  -> the module (e.g. "Landslide") is returned, the session is saved
//               to PlayerPrefs and the matching scenario scene is loaded.
//
//   2. Scenario finished  ->  CompleteScenario(scoreDetails)
//        The evaluation is FIRST written to a JSON file on the device
//        ({ localGuestId, gameCode, module, score_details, completed: true,
//           uploaded: false }), THEN uploaded if there is a connection:
//        POST /rest/v1/rpc/submit_game_result   { p_game_code, p_guest_id, ... }
//        which stores the results, attaches the guest id and flips the web
//        session to `completed_game` (unlocking the Post-Test). On success the
//        local record is marked `uploaded: true`.
//
//   3. Offline play: records stay `uploaded: false` on disk and are retried on
//        launch, when the app regains focus, and every `retryIntervalSeconds`.
//        Uploading is idempotent server-side, so a retry after a dropped
//        response is safe.
//
// SETUP
//   * Requires Unity 2020.2+ (UnityWebRequest.Result) and JsonUtility (built in).
//   * Add this component to a GameObject in your first scene; it survives scene
//     loads. Set `supabaseUrl` and `supabaseAnonKey` in the Inspector — use the
//     project's PUBLIC anon key, never the service_role key. Access is limited by
//     the database functions, which only return data for a valid Game Code.
//   * Fill `scenarioScenes` if your scene names differ from "Scenario_<Module>".
//
// USAGE
//   // Code-entry screen (e.g. the button's onClick):
//   LigtasSessionSync.Instance.SubmitGameCode(inputField.text, result =>
//   {
//       if (!result.ok) errorLabel.text = result.message;   // scene loads itself on success
//   });
//
//   // When the scenario ends:
//   LigtasSessionSync.Instance.CompleteScenario(new ScoreDetails
//   {
//       gameScore = 850, completionTimeSeconds = 312,
//       hazardsAvoided = 7, hazardsTotal = 9,
//       checklistCompleted = 4, checklistTotal = 5,
//   });

using System;
using System.Collections;
using System.Globalization;
using System.IO;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;

namespace Ligtas.Sync
{
    // ------------------------------------------------------------------------
    // Data shapes. JsonUtility matches JSON keys to FIELD NAMES, so the names
    // below are deliberate: camelCase inside score_details (what the database
    // function reads), p_* for RPC parameters, and the local-record names from
    // the spec (localGuestId, gameCode, module, score_details, completed, uploaded).
    // ------------------------------------------------------------------------

    /// <summary>The game evaluation. Also the exact JSON object sent as p_score_details.</summary>
    [Serializable]
    public class ScoreDetails
    {
        public int gameScore;
        public int completionTimeSeconds;
        public int hazardsAvoided;
        public int hazardsTotal;
        public int checklistCompleted;
        public int checklistTotal;
    }

    /// <summary>One finished scenario, stored on the device until it has been uploaded.</summary>
    [Serializable]
    public class LocalGameRecord
    {
        public string localGuestId;
        public string gameCode;
        public string module;
        public ScoreDetails score_details;
        public bool completed;
        public bool uploaded;
        public string completedAtUtc;      // device clock, ISO 8601 UTC
        public bool uploadRejected;        // the server refused it for good (don't retry)
        public string lastUploadError;     // last server error code, for debugging
    }

    /// <summary>What SubmitGameCode reports back to the UI.</summary>
    public struct CodeValidationResult
    {
        public bool ok;
        public string error;    // machine code: invalid_code, expired, already_played, network, ...
        public string message;  // player-friendly text
        public string module;
    }

    [Serializable]
    public struct ScenarioScene
    {
        public string module;     // e.g. "Volcanic Eruption"
        public string sceneName;  // e.g. "Scenario_Volcano"
    }

    public class LigtasSessionSync : MonoBehaviour
    {
        public static LigtasSessionSync Instance { get; private set; }

        [Header("Supabase (public anon key only)")]
        [SerializeField] private string supabaseUrl = "https://YOUR-PROJECT.supabase.co";
        [SerializeField] private string supabaseAnonKey = "";

        [Header("Scenarios")]
        [Tooltip("Load the matching scenario scene as soon as a code is accepted.")]
        [SerializeField] private bool loadScenarioOnValidCode = true;
        [Tooltip("Optional overrides. Default scene name is \"Scenario_\" + module without spaces.")]
        [SerializeField] private ScenarioScene[] scenarioScenes = Array.Empty<ScenarioScene>();

        [Header("Sync")]
        [SerializeField] private bool syncOnStart = true;
        [SerializeField] private float retryIntervalSeconds = 30f;
        [SerializeField] private int requestTimeoutSeconds = 15;

        /// <summary>Raised on the main thread after a local record was uploaded and marked uploaded: true.</summary>
        public event Action<LocalGameRecord> ResultUploaded;

        private const string GuestIdKey = "ligtas_guest_id";
        private const string ActiveSessionKey = "ligtas_active_session";
        private const int GameCodeLength = 6;

        private bool isUploading;

        // Response of the database functions: always { ok: true, ... } or { ok: false, error }.
        [Serializable]
        private class RpcResponse
        {
            public bool ok;
            public string error;
            public string game_code;
            public string module;
            public string expires_at;
            public bool already_uploaded;
        }

        // Request bodies. Field names must equal the SQL function parameter names.
        [Serializable]
        private class ValidateRequest
        {
            public string p_game_code;
            public string p_guest_id;
        }

        [Serializable]
        private class SubmitResultRequest
        {
            public string p_game_code;
            public string p_guest_id;
            public string p_module;
            public ScoreDetails p_score_details;
            public string p_client_completed_at;
        }

        [Serializable]
        private class ActiveSession
        {
            public string gameCode;
            public string module;
            public string expiresAt;
        }

        private struct RpcCallResult
        {
            public RpcResponse response;   // null when the request itself failed
            public bool retryable;         // worth trying again later (offline, timeout, 5xx)
            public string detail;
        }

        // ------------------------------------------------------------------
        // Lifecycle
        // ------------------------------------------------------------------

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            if (syncOnStart) StartCoroutine(SyncLoop());
        }

        private void OnApplicationFocus(bool hasFocus)
        {
            if (hasFocus && syncOnStart) SyncPendingResults();
        }

        // ------------------------------------------------------------------
        // Guest identity + active session (PlayerPrefs)
        // ------------------------------------------------------------------

        /// <summary>Stable per-install id (the spec's localGuestId), created on first use.</summary>
        public string GuestId
        {
            get
            {
                string id = PlayerPrefs.GetString(GuestIdKey, "");
                if (string.IsNullOrEmpty(id))
                {
                    id = "G-" + Guid.NewGuid().ToString("N").Substring(0, 12).ToUpperInvariant();
                    PlayerPrefs.SetString(GuestIdKey, id);
                    PlayerPrefs.Save();
                }
                return id;
            }
        }

        /// <summary>The validated session the player is currently playing, if any.</summary>
        public bool TryGetActiveSession(out string gameCode, out string module)
        {
            gameCode = module = null;
            string json = PlayerPrefs.GetString(ActiveSessionKey, "");
            if (string.IsNullOrEmpty(json)) return false;
            try
            {
                ActiveSession session = JsonUtility.FromJson<ActiveSession>(json);
                if (session == null || string.IsNullOrEmpty(session.gameCode)) return false;
                gameCode = session.gameCode;
                module = session.module;
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public void ClearActiveSession()
        {
            PlayerPrefs.DeleteKey(ActiveSessionKey);
            PlayerPrefs.Save();
        }

        private void SaveActiveSession(string gameCode, string module, string expiresAt)
        {
            var session = new ActiveSession { gameCode = gameCode, module = module, expiresAt = expiresAt };
            PlayerPrefs.SetString(ActiveSessionKey, JsonUtility.ToJson(session));
            PlayerPrefs.Save();
        }

        // ------------------------------------------------------------------
        // 1. Code validation
        // ------------------------------------------------------------------

        /// <summary>Uppercases the input and drops spaces/dashes: " lnd-821 " -> "LND821".</summary>
        public static string NormalizeGameCode(string raw)
        {
            if (string.IsNullOrEmpty(raw)) return "";
            var sb = new StringBuilder();
            foreach (char c in raw.ToUpperInvariant())
                if ((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) sb.Append(c);
            return sb.Length > GameCodeLength ? sb.ToString(0, GameCodeLength) : sb.ToString();
        }

        /// <summary>
        /// Checks the code with Supabase (it must exist, be waiting_for_game and not expired).
        /// On success the session is stored and, if enabled, the scenario scene is loaded.
        /// <paramref name="onDone"/> is always called exactly once.
        /// </summary>
        public void SubmitGameCode(string rawCode, Action<CodeValidationResult> onDone)
        {
            StartCoroutine(ValidateGameCode(rawCode, onDone));
        }

        public IEnumerator ValidateGameCode(string rawCode, Action<CodeValidationResult> onDone)
        {
            string code = NormalizeGameCode(rawCode);
            if (code.Length != GameCodeLength)
            {
                onDone?.Invoke(Fail("invalid_code"));
                yield break;
            }

            string body = JsonUtility.ToJson(new ValidateRequest { p_game_code = code, p_guest_id = GuestId });
            RpcCallResult call = default;
            yield return PostRpc("validate_game_code", body, r => call = r);

            if (call.response == null)
            {
                onDone?.Invoke(Fail("network"));
                yield break;
            }
            if (!call.response.ok)
            {
                onDone?.Invoke(Fail(call.response.error));
                yield break;
            }

            SaveActiveSession(call.response.game_code, call.response.module, call.response.expires_at);
            onDone?.Invoke(new CodeValidationResult { ok = true, module = call.response.module, message = "Code accepted." });

            if (loadScenarioOnValidCode) SceneManager.LoadScene(SceneNameFor(call.response.module));
        }

        private static CodeValidationResult Fail(string error)
        {
            string message;
            switch (error)
            {
                case "invalid_code": message = "That Game Code wasn't found. Check it and try again."; break;
                case "expired": message = "This Game Code has expired. Take the Pre-Test on the website to get a new one."; break;
                case "already_played": message = "This Game Code has already been used."; break;
                case "network": message = "No connection. Connect to the internet to validate your code."; break;
                default: message = "Something went wrong. Please try again."; break;
            }
            return new CodeValidationResult { ok = false, error = error, message = message };
        }

        private string SceneNameFor(string module)
        {
            foreach (ScenarioScene entry in scenarioScenes)
                if (entry.module == module && !string.IsNullOrEmpty(entry.sceneName)) return entry.sceneName;
            return "Scenario_" + module.Replace(" ", "");
        }

        // ------------------------------------------------------------------
        // 2. Save locally first, then upload
        // ------------------------------------------------------------------

        /// <summary>
        /// Call when the scenario ends. Saves the evaluation to disk immediately (so nothing is lost
        /// if the player is offline or the app is killed), then tries to upload it.
        /// </summary>
        public void CompleteScenario(ScoreDetails details)
        {
            if (!TryGetActiveSession(out string gameCode, out string module))
            {
                Debug.LogError("[LigtasSync] CompleteScenario called without a validated Game Code.");
                return;
            }

            var record = new LocalGameRecord
            {
                localGuestId = GuestId,
                gameCode = gameCode,
                module = module,
                score_details = details,
                completed = true,
                uploaded = false,
                completedAtUtc = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture),
            };

            if (!WriteRecord(record))
            {
                Debug.LogError("[LigtasSync] Could not save the game evaluation locally.");
                return;
            }

            ClearActiveSession(); // the scenario is over; the record is now the source of truth
            SyncPendingResults();
        }

        /// <summary>Uploads every saved record that has not been uploaded yet.</summary>
        public void SyncPendingResults()
        {
            if (!isUploading) StartCoroutine(UploadPendingResults());
        }

        private IEnumerator SyncLoop()
        {
            var wait = new WaitForSecondsRealtime(Mathf.Max(5f, retryIntervalSeconds));
            while (true)
            {
                SyncPendingResults();
                yield return wait;
            }
        }

        public IEnumerator UploadPendingResults()
        {
            if (isUploading) yield break;
            isUploading = true;

            foreach (string path in PendingRecordPaths())
            {
                LocalGameRecord record = ReadRecord(path);
                if (record == null || !record.completed || record.uploaded || record.uploadRejected) continue;

                // Nothing to gain from trying while offline; keep the file for later.
                if (Application.internetReachability == NetworkReachability.NotReachable) break;

                var body = new SubmitResultRequest
                {
                    p_game_code = record.gameCode,
                    p_guest_id = record.localGuestId,
                    p_module = record.module,
                    p_score_details = record.score_details,
                    p_client_completed_at = record.completedAtUtc,
                };

                RpcCallResult call = default;
                yield return PostRpc("submit_game_result", JsonUtility.ToJson(body), r => call = r);

                if (call.response != null && call.response.ok)
                {
                    record.uploaded = true;
                    record.lastUploadError = "";
                    WriteRecord(record);
                    ResultUploaded?.Invoke(record);
                }
                else if (call.response != null)
                {
                    // The server understood and refused (bad code, wrong module, already completed by
                    // another guest...). Retrying can't help, so stop trying but keep the file.
                    record.uploadRejected = true;
                    record.lastUploadError = call.response.error;
                    WriteRecord(record);
                    Debug.LogWarning($"[LigtasSync] Upload rejected for {record.gameCode}: {call.response.error}");
                }
                else if (call.retryable)
                {
                    break; // offline / server hiccup: try again on the next sync
                }
                else
                {
                    record.uploadRejected = true;
                    record.lastUploadError = call.detail;
                    WriteRecord(record);
                    Debug.LogWarning($"[LigtasSync] Upload failed permanently for {record.gameCode}: {call.detail}");
                }
            }

            isUploading = false;
        }

        // ------------------------------------------------------------------
        // Local JSON storage: <persistentDataPath>/ligtas_pending/<GAMECODE>.json
        // ------------------------------------------------------------------

        private static string PendingDirectory => Path.Combine(Application.persistentDataPath, "ligtas_pending");

        private static string[] PendingRecordPaths()
        {
            try
            {
                return Directory.Exists(PendingDirectory) ? Directory.GetFiles(PendingDirectory, "*.json") : Array.Empty<string>();
            }
            catch (Exception e)
            {
                Debug.LogWarning("[LigasSync] Could not list saved results: " + e.Message);
                return Array.Empty<string>();
            }
        }

        private static bool WriteRecord(LocalGameRecord record)
        {
            try
            {
                Directory.CreateDirectory(PendingDirectory);
                string path = Path.Combine(PendingDirectory, record.gameCode + ".json");
                string temp = path + ".tmp";
                File.WriteAllText(temp, JsonUtility.ToJson(record, true), Encoding.UTF8);
                if (File.Exists(path)) File.Delete(path);
                File.Move(temp, path); // write-then-rename so a crash never leaves a half-written record
                return true;
            }
            catch (Exception e)
            {
                Debug.LogError("[LigtasSync] Write failed: " + e.Message);
                return false;
            }
        }

        private static LocalGameRecord ReadRecord(string path)
        {
            try
            {
                return JsonUtility.FromJson<LocalGameRecord>(File.ReadAllText(path, Encoding.UTF8));
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[LigtasSync] Skipping unreadable record {path}: {e.Message}");
                return null;
            }
        }

        // ------------------------------------------------------------------
        // HTTP: POST {supabaseUrl}/rest/v1/rpc/<function>
        // ------------------------------------------------------------------

        private IEnumerator PostRpc(string function, string jsonBody, Action<RpcCallResult> onDone)
        {
            string url = supabaseUrl.TrimEnd('/') + "/rest/v1/rpc/" + function;

            using (var request = new UnityWebRequest(url, UnityWebRequest.kHttpVerbPOST))
            {
                request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(jsonBody));
                request.downloadHandler = new DownloadHandlerBuffer();
                request.timeout = requestTimeoutSeconds;
                request.SetRequestHeader("Content-Type", "application/json");
                request.SetRequestHeader("apikey", supabaseAnonKey);
                // Legacy anon keys are JWTs and go in Authorization too; the newer "sb_publishable_..."
                // keys are not JWTs and must only be sent as `apikey`.
                if (supabaseAnonKey.StartsWith("eyJ", StringComparison.Ordinal))
                    request.SetRequestHeader("Authorization", "Bearer " + supabaseAnonKey);

                yield return request.SendWebRequest();

                switch (request.result)
                {
                    case UnityWebRequest.Result.Success:
                        RpcResponse parsed = null;
                        try { parsed = JsonUtility.FromJson<RpcResponse>(request.downloadHandler.text); }
                        catch (Exception) { /* falls through to the retryable branch below */ }

                        onDone(parsed != null
                            ? new RpcCallResult { response = parsed }
                            : new RpcCallResult { retryable = true, detail = "unreadable response" });
                        break;

                    case UnityWebRequest.Result.ProtocolError:
                        // 4xx means our request is wrong (bad key, function missing): retrying won't fix it.
                        // 429 and 5xx are the server's problem and worth another try later.
                        bool transient = request.responseCode >= 500 || request.responseCode == 429;
                        onDone(new RpcCallResult { retryable = transient, detail = $"HTTP {request.responseCode}: {request.downloadHandler.text}" });
                        break;

                    default: // ConnectionError, DataProcessingError: offline, DNS, timeout
                        onDone(new RpcCallResult { retryable = true, detail = request.error });
                        break;
                }
            }
        }
    }
}

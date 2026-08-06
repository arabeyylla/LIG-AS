import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Download as DownloadIcon, Smartphone, HardDrive, 
  Cpu, Shield, CheckCircle, AlertTriangle,
  ChevronRight, ExternalLink
} from "lucide-react";
import { trackDownload, trackPageVisit } from '../lib/analytics';

export default function Download() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => { trackPageVisit('download'); }, []);

  const handleDownload = async () => {
    setDownloading(true);
    
    // Track the download
    await trackDownload();
    
    // Trigger actual download (replace with real APK URL when available)
    // For now, simulate a brief delay
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      
      // Uncomment and replace with actual APK URL when ready:
      // window.open('https://your-storage-url.com/ligtas.apk', '_blank');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-orange-500/5" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 30% 100%)' }}></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-[10%] text-center">
          <div className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            Get the Game
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
            Download <span className="text-orange-500">LIG+AS</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Get the APK and start training for disaster survival on your Android device.
          </p>
        </div>
      </section>

      {/* DOWNLOAD SECTION */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="px-4 sm:px-8 lg:px-[10%]">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* LEFT: Download Card */}
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 sticky top-24">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone size={36} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">LIG+AS for Android</h2>
                <p className="text-gray-500 text-sm">Version 1.0 &bull; APK File</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-slate-100">
                  <span className="text-sm text-gray-500">File Size</span>
                  <span className="text-sm font-bold text-slate-800">~150 MB</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-slate-100">
                  <span className="text-sm text-gray-500">Platform</span>
                  <span className="text-sm font-bold text-slate-800">Android 7.0+</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-slate-100">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm font-bold text-slate-800">2026</span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                  downloaded
                    ? 'bg-green-500 text-white shadow-green-200'
                    : downloading
                    ? 'bg-orange-300 text-white cursor-wait'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 hover:-translate-y-0.5'
                }`}
              >
                {downloaded ? (
                  <>
                    <CheckCircle size={24} />
                    Download Started
                  </>
                ) : downloading ? (
                  <>
                    <DownloadIcon size={24} className="animate-bounce" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <DownloadIcon size={24} />
                    Download APK
                  </>
                )}
              </button>

              {downloaded && (
                <p className="text-center text-sm text-green-600 font-bold mt-4">
                  Check your device's Downloads folder for the APK file.
                </p>
              )}
            </div>

            {/* RIGHT: Requirements & Instructions */}
            <div className="space-y-10">
              {/* Device Requirements */}
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Cpu className="text-orange-500" size={24} />
                  Device Requirements
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Operating System</h4>
                      <p className="text-gray-500 text-sm">Android 7.0 (Nougat) or higher</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">RAM</h4>
                      <p className="text-gray-500 text-sm">At least 2GB (3GB+ recommended)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Storage</h4>
                      <p className="text-gray-500 text-sm">500MB of free space</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Graphics</h4>
                      <p className="text-gray-500 text-sm">OpenGL ES 3.0 compatible GPU</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Input</h4>
                      <p className="text-gray-500 text-sm">Touchscreen (for virtual joystick controls)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Installation Instructions */}
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <HardDrive className="text-orange-500" size={24} />
                  Installation Guide
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black">1</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Download the APK</h4>
                      <p className="text-gray-500 text-sm">Click the download button to get the LIG+AS APK file.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black">2</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Enable Unknown Sources</h4>
                      <p className="text-gray-500 text-sm">Go to <span className="font-bold">Settings &gt; Security &gt; Unknown Sources</span> and enable it. On newer Android versions, you'll be prompted when opening the file.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black">3</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Open the APK File</h4>
                      <p className="text-gray-500 text-sm">Navigate to your Downloads folder and tap the APK file to begin installation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black">4</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Install & Launch</h4>
                      <p className="text-gray-500 text-sm">Tap "Install" when prompted, then open LIG+AS from your app drawer.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Notice */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <Shield className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Safe to Install</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      LIG+AS is developed by our team and is completely safe. The "Unknown Sources" warning is standard for apps not from the Play Store. The game does not collect personal data and works entirely offline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TROUBLESHOOTING */}
      <section className="py-20 bg-gray-100">
        <div className="px-4 sm:px-8 lg:px-[15%]">
          <h3 className="text-2xl font-black text-slate-900 mb-8 text-center">Having Trouble?</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <AlertTriangle className="text-orange-500 mb-3" size={20} />
              <h4 className="font-bold text-slate-800 text-sm mb-2">"App not installed" error</h4>
              <p className="text-gray-500 text-sm">Make sure you have enough storage space and that the download completed fully. Try re-downloading the APK.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <AlertTriangle className="text-orange-500 mb-3" size={20} />
              <h4 className="font-bold text-slate-800 text-sm mb-2">"Parse error" on install</h4>
              <p className="text-gray-500 text-sm">Your Android version may be too old. LIG+AS requires Android 7.0 or higher. Check your version in Settings &gt; About Phone.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <AlertTriangle className="text-orange-500 mb-3" size={20} />
              <h4 className="font-bold text-slate-800 text-sm mb-2">Game runs slowly</h4>
              <p className="text-gray-500 text-sm">Close background apps, ensure you have free RAM, and try lowering graphics settings in the game's options menu.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <AlertTriangle className="text-orange-500 mb-3" size={20} />
              <h4 className="font-bold text-slate-800 text-sm mb-2">Can't find download file</h4>
              <p className="text-gray-500 text-sm">Check your browser's download history or your device's Downloads folder using a file manager app.</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/faq" className="inline-flex items-center gap-2 text-orange-500 font-bold hover:text-orange-600 transition-colors">
              View Full FAQ <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

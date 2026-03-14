import React from "react";

export default function DeviceLogs() {
  return (
    <div className="p-6 lg:p-10">
      <h2 className="text-xl lg:text-2xl font-black text-slate-800 mb-4">
        Download Logs
      </h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Access and export device activity logs for audits, investigations, or
        after-action reviews. You can later wire this up to your real log
        export endpoints.
      </p>
    </div>
  );
}


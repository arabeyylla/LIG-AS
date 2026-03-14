import React from "react";

export default function DeviceGlobalAlerts() {
  return (
    <div className="p-6 lg:p-10">
      <h2 className="text-xl lg:text-2xl font-black text-slate-800 mb-4">
        Global Alerts
      </h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Configure how this device receives alerts, notifications, and critical
        warnings during simulations. You can later connect this screen to your
        actual notification preferences and delivery channels.
      </p>
    </div>
  );
}


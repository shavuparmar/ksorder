import React, { useEffect, useState } from "react";
import { api } from "../api/auth";

export default function AdminSettings() {
  const [s, setS] = useState(null);

  const load = async () => {
    const res = await api.get("/settings");
    setS(res?.data?.data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.patch("/settings/order-window", s.orderWindow);
    load();
  };

  if (!s) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-500">Control order timing window.</p>
      </div>

      <div className="bg-white border rounded-2xl p-4 space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!s.orderWindow?.enabled}
            onChange={(e) =>
              setS({ ...s, orderWindow: { ...s.orderWindow, enabled: e.target.checked } })
            }
          />
          Enable order window
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Start Time</p>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={s.orderWindow?.startTime || "10:00"}
              onChange={(e) =>
                setS({ ...s, orderWindow: { ...s.orderWindow, startTime: e.target.value } })
              }
            />
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">End Time</p>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={s.orderWindow?.endTime || "18:00"}
              onChange={(e) =>
                setS({ ...s, orderWindow: { ...s.orderWindow, endTime: e.target.value } })
              }
            />
          </div>
        </div>

        <button onClick={save} className="bg-black text-white rounded-xl py-2 w-full">
          Save Settings
        </button>
      </div>
    </div>
  );
}

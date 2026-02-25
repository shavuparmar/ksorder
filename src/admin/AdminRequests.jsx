import { useEffect, useState } from "react";
import { api } from "../api/auth";
import { motion } from "framer-motion";

export default function AdminRequests() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("PENDING");

  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [err, setErr] = useState("");
  const [noteMap, setNoteMap] = useState({}); // {requestId: "note text"}

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get(`/admin/requests?status=${status}`);
      setItems(res?.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load requests");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const act = async (id, action) => {
    try {
      setErr("");
      setSavingId(id);

      const reviewNote = (noteMap[id] || "").trim();

      await api.patch(`/admin/requests/${id}`, { action, reviewNote });

      // ✅ Better UX: remove it from list instantly if viewing PENDING
      if (status === "PENDING") {
        setItems((prev) => prev.filter((x) => x._id !== id));
      } else {
        await load();
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update request");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Change Requests</h1>
          <p className="text-sm text-gray-500">
            Approve or reject profile/password change requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm"
          >
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <button
            onClick={load}
            className="border rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {err ? (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {err}
        </div>
      ) : null}

      {/* List */}
      <div className="bg-white border rounded-2xl overflow-hidden divide-y">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No requests</div>
        ) : (
          items.map((r) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {r.type} — {r.userId?.customerName} ({r.userId?.customerNumber})
                  </p>
                  <p className="text-xs text-gray-500">
                    Role: {r.requestedByRole} • Created:{" "}
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-lg border ${
                    r.status === "PENDING"
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : r.status === "APPROVED"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              {/* Requested payload */}
              <pre className="text-xs bg-gray-50 border rounded-xl p-3 mt-3 overflow-auto">
{JSON.stringify(r.payload, null, 2)}
              </pre>

              {/* Optional user note */}
              {r.note ? (
                <p className="text-xs text-gray-500 mt-2">
                  User note: <span className="text-gray-800">{r.note}</span>
                </p>
              ) : null}

              {/* Admin review note input (only pending) */}
              {r.status === "PENDING" ? (
                <>
                  <input
                    value={noteMap[r._id] || ""}
                    onChange={(e) =>
                      setNoteMap((prev) => ({ ...prev, [r._id]: e.target.value }))
                    }
                    placeholder="Admin note (optional)"
                    className="mt-3 w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      disabled={savingId === r._id}
                      onClick={() => act(r._id, "APPROVE")}
                      className="bg-black text-white rounded-xl px-4 py-2 text-sm disabled:opacity-60"
                    >
                      {savingId === r._id ? "Saving..." : "Approve"}
                    </button>

                    <button
                      disabled={savingId === r._id}
                      onClick={() => act(r._id, "REJECT")}
                      className="border rounded-xl px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  Admin note: {r.reviewNote || "—"}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

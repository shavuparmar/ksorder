import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/auth";

function cx(...a) {
  return a.filter(Boolean).join(" ");
}

function Icon({ name, className }) {
  const common = {
    className: cx("w-5 h-5", className),
    fill: "none",
    viewBox: "0 0 24 24",
  };
  switch (name) {
    case "back":
      return (
        <svg {...common}>
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path
            d="M12 20h9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4L16.5 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "save":
      return (
        <svg {...common}>
          <path
            d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 21v-8H7v8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 3v5h8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path
            d="M10 16l-4-4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 12h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 4h4v16h-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function Card({ title, children, right }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {title ? (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {right}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, disabled, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder || label}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "w-full rounded-xl border px-3 py-2 text-sm outline-none",
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-600"
            : "bg-white border-gray-300 focus:ring-2 focus:ring-gray-200"
        )}
      />
    </div>
  );
}

export default function ProfilePageSimple() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    customerName: "",
    firstName: "",
    email: "",
    customerNumber: "",
    phone: "",
    bio: "",
    website: "",
    location: "",
  });

  const initials = useMemo(() => {
    const a = (me?.firstName || me?.customerName || "U").trim();
    return a.slice(0, 1).toUpperCase();
  }, [me]);

  const load = async () => {
    try {
      setLoading(true);
      setMsg({ type: "", text: "" });

      const res = await api.get("/users/me");
      const u = res?.data?.data;

      setMe(u);
      setForm({
        customerName: u?.customerName ?? "",
        firstName: u?.firstName ?? "",
        email: u?.email ?? "",
        customerNumber: u?.customerNumber ?? "",
        phone: u?.phone ?? "",
        bio: u?.bio ?? "",
        website: u?.website ?? "",
        location: u?.location ?? "",
      });
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Failed to load profile",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditing(false);
    setMsg({ type: "", text: "" });
    setForm({
      customerName: me?.customerName ?? "",
      firstName: me?.firstName ?? "",
      email: me?.email ?? "",
      customerNumber: me?.customerNumber ?? "",
      phone: me?.phone ?? "",
      bio: me?.bio ?? "",
      website: me?.website ?? "",
      location: me?.location ?? "",
    });
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMsg({ type: "", text: "" });

      const payload = {
        customerName: form.customerName,
        firstName: form.firstName,
        email: form.email,
        customerNumber:
          form.customerNumber === "" ? null : Number(form.customerNumber),
        phone: form.phone,
        bio: form.bio,
        website: form.website,
        location: form.location,
      };

      const res = await api.put("/users/me", payload);

      const updated = res?.data?.data || { ...me, ...payload };
      setMe(updated);
      setEditing(false);
      setMsg({ type: "success", text: "Profile updated" });
    } catch (e) {
      setMsg({
        type: "error",
        text:
          e?.response?.data?.message ||
          "Update failed (create PUT /users/me API)",
      });
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login", { replace: true });
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!me) return <div className="p-6">No profile found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => nav(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Icon name="back" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
            >
              <Icon name="edit" />
              {editing ? "Cancel" : "Edit"}
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Icon name="logout" />
              Logout
            </button>
          </div>
        </div>

        {msg.text ? (
          <div
            className={cx(
              "mt-4 rounded-xl border px-4 py-3 text-sm",
              msg.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            )}
          >
            {msg.text}
          </div>
        ) : null}

        {/* Simple header */}
        <div className="mt-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">
              {me?.customerName || "User"}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {me?.email || "—"} • {me?.role || "USER"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card
            title="Profile"
            right={
              <span className="text-xs text-gray-500">
                {me?.createdAt
                  ? `Member since ${new Date(me.createdAt).getFullYear()}`
                  : ""}
              </span>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Customer Name"
                value={form.customerName}
                disabled={!editing}
                onChange={(v) => setForm((p) => ({ ...p, customerName: v }))}
              />
              <Field
                label="First Name"
                value={form.firstName}
                disabled={!editing}
                onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
              />
              <Field
                label="Email"
                value={form.email}
                disabled={!editing}
                onChange={(v) => setForm((p) => ({ ...p, email: v }))}
              />
              <Field
                label="Customer Number"
                value={form.customerNumber}
                disabled={!editing}
                onChange={(v) =>
                  setForm((p) => ({ ...p, customerNumber: v }))
                }
              />
              <Field
                label="Phone"
                value={form.phone}
                disabled={!editing}
                onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
              />
              <Field
                label="Location"
                value={form.location}
                disabled={!editing}
                onChange={(v) => setForm((p) => ({ ...p, location: v }))}
              />
            </div>

            <div className="mt-3 space-y-1">
              <label className="text-xs font-semibold text-gray-600">Bio</label>
              <textarea
                rows={3}
                disabled={!editing}
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                className={cx(
                  "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                  !editing
                    ? "bg-gray-50 border-gray-200 text-gray-600"
                    : "bg-white border-gray-300 focus:ring-2 focus:ring-gray-200"
                )}
                placeholder="Write something..."
              />
            </div>

            <div className="mt-3">
              <Field
                label="Website"
                value={form.website}
                disabled={!editing}
                onChange={(v) => setForm((p) => ({ ...p, website: v }))}
              />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                disabled={!editing || saving}
                onClick={saveProfile}
                className={cx(
                  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium",
                  !editing
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-black",
                  saving ? "opacity-70" : ""
                )}
              >
                <Icon name="save" />
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={reset}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              For saving to work, backend should have{" "}
              <span className="font-semibold">PUT /users/me</span>.
            </p>
          </Card>

          <Card title="Quick Stats">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Orders" value={me?.ordersCount ?? 0} />
              <Stat label="Payments" value={me?.paymentsCount ?? 0} />
              <Stat
                label="Role"
                value={me?.role ? String(me.role) : "USER"}
              />
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-600">Account</p>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  {me?.email || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  {me?.phone || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Customer No:</span>{" "}
                  {me?.customerNumber ?? "—"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
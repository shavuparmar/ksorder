import React, { useEffect, useState } from "react";
import { api } from "../api/auth";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    firstName: "",
    email: "",
    customerNumber: "",
    password: "",
    role: "USER",
  });

  const load = async () => {
    const res = await api.get("/users");
    setUsers(res?.data?.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/users/create", form);
    setForm({
      customerName: "",
      firstName: "",
      email: "",
      customerNumber: "",
      password: "",
      role: "USER",
    });
    await load();
  };

  const toggleActive = async (id, isActive) => {
    await api.patch(`/users/${id}/active`, { isActive: !isActive });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Users / Staff</h1>
        <p className="text-sm text-gray-500">
          Admin can create users & staff (no registration).
        </p>
      </div>

      <form onSubmit={create} className="bg-white border rounded-2xl p-4 grid md:grid-cols-3 gap-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Customer Name"
          value={form.customerName} onChange={(e)=>setForm({...form, customerName:e.target.value})} />
        <input className="border rounded-xl px-3 py-2" placeholder="First Name"
          value={form.firstName} onChange={(e)=>setForm({...form, firstName:e.target.value})} />
        <input className="border rounded-xl px-3 py-2" placeholder="Email"
          value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />

        <input className="border rounded-xl px-3 py-2" placeholder="Customer Number"
          value={form.customerNumber} onChange={(e)=>setForm({...form, customerNumber:e.target.value})} />
        <input className="border rounded-xl px-3 py-2" placeholder="Password"
          value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} />
        <select className="border rounded-xl px-3 py-2"
          value={form.role} onChange={(e)=>setForm({...form, role:e.target.value})}>
          <option value="USER">USER</option>
          <option value="STAFF">STAFF</option>
        </select>

        <button className="md:col-span-3 bg-black text-white rounded-xl py-2">
          Create User
        </button>
      </form>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-4 border-b">
          <p className="font-semibold">All Users</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Number</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Active</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-3">{u.customerName} / {u.firstName}</td>
                  <td className="p-3">{u.customerNumber}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.isActive ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <button
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                      onClick={() => toggleActive(u._id, u.isActive)}
                    >
                      {u.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="p-6 text-gray-500" colSpan={6}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

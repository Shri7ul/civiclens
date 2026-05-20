"use client";

import React, { useEffect, useState } from "react";
import { publicService } from "@/services/public.service";
import { Button } from "@/components/ui/button";

export default function AdminPublicCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ title: "", description: "", area: "", source_name: "", source_url: "", is_featured: false, cover_image: "" });

  function load() {
    setLoading(true);
    publicService
      .publicCases()
      .then((res) => setCases(res))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target as any;
    setForm((f: any) => ({ ...f, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  function createCase() {
    // admin_id must be provided; use placeholder admin id 1 for now
    const payload = { ...form, admin_id: 1 };
    publicService.createPublicCase(payload).then(() => {
      setShowForm(false);
      setForm({ title: "", description: "", area: "", source_name: "", source_url: "", is_featured: false, cover_image: "" });
      load();
    });
  }

  function delCase(id: number) {
    if (!confirm("Delete this public case?")) return;
    publicService.deletePublicCase(id, { admin_id: 1 }).then(() => load());
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Public Cases</h1>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Close" : "Create Public Case"}</Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl bg-white/60 p-4 dark:bg-white/5 shadow-glow">
          <div className="grid gap-3 md:grid-cols-2">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Case Title" className="rounded p-2" />
            <select name="area" value={form.area} onChange={handleChange} className="rounded p-2">
              <option value="">Select area</option>
              <option>Dhaka</option>
              <option>Chittagong</option>
              <option>Khulna</option>
              <option>Sylhet</option>
              <option>Rajshahi</option>
            </select>
            {/* Status and assignment are handled by Authority/Officer workflows, not admin. */}
            <input name="source_name" value={form.source_name} onChange={handleChange} placeholder="Source Name" className="rounded p-2" />
            <input name="source_url" value={form.source_url} onChange={handleChange} placeholder="Source URL" className="rounded p-2" />
            <input name="cover_image" value={form.cover_image} onChange={handleChange} placeholder="Cover image URL" className="rounded p-2" />
            <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} /> Featured</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="col-span-2 rounded p-2" />
          </div>
          <div className="mt-3">
            <Button onClick={createCase}>Create</Button>
          </div>
        </div>
      )}

      <div className="overflow-auto rounded-2xl bg-white/60 p-4 dark:bg-white/5 shadow-glow">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left">ID</th>
              <th className="text-left">Title</th>
              <th className="text-left">Area</th>
              <th className="text-left">Status</th>
              <th className="text-left">Officer</th>
              <th className="text-left">Featured</th>
              <th className="text-left">Updated</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}>Loading…</td></tr>
            ) : cases.length === 0 ? (
              <tr><td colSpan={8}>No public cases</td></tr>
            ) : (
              cases.map((c) => (
                <tr key={c.id} className="border-t">
                  <td>{c.id}</td>
                  <td>{c.title}</td>
                  <td>{c.area}</td>
                  <td>{c.status}</td>
                  <td>{c.assigned_officer?.name ?? "-"}</td>
                  <td>{c.is_featured ? "Yes" : "No"}</td>
                  <td>{new Date(c.updated_at).toLocaleString()}</td>
                  <td className="flex gap-2">
                    <Button size="sm" onClick={() => { window.open(`/public-cases/${c.id}`); }}>View</Button>
                    <Button size="sm" variant="destructive" onClick={() => delCase(c.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type License = { id: number; name: string; number: string; expiry: string; file: string | null };

const initialLicenses: License[] = [
  { id: 20, name: "License 20", number: "", expiry: "", file: null },
  { id: 21, name: "License 21", number: "", expiry: "", file: null },
  { id: 2020, name: "License 20b", number: "", expiry: "", file: null },
  { id: 2121, name: "License 21b", number: "", expiry: "", file: null },
];

function DownloadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M11 3h2v10.2l3.5-3.5 1.4 1.4-5.9 5.9-5.9-5.9 1.4-1.4 3.5 3.5V3ZM4 19h16v2H4v-2Z" /></svg>;
}

function EditIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none"><path d="m4 16.8-.7 3.9 3.9-.7L19.8 7.4a2 2 0 0 0 0-2.8l-.4-.4a2 2 0 0 0-2.8 0L4 16.8Z" stroke="currentColor" strokeWidth="2" /><path d="m14.8 5.2 4 4" stroke="currentColor" strokeWidth="2" /></svg>;
}

export function DocumentsSettings() {
  const [licenses, setLicenses] = useState(initialLicenses);
  const [editing, setEditing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/account/documents", { cache: "no-store" }).then((response) => response.json()).then((payload) => {
      if (payload.data?.licenses?.length) setLicenses(payload.data.licenses);
    }).finally(() => setLoading(false));
  }, []);

  function update(id: number, field: "number" | "expiry", value: string) {
    setLicenses((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  async function toggleEdit(license: License) {
    if (editing !== license.id) { setEditing(license.id); return; }
    await fetch(`/api/account/documents/${license.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ license_number: license.number, expiry_date: license.expiry || null }) });
    setEditing(null);
  }

  async function uploadDocument(id: number, file: File | undefined) {
    if (!file) return;
    const body = new FormData();
    body.append("document", file);
    const response = await fetch(`/api/account/documents/${id}/file`, { method: "POST", body });
    if (response.ok) setLicenses((items) => items.map((item) => item.id === id ? { ...item, file: file.name } : item));
  }

  return (
    <section className="mx-auto max-w-[1100px] px-5 py-8 sm:px-9 lg:px-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2"><h1 className="text-[27px] font-medium text-[#0795ed]">Documents</h1><span aria-hidden="true" className="text-xl">💡</span></div>
        <button type="button" onClick={async () => { const response = await fetch("/api/account/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ license_type: "Other License" }) }); const payload = await response.json(); if (response.ok && payload.data?.license) setLicenses((items) => [...items, { id: payload.data.license.id, name: payload.data.license.license_type, number: "", expiry: "", file: null }]); }} className="bg-[#079ff0] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0788cf]">+ Add other License</button>
      </div>
      <p className="mt-3 text-[14px] text-[#064c9c]">GSTIN and PAN options are moved to About Pharmacy page.</p>
      <div className="mt-9">
        {loading ? <p className="py-8 text-sm text-[#0758a6]">Loading documents…</p> : licenses.map((license, index) => <div key={`${license.name}-${license.id}-${index}`} className="grid grid-cols-[150px_minmax(160px,1fr)_minmax(160px,1fr)_80px_40px_40px] items-center gap-5 border-b border-slate-100 py-5 text-[13px] text-[#0758a6] max-[800px]:grid-cols-1 max-[800px]:gap-3">
          <div className="text-[14px] font-medium">{license.name}</div>
          <label>License Number<input value={license.number} onChange={(event) => update(license.id, "number", event.target.value)} disabled={editing !== license.id} className="mt-2 h-8 w-full border-b border-slate-300 bg-transparent px-1 text-slate-700 outline-none disabled:cursor-default" /></label>
          <label>License Expiry Date<input type="date" value={license.expiry} onChange={(event) => update(license.id, "expiry", event.target.value)} disabled={editing !== license.id} className="mt-2 h-8 w-full border-b border-slate-300 bg-transparent px-1 text-slate-700 outline-none disabled:cursor-default" /></label>
          <label className="grid h-[50px] place-items-center border border-dashed border-[#b8d8ec] text-xs text-slate-400"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => void uploadDocument(license.id, event.target.files?.[0])} className="sr-only" />{license.file ? "Uploaded" : "Upload"}</label>
          <a aria-label={`Download ${license.name}`} href={license.file ? `/api/account/documents/${license.id}/download` : undefined} className={`grid size-9 place-items-center bg-slate-300 text-white ${!license.file ? "pointer-events-none opacity-70" : "hover:bg-slate-400"}`}><DownloadIcon /></a>
          <button type="button" aria-label={`${editing === license.id ? "Save" : "Edit"} ${license.name}`} onClick={() => void toggleEdit(license)} className="grid size-9 place-items-center bg-[#0758a6] text-white hover:bg-[#06447f]"><EditIcon /></button>
        </div>)}
      </div>
    </section>
  );
}

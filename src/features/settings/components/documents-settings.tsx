"use client";

import { useCallback, useEffect, useState } from "react";

type License = {
  id: number;
  name: string;
  number: string;
  expiry: string;
  file: boolean;
  fileName: string | null;
};

type ApiPayload = {
  success?: boolean;
  message?: string;
  data?: { licenses?: unknown; license?: unknown };
  errors?: Record<string, string[]>;
};

type Notice = { text: string; error: boolean };

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

function DownloadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M11 3h2v10.2l3.5-3.5 1.4 1.4-5.9 5.9-5.9-5.9 1.4-1.4 3.5 3.5V3ZM4 19h16v2H4v-2Z" /></svg>;
}

function EditIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none"><path d="m4 16.8-.7 3.9 3.9-.7L19.8 7.4a2 2 0 0 0 0-2.8l-.4-.4a2 2 0 0 0-2.8 0L4 16.8Z" stroke="currentColor" strokeWidth="2" /><path d="m14.8 5.2 4 4" stroke="currentColor" strokeWidth="2" /></svg>;
}

async function readPayload(response: Response): Promise<ApiPayload> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as ApiPayload;
  } catch {
    return { message: "The server returned an invalid response." };
  }
}

function errorMessage(payload: ApiPayload, fallback: string): string {
  const validationError = payload.errors ? Object.values(payload.errors).flat()[0] : undefined;
  return validationError ?? payload.message ?? fallback;
}

function toLicense(value: unknown): License | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "number" || typeof item.name !== "string") return null;

  return {
    id: item.id,
    name: item.name,
    number: typeof item.number === "string" ? item.number : "",
    expiry: typeof item.expiry === "string" ? item.expiry : "",
    file: item.file === true,
    fileName: typeof item.file_name === "string" ? item.file_name : null,
  };
}

async function fetchDocuments(): Promise<License[]> {
  const response = await fetch("/api/account/documents", { cache: "no-store" });
  const payload = await readPayload(response);
  if (!response.ok || !payload.success || !Array.isArray(payload.data?.licenses)) {
    throw new Error(errorMessage(payload, "Documents could not be loaded."));
  }

  return payload.data.licenses.map(toLicense).filter((license): license is License => license !== null);
}

export function DocumentsSettings() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [originalValues, setOriginalValues] = useState<Pick<License, "number" | "expiry"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setLicenses(await fetchDocuments());
    } catch (error) {
      setLicenses([]);
      setLoadError(error instanceof Error ? error.message : "Documents could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetchDocuments()
      .then((loaded) => { if (active) setLicenses(loaded); })
      .catch((error: unknown) => {
        if (!active) return;
        setLicenses([]);
        setLoadError(error instanceof Error ? error.message : "Documents could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  function update(id: number, field: "number" | "expiry", value: string) {
    setLicenses((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function beginEdit(license: License) {
    if (editing !== null && editing !== license.id) {
      setNotice({ text: "Save or cancel the license currently being edited first.", error: true });
      return;
    }
    setOriginalValues({ number: license.number, expiry: license.expiry });
    setEditing(license.id);
    setNotice(null);
  }

  function cancelEdit(id: number) {
    if (originalValues) {
      setLicenses((items) => items.map((item) => item.id === id ? { ...item, ...originalValues } : item));
    }
    setEditing(null);
    setOriginalValues(null);
    setNotice(null);
  }

  async function saveLicense(license: License) {
    setSaving(license.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/account/documents/${license.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_number: license.number || null, expiry_date: license.expiry || null }),
      });
      const payload = await readPayload(response);
      if (!response.ok || !payload.success) {
        throw new Error(errorMessage(payload, "The license could not be saved."));
      }

      const saved = toLicense(payload.data?.license);
      if (saved) setLicenses((items) => items.map((item) => item.id === saved.id ? saved : item));
      setEditing(null);
      setOriginalValues(null);
      setNotice({ text: payload.message ?? "License saved successfully.", error: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "The license could not be saved.", error: true });
    } finally {
      setSaving(null);
    }
  }

  async function uploadDocument(id: number, file: File | undefined) {
    if (!file) return;
    const hasAcceptedExtension = /\.(pdf|jpe?g|png)$/i.test(file.name);
    if ((!ACCEPTED_FILE_TYPES.has(file.type) && !hasAcceptedExtension) || file.size > MAX_FILE_SIZE) {
      setNotice({ text: file.size > MAX_FILE_SIZE ? "The document must be 5 MB or smaller." : "Upload a PDF, JPG, JPEG, or PNG file.", error: true });
      return;
    }

    setUploading(id);
    setNotice(null);
    try {
      const body = new FormData();
      body.append("document", file);
      const response = await fetch(`/api/account/documents/${id}/file`, { method: "POST", body });
      const payload = await readPayload(response);
      if (!response.ok || !payload.success) {
        throw new Error(errorMessage(payload, "The document could not be uploaded."));
      }

      const saved = toLicense(payload.data?.license);
      if (saved) setLicenses((items) => items.map((item) => item.id === saved.id ? saved : item));
      setNotice({ text: payload.message ?? "Document uploaded successfully.", error: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "The document could not be uploaded.", error: true });
    } finally {
      setUploading(null);
    }
  }

  async function addLicense() {
    setAdding(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_type: "Other License" }),
      });
      const payload = await readPayload(response);
      const added = toLicense(payload.data?.license);
      if (!response.ok || !payload.success || !added) {
        throw new Error(errorMessage(payload, "A new license could not be added."));
      }

      setLicenses((items) => [...items, added]);
      setNotice({ text: payload.message ?? "License added successfully.", error: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "A new license could not be added.", error: true });
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1100px] px-5 py-8 sm:px-9 lg:px-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2"><h1 className="text-[27px] font-medium text-[#0795ed]">Documents</h1><span aria-hidden="true" className="text-xl">💡</span></div>
        <button type="button" disabled={adding || loading || loadError !== null} onClick={() => void addLicense()} className="bg-[#079ff0] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0788cf] disabled:cursor-not-allowed disabled:opacity-60">{adding ? "Adding…" : "+ Add other License"}</button>
      </div>
      <p className="mt-3 text-[14px] text-[#064c9c]">GSTIN and PAN options are moved to About Pharmacy page.</p>

      {notice && <div role={notice.error ? "alert" : "status"} className={`mt-5 rounded-lg border px-4 py-3 text-sm ${notice.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{notice.text}</div>}

      <div className="mt-9">
        {loading && <p className="py-8 text-sm text-[#0758a6]">Loading documents…</p>}
        {!loading && loadError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{loadError}</p><button type="button" onClick={() => void loadDocuments()} className="mt-3 rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">Retry</button></div>}
        {!loading && !loadError && licenses.length === 0 && <p className="py-8 text-sm text-slate-600">No license documents are available.</p>}
        {!loading && !loadError && licenses.map((license) => {
          const isEditing = editing === license.id;
          const isSaving = saving === license.id;
          const isUploading = uploading === license.id;
          return <div key={license.id} className="grid grid-cols-[150px_minmax(160px,1fr)_minmax(160px,1fr)_100px_40px_92px] items-center gap-5 border-b border-slate-100 py-5 text-[13px] text-[#0758a6] max-[900px]:grid-cols-1 max-[900px]:gap-3">
            <div className="text-[14px] font-medium">{license.name}</div>
            <label>License Number<input value={license.number} maxLength={120} onChange={(event) => update(license.id, "number", event.target.value)} disabled={!isEditing || isSaving} className="mt-2 h-8 w-full border-b border-slate-300 bg-transparent px-1 text-slate-700 outline-none focus:border-[#0799ed] disabled:cursor-default disabled:text-slate-500" /></label>
            <label>License Expiry Date<input type="date" value={license.expiry} onChange={(event) => update(license.id, "expiry", event.target.value)} disabled={!isEditing || isSaving} className="mt-2 h-8 w-full border-b border-slate-300 bg-transparent px-1 text-slate-700 outline-none focus:border-[#0799ed] disabled:cursor-default disabled:text-slate-500" /></label>
            <label title={license.fileName ?? undefined} className={`grid h-[50px] place-items-center border border-dashed border-[#b8d8ec] px-2 text-center text-xs ${isUploading ? "cursor-wait bg-slate-50 text-slate-500" : "cursor-pointer text-slate-500 hover:border-[#079ff0] hover:text-[#0758a6]"}`}><input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" disabled={isUploading} onChange={(event) => { const input = event.currentTarget; void uploadDocument(license.id, input.files?.[0]).finally(() => { input.value = ""; }); }} className="sr-only" />{isUploading ? "Uploading…" : license.file ? "Replace" : "Upload"}</label>
            <a aria-label={`Download ${license.name}`} title={license.fileName ? `Download ${license.fileName}` : "No document uploaded"} href={license.file ? `/api/account/documents/${license.id}/download` : undefined} className={`grid size-9 place-items-center bg-slate-300 text-white ${!license.file ? "pointer-events-none opacity-60" : "hover:bg-slate-400"}`}><DownloadIcon /></a>
            {isEditing ? <div className="flex gap-2"><button type="button" disabled={isSaving} onClick={() => void saveLicense(license)} className="h-9 rounded bg-[#0758a6] px-3 text-xs font-semibold text-white hover:bg-[#06447f] disabled:opacity-60">{isSaving ? "…" : "Save"}</button><button type="button" disabled={isSaving} onClick={() => cancelEdit(license.id)} className="h-9 rounded border border-slate-300 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Cancel</button></div> : <button type="button" aria-label={`Edit ${license.name}`} onClick={() => beginEdit(license)} className="grid size-9 place-items-center bg-[#0758a6] text-white hover:bg-[#06447f]"><EditIcon /></button>}
          </div>;
        })}
      </div>
    </section>
  );
}

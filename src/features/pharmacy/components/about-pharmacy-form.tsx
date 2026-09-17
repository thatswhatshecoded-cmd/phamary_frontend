"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PharmacyPayload, PharmacyProfile } from "@/features/pharmacy/types";

type EditableKey =
  | "pharmacy_name"
  | "business_subline"
  | "pharmacist_name"
  | "mobile_number"
  | "email"
  | "gstin"
  | "pan"
  | "address_line_1"
  | "address_line_2"
  | "area"
  | "pincode"
  | "city"
  | "state"
  | "country"
  | "latitude"
  | "longitude";

const blankProfile: PharmacyProfile = {
  id: null,
  version: 0,
  pharmacy_name: "",
  business_subline: null,
  pharmacist_name: null,
  mobile_number: null,
  email: null,
  email_verified: false,
  gstin: null,
  pan: null,
  gstin_status: "unverified",
  pan_status: "unverified",
  address_line_1: null,
  address_line_2: null,
  area: null,
  pincode: null,
  city: null,
  state: null,
  country: "India",
  latitude: null,
  longitude: null,
  updated_at: null,
};

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{3}[ABCFGHLJPT][A-Z][0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function firstError(payload: PharmacyPayload): string {
  const validationError = payload.errors ? Object.values(payload.errors).flat()[0] : null;
  return validationError ?? payload.message ?? "The request could not be completed.";
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  maxLength,
  readOnly = false,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "numeric" | "decimal" | "email" | "tel";
  maxLength?: number;
  readOnly?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-[#0758a6]">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value ?? ""}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full border-0 border-b px-1 text-[15px] text-slate-900 outline-none transition focus:border-[#0799ed] focus:ring-0 ${readOnly ? "border-dotted border-slate-300 bg-slate-50 text-slate-500" : "border-slate-300 bg-white"}`}
      />
    </label>
  );
}

function LookupField({
  type,
  value,
  loading,
  onChange,
  onFetch,
}: {
  type: "gstin" | "pan";
  value: string | null;
  loading: boolean;
  onChange: (value: string) => void;
  onFetch: () => void;
}) {
  const label = type === "gstin" ? "GSTIN" : "PAN";
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-medium text-[#0758a6]" htmlFor={type}>{label}</label>
      <div className="flex items-end gap-0">
        <input
          id={type}
          value={value ?? ""}
          maxLength={type === "gstin" ? 15 : 10}
          onChange={(event) => onChange(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          className="h-11 min-w-0 flex-1 border-0 border-b border-slate-300 px-1 uppercase text-slate-900 outline-none focus:border-[#0799ed] focus:ring-0"
        />
        <button
          type="button"
          disabled={loading}
          onClick={onFetch}
          className="h-9 min-w-[145px] bg-[#86cff5] px-5 text-sm font-semibold text-white transition hover:bg-[#21a7ed] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Fetching..." : "Fetch Details"}
        </button>
      </div>
    </div>
  );
}

export function AboutPharmacyForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<PharmacyProfile>(blankProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [lookup, setLookup] = useState<"gstin" | "pan" | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/account/pharmacy", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as PharmacyPayload;
        if (!response.ok || !payload.data?.pharmacy) throw new Error(firstError(payload));
        if (active) setProfile({ ...blankProfile, ...payload.data.pharmacy });
      })
      .catch((error: unknown) => {
        if (active) setMessage({ text: error instanceof Error ? error.message : "The profile could not be loaded.", error: true });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function setField(field: EditableKey, value: string) {
    setProfile((current) => ({ ...current, [field]: value || null }));
    setMessage(null);
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/pharmacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const payload = (await response.json()) as PharmacyPayload;
      if (!response.ok || !payload.data?.pharmacy) throw new Error(firstError(payload));
      setProfile({ ...blankProfile, ...payload.data.pharmacy });
      setMessage({
        text: profile.latitude && profile.longitude
          ? "Pharmacy profile and location saved successfully."
          : payload.message,
        error: false,
      });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "The profile could not be saved.", error: true });
    } finally {
      setSaving(false);
    }
  }

  async function fetchTaxDetails(type: "gstin" | "pan") {
    const value = profile[type]?.trim() ?? "";
    const valid = type === "gstin"
      ? GSTIN_PATTERN.test(value)
      : /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value);
    if (!valid) {
      setMessage({
        text: type === "gstin"
          ? "The GSTIN format is invalid. Please enter a registered GSTIN."
          : "Please enter a valid PAN.",
        error: true,
      });
      return;
    }

    setLookup(type);
    setMessage(null);
    try {
      const response = await fetch(`/api/account/pharmacy/lookup/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: value }),
      });
      const payload = (await response.json()) as PharmacyPayload;
      if (!response.ok || !payload.data?.pharmacy) throw new Error(firstError(payload));
      setProfile((current) => ({ ...current, ...payload.data?.pharmacy, version: current.version }));
      setMessage({ text: payload.message, error: false });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "The details could not be fetched.", error: true });
    } finally {
      setLookup(null);
    }
  }

  function locate() {
    if (!navigator.geolocation) {
      setMessage({ text: "Location services are not available in this browser.", error: true });
      return;
    }

    setLocating(true);
    setMessage({ text: "Finding your current location…", error: false });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(7),
          longitude: position.coords.longitude.toFixed(7),
        }));
        setLocating(false);
        setMessage({ text: "Current location added. Click Save to store it.", error: false });
      },
      (error) => {
        setLocating(false);
        const text = error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Allow it in your browser settings and click Locate again."
            : error.code === error.TIMEOUT
            ? "Finding your location timed out. Click Locate again."
            : "Your current location could not be found. Click Locate again.";
        setMessage({ text, error: true });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function deleteAccount() {
    const confirmation = deleteText.trim().toUpperCase();
    if (confirmation !== "DELETE") return;
    setDeleting(true);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const payload = (await response.json()) as PharmacyPayload;
      if (!response.ok) throw new Error(firstError(payload));
      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "The account could not be deleted.", error: true });
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-[calc(100dvh-72px)] place-items-center text-[#0758a6]">Loading pharmacy profile…</div>;
  }

  return (
    <section className="mx-auto max-w-[1100px] px-5 py-8 sm:px-9 lg:px-12">
      <div className="flex items-center gap-2">
        <h1 className="text-[27px] font-medium text-[#0795ed]">About Pharmacy</h1>
        <span aria-hidden="true" className="text-xl">💡</span>
      </div>
      <p className="mt-6 text-[15px] text-[#064c9c]">Get prefill pharmacy details by adding GSTIN or PAN with some clicks</p>
      <p className="mt-1 flex items-center gap-2 text-sm text-[#064c9c]"><span aria-hidden="true">●</span> You can add Personal PAN if you don&apos;t have a registered GSTIN.</p>

      {message && (
        <div role={message.error ? "alert" : "status"} className={`mt-6 rounded-lg border px-4 py-3 text-sm ${message.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={saveProfile} className="mt-8">
        <div className="grid min-w-0 grid-cols-1 gap-x-11 gap-y-7 lg:grid-cols-2">
          <LookupField type="gstin" value={profile.gstin} loading={lookup === "gstin"} onChange={(value) => setField("gstin", value)} onFetch={() => void fetchTaxDetails("gstin")} />
          <LookupField type="pan" value={profile.pan} loading={lookup === "pan"} onChange={(value) => setField("pan", value)} onFetch={() => void fetchTaxDetails("pan")} />
          <TextField label="Pharmacy Name *" value={profile.pharmacy_name} onChange={(value) => setField("pharmacy_name", value)} />
          <TextField label="Address Line 2" value={profile.address_line_2} onChange={(value) => setField("address_line_2", value)} />
          <TextField label="Business Subline" value={profile.business_subline} onChange={(value) => setField("business_subline", value)} />
          <TextField label="Area" value={profile.area} onChange={(value) => setField("area", value)} />
          <TextField label="Pharmacist / Doctor Name" value={profile.pharmacist_name} onChange={(value) => setField("pharmacist_name", value)} />
          <TextField label="Pincode" value={profile.pincode} inputMode="numeric" maxLength={6} onChange={(value) => setField("pincode", value.replace(/\D/g, ""))} />
          <TextField label="Mobile Number" value={profile.mobile_number} inputMode="tel" maxLength={10} onChange={(value) => setField("mobile_number", value.replace(/\D/g, ""))} />
          <TextField label="City" value={profile.city} onChange={(value) => setField("city", value)} />
          <div>
            <div className="flex items-end">
              <div className="min-w-0 flex-1"><TextField label="Email" type="email" inputMode="email" value={profile.email} onChange={(value) => setField("email", value)} /></div>
              <button type="button" onClick={() => setMessage({ text: "Email verification will be enabled after the mail provider is configured.", error: false })} className="h-9 bg-[#079ff0] px-6 text-sm font-semibold text-white hover:bg-[#0788cf]">{profile.email_verified ? "Verified" : "Verify"}</button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0758a6]">Latitude–Longitude</label>
            <div className="flex items-end gap-3">
              <input aria-label="Latitude" type="number" step="any" min="-90" max="90" value={profile.latitude ?? ""} onChange={(event) => setField("latitude", event.target.value)} placeholder="Latitude" className="h-11 min-w-0 flex-1 border-0 border-b border-slate-300 px-1 text-sm outline-none focus:border-[#0799ed]" />
              <input aria-label="Longitude" type="number" step="any" min="-180" max="180" value={profile.longitude ?? ""} onChange={(event) => setField("longitude", event.target.value)} placeholder="Longitude" className="h-11 min-w-0 flex-1 border-0 border-b border-slate-300 px-1 text-sm outline-none focus:border-[#0799ed]" />
              <button type="button" onClick={locate} disabled={locating} className="h-10 shrink-0 bg-[#079ff0] px-4 text-sm font-semibold text-white hover:bg-[#0788cf] disabled:cursor-wait disabled:opacity-60">{locating ? "Locating…" : "⌖ Locate"}</button>
            </div>
          </div>
          <TextField label="Address" value={profile.address_line_1} onChange={(value) => setField("address_line_1", value)} />
          <TextField label="State" value={profile.state} onChange={(value) => setField("state", value)} />
          <TextField label="Country" value={profile.country} onChange={(value) => setField("country", value)} />
        </div>

        <button type="submit" disabled={saving} className="mt-8 min-w-[100px] rounded bg-[#079ff0] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0788cf] disabled:opacity-60">
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center">
        <div><p className="font-semibold text-red-800">Do you no longer need this account?</p><p className="mt-1 text-xs text-red-600">This permanently deletes your login and sole-owned pharmacy data.</p></div>
        <button type="button" onClick={() => setDeleteOpen(true)} className="rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete Account</button>
      </div>

      {deleteOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 id="delete-title" className="text-xl font-semibold text-slate-900">Delete account permanently?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Type <strong>DELETE</strong> to confirm. This action cannot be undone.</p>
            <input
              autoFocus
              aria-label="Delete confirmation"
              value={deleteText}
              onChange={(event) => setDeleteText(event.target.value.toUpperCase())}
              onKeyDown={(event) => {
                if (event.key === "Enter" && deleteText.trim().toUpperCase() === "DELETE") void deleteAccount();
              }}
              className="mt-4 h-11 w-full rounded border border-slate-300 px-3 uppercase outline-none focus:border-red-500"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setDeleteOpen(false); setDeleteText(""); }} className="rounded border border-slate-300 px-4 py-2 text-sm">Cancel</button>
              <button type="button" disabled={deleteText.trim().toUpperCase() !== "DELETE" || deleting} onClick={() => void deleteAccount()} className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{deleting ? "Deleting…" : "Delete permanently"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

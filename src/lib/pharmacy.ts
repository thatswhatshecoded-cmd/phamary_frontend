export type PharmacyProfile = {
  id: string | null;
  version: number;
  pharmacy_name: string;
  business_subline: string | null;
  pharmacist_name: string | null;
  mobile_number: string | null;
  email: string | null;
  email_verified: boolean;
  gstin: string | null;
  pan: string | null;
  gstin_status: string;
  pan_status: string;
  address_line_1: string | null;
  address_line_2: string | null;
  area: string | null;
  pincode: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  updated_at: string | null;
};

export type PharmacyPayload = {
  success: boolean;
  message: string;
  data?: { pharmacy?: PharmacyProfile };
  errors?: Record<string, string[]>;
};

export const accountSections = [
  { slug: "about-pharmacy", label: "About Pharmacy" },
  { slug: "documents", label: "Documents" },
  { slug: "security", label: "Security" },
  { slug: "plan", label: "Plan" },
  { slug: "password", label: "Password" },
  { slug: "kyc-details", label: "KYC Details" },
  { slug: "agreements", label: "Agreements" },
] as const;

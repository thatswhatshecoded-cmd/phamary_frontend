import { notFound } from "next/navigation";
import { AboutPharmacyForm } from "@/features/pharmacy/components/about-pharmacy-form";
import { DocumentsSettings } from "@/features/settings/components/documents-settings";
import { SecuritySettings } from "@/features/settings/components/security-settings";
import { DeleteAccountPage } from "@/features/settings/components/delete-account-page";
import { AgreementsPage } from "@/features/settings/components/agreements-page";
import { PlanSettings } from "@/features/settings/components/plan-settings";
import { accountSections } from "@/features/settings/config";

export default async function AccountSettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const matched = accountSections.find((item) => item.slug === section);
  if (!matched) notFound();

  if (section === "about-pharmacy") return <AboutPharmacyForm />;
  if (section === "documents") return <DocumentsSettings />;
  if (section === "security") return <SecuritySettings />;
  if (section === "plan") return <PlanSettings />;
  if (section === "delete-account") return <DeleteAccountPage />;
  if (section === "agreements") return <AgreementsPage />;

  return (
    <section className="mx-auto max-w-5xl px-5 py-10 sm:px-10 lg:px-14">
      <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#0b8fea]">Account &amp; Settings</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#063665]">{matched.label}</h1>
      <div className="mt-8 rounded-xl border border-dashed border-[#b7d9ef] bg-[#f4faff] p-8 text-slate-600">
        The {matched.label.toLowerCase()} section is ready. Its detailed fields and workflow will be added to this Laravel API architecture as requirements are finalized.
      </div>
    </section>
  );
}

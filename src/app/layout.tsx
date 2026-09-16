import type { Metadata } from "next";
import "./globals.css";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://phamary-frontend.vercel.app"
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Login | ApniPharma",
    template: "%s | ApniPharma",
  },
  description: "Secure mobile OTP login for ApniPharma.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

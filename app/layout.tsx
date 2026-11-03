import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FINN — Financial Investment Agent",
  description: "Mobile-first financial investment agent for Indian equity investors",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FINN",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0D10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0D10] text-[#E8EAED] antialiased flex justify-center">
        {/* Centered mobile container for desktop testing, 100% width on mobile */}
        <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-[#0B0D10] border-x border-[#23272F]/50 relative pb-20 shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}


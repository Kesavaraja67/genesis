// app/layout.tsx — Root layout with DM Sans, Palette 3 toast, PWA
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Starfield } from "@/components/ui/Starfield";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";

export const metadata: Metadata = {
  title: { default: "Genesis", template: "%s | Genesis" },
  description: "In the beginning, there was a config. Build full-stack apps from a JSON configuration.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4A6C6F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased relative" style={{ fontFamily: "var(--font-body)", background: "var(--bg-base)" }}>
        <Starfield />
        <div className="relative min-h-screen" style={{ zIndex: 1 }}>
          {children}
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
            },
            success: {
              iconTheme: { primary: "#5A9E7A", secondary: "#0D0D0F" },
              style: {
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                borderLeft: "3px solid #5A9E7A",
              },
            },
            error: {
              iconTheme: { primary: "#AF5D63", secondary: "#0D0D0F" },
              style: {
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                borderLeft: "3px solid #AF5D63",
              },
            },
          }}
        />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}

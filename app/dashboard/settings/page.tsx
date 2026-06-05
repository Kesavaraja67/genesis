"use client";
// app/(dashboard)/settings/page.tsx — Settings Page per Palette 3 spec

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Typically you'd call an API to update the user name in the DB here
      // For now we just pretend to update and show the toast
      await update({ name });
      toast.success("Settings updated successfully");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "800px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "var(--tracking-tight)",
            margin: "0 0 4px 0",
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", margin: 0 }}>
          Manage your account preferences and personal information.
        </p>
      </div>

      {/* Settings Card */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
        }}
      >
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 24px 0" }}>
          Profile Details
        </h2>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
            />
            <Input
              label="Email Address"
              value={session?.user?.email ?? ""}
              disabled
              hint="Your email address is managed by your authentication provider and cannot be changed here."
            />
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

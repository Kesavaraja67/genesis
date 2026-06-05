"use client";
// components/dashboard/DeleteAppButton.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export function DeleteAppButton({ appId, appName }: { appId: string; appName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/apps/${appId}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete app"); return; }
      toast.success("App deleted");
      router.push("/dashboard/apps");
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)} id="delete-app-btn">
        Delete App
      </Button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Delete App"
        message={`Are you sure you want to delete "${appName}"? This will permanently delete all models, records, and workflows. This action cannot be undone.`}
        confirmLabel="Delete App"
        loading={loading}
      />
    </>
  );
}

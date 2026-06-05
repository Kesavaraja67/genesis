"use client";

import React, { useState } from "react";
import { UIComponent, ActionConfig } from "@/lib/config/types";
import { Modal } from "@/components/ui/Modal";
import { FallbackComponent } from "../FallbackComponent";
import { FormRenderer } from "./FormRenderer";

export interface ModalRendererProps {
  config: UIComponent;
  appId: string;
  onAction?: (action: ActionConfig, data?: unknown) => void;
}

export function ModalRenderer({ config, appId, onAction }: ModalRendererProps) {
  const [isOpen, setIsOpen] = useState(false);

  const title = config.title || "Modal";
  const triggerLabel = String(config.props?.triggerLabel || "Open Modal");

  const handleAction = (action: ActionConfig, data?: unknown) => {
    if (action.type === "submit") {
      setIsOpen(false);
    }
    onAction?.(action, data);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm"
      >
        {triggerLabel}
      </button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={title}>
        <div className="space-y-4">
          {config.children?.map(child => {
            if (child.type === "form") {
              return <FormRenderer key={child.id} config={child} appId={appId} onAction={handleAction} />;
            }
            return <FallbackComponent key={child.id} config={child} appId={appId} />;
          })}
        </div>
      </Modal>
    </>
  );
}

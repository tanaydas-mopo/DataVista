import { Suspense } from "react";
import { Settings } from "../../../views/Settings";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-textMuted animate-pulse">Loading settings...</div>}>
      <Settings />
    </Suspense>
  );
}

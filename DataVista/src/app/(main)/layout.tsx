import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { AppShell } from "../../components/app-shell/AppShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppShell>
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}

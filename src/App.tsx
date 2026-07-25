import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/app-shell/AppShell";
import { UploadDataset } from "./pages/UploadDataset";
import { DashboardOverview } from "./pages/DashboardOverview";
import { DataSchema } from "./pages/DataSchema";
import { CleanTransform } from "./pages/CleanTransform";
import { VisualBuilder } from "./pages/VisualBuilder";
import { DashboardCanvas } from "./pages/DashboardCanvas";
import { ExportReport } from "./pages/ExportReport";
import { Settings } from "./pages/Settings";
import { AuthProvider } from "./components/auth/AuthProvider";
import { DatasetProvider } from "./context/DatasetContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

function App() {
  return (
    <AuthProvider>
      <DatasetProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/upload-dataset" replace />} />
              <Route path="/upload-dataset" element={<UploadDataset />} />
              <Route path="/dashboard" element={<AppShell><DashboardOverview /></AppShell>} />
              <Route path="/data-schema" element={<AppShell><DataSchema /></AppShell>} />
              <Route path="/clean-transform" element={<AppShell><CleanTransform /></AppShell>} />
              <Route path="/visual-builder" element={<AppShell><VisualBuilder /></AppShell>} />
              <Route path="/dashboard-canvas" element={<AppShell><DashboardCanvas /></AppShell>} />
              <Route path="/export-report" element={<AppShell><ExportReport /></AppShell>} />
              <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DatasetProvider>
    </AuthProvider>
  );
}

export default App;

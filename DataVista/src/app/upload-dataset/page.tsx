import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { UploadDataset } from "../../views/UploadDataset";

export default function UploadDatasetPage() {
  return (
    <ProtectedRoute>
      <UploadDataset />
    </ProtectedRoute>
  );
}

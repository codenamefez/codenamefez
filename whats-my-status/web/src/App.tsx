import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { StatusPage } from "./pages/StatusPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { ProductsPage } from "./pages/admin/ProductsPage";
import { NewProductPage } from "./pages/admin/NewProductPage";
import { EditProductPage } from "./pages/admin/EditProductPage";
import { IncidentsPage } from "./pages/admin/IncidentsPage";
import { NewIncidentPage } from "./pages/admin/NewIncidentPage";
import { IncidentDetailPage } from "./pages/admin/IncidentDetailPage";
import { AnnouncementsPage } from "./pages/admin/AnnouncementsPage";
import { NewAnnouncementPage } from "./pages/admin/NewAnnouncementPage";
import { SettingsPage } from "./pages/admin/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatusPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute>
              <NewProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/incidents"
          element={
            <ProtectedRoute>
              <IncidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/incidents/new"
          element={
            <ProtectedRoute>
              <NewIncidentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/incidents/:id"
          element={
            <ProtectedRoute>
              <IncidentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements/new"
          element={
            <ProtectedRoute>
              <NewAnnouncementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

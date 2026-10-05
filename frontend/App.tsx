import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import StoreLoginPage from "@/pages/StoreLoginPage";
import ManagementDashboard from "@/pages/ManagementDashboard";
import OutletsPage from "@/pages/OutletsPage";
import OutletDetailPage from "@/pages/OutletDetailPage";
import SalesPage from "@/pages/SalesPage";
import InventoryStockPage from "@/pages/InventoryStockPage";
import CompanySupplyPage from "@/pages/CompanySupplyPage";
import CompliancePage from "@/pages/CompliancePage";
import ComplianceDetailPage from "@/pages/ComplianceDetailPage";
import StoreEvidenceReviewPage from "@/pages/StoreEvidenceReviewPage";
import EvidencePage from "@/pages/EvidencePage";
import RiskPage from "@/pages/RiskPage";
import AlertsPage from "@/pages/AlertsPage";
import ComplaintsPage from "@/pages/ComplaintsPage";
import CorrectiveActionsPage from "@/pages/CorrectiveActionsPage";
import ReportsPage from "@/pages/ReportsPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Login Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/store" element={<StoreLoginPage />} />
        <Route path="/store-login" element={<StoreLoginPage />} />

        {/* Protected Dashboard & Module Routes wrapped in AppLayout */}
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ManagementDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          {/* Outlet Directory: Admin, Owner, Officer */}
          <Route
            path="/outlets"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "OFFICER"]}>
                <OutletsPage />
              </ProtectedRoute>
            }
          />

          {/* Single Outlet Dossier: Checks URL isolation (Requirement 6) */}
          <Route
            path="/outlets/:outletId"
            element={
              <ProtectedRoute>
                <OutletDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Operations */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "FRANCHISE"]}>
                <SalesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "OFFICER", "FRANCHISE"]}>
                <InventoryStockPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "OFFICER", "FRANCHISE"]}>
                <CompanySupplyPage />
              </ProtectedRoute>
            }
          />

          {/* Complaints & Risk - Restricted to Admin & Officer */}
          <Route
            path="/compliance"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                <CompliancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compliance/review/:storeId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                <StoreEvidenceReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store-verification/:storeId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                <StoreEvidenceReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compliance/:inspectionId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                <ComplianceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evidence"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "OFFICER", "FRANCHISE"]}>
                <EvidencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                <RiskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                <AlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                <ComplaintsPage />
              </ProtectedRoute>
            }
          />

          {/* Resolution & Audit - Restricted to Admin, Officer, and Store for CAPA */}
          <Route
            path="/corrective-actions"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OFFICER", "FRANCHISE"]}>
                <CorrectiveActionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

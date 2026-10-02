import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import LoginPage from "@/app/login/LoginPage";
import StoreLoginPage from "@/app/login/StoreLoginPage";
import { DashboardPlaceholder } from "@/app/dashboard/DashboardPlaceholder";
import OutletsPage from "@/app/outlets/OutletsPage";
import OutletDetailPage from "@/app/outlets/OutletDetailPage";
import SalesPage from "@/app/sales/SalesPage";
import InventoryPage from "@/app/inventory/InventoryPage";
import CompliancePage from "@/app/compliance/CompliancePage";
import ComplianceDetailPage from "@/app/compliance/ComplianceDetailPage";
import EvidencePage from "@/app/evidence/EvidencePage";
import RiskPage from "@/app/risk/RiskPage";
import AlertsPage from "@/app/alerts/AlertsPage";
import ComplaintsPage from "@/app/complaints/ComplaintsPage";
import CorrectiveActionsPage from "@/app/corrective-actions/CorrectiveActionsPage";
import ReportsPage from "@/app/reports/ReportsPage";

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
                <DashboardPlaceholder />
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
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER"]}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          {/* Compliance & Risk */}
          <Route
            path="/compliance"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "OFFICER", "FRANCHISE"]}>
                <CompliancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compliance/:inspectionId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "OFFICER", "FRANCHISE"]}>
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
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "OFFICER", "FRANCHISE"]}>
                <RiskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "OFFICER", "FRANCHISE"]}>
                <AlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "OFFICER"]}>
                <ComplaintsPage />
              </ProtectedRoute>
            }
          />

          {/* Resolution & Reports */}
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
              <ProtectedRoute allowedRoles={["ADMIN", "OWNER"]}>
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

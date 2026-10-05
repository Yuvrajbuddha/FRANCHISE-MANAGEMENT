import React from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, canAccessOutlet } = useAuth();
  const params = useParams();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-500">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Role-based route access check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Access Denied: Insufficient Permissions
        </h2>
        <p className="text-xs text-slate-500">
          Your current role (<strong className="font-mono">{user.role}</strong>) does not have authorization to view this section.
        </p>
        <div className="rounded-md bg-slate-100 p-3 text-[11px] text-slate-600 text-left space-y-1">
          <p className="font-semibold">Required Role(s): {allowedRoles.join(", ")}</p>
          <p>Logged in as: {user.name} ({user.email})</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Go Back
        </Button>
      </div>
    );
  }

  // 2. Strict Outlet-level Isolation (Requirement 6: Prevent franchise users from accessing another outlet by changing URL)
  const targetOutletId = params.outletId;
  if (targetOutletId && !canAccessOutlet(targetOutletId)) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Security Violation: Franchise Isolation
        </h2>
        <p className="text-xs text-slate-600">
          Franchise partners are strictly restricted to their assigned outlet. You cannot view or modify data for outlet <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-red-700">{targetOutletId}</code>.
        </p>
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 text-left">
          <p className="font-semibold">Your Assigned Scope:</p>
          <p className="font-mono">{user.assignedOutletName || user.assignedOutletId || "Unassigned"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => (window.location.href = `/outlets/${user.assignedOutletId || ""}`)}>
          Go to My Assigned Outlet
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

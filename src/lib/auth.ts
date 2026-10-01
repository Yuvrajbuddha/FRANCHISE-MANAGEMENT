import jwt from "jsonwebtoken";
import { UserRole } from "@/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedOutletId?: string; // For FRANCHISE role: restricted to this outlet only
  assignedOutletName?: string;
  companyId: string;
}

export interface UserPermissions {
  canManageUsers: boolean;
  canManageOutlets: boolean;
  canViewAllOutlets: boolean;
  canViewAllReports: boolean;
  canViewFinancials: boolean; // EBITDA, Gross revenue
  canEditOperationalData: boolean; // Sales submission, inventory update
  canAuditCompliance: boolean;
  canReviewCCTV: boolean;
  canVerifyObservations: boolean;
  canCreateCAPA: boolean;
  canCloseCases: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  ADMIN: {
    canManageUsers: true,
    canManageOutlets: true,
    canViewAllOutlets: true,
    canViewAllReports: true,
    canViewFinancials: true,
    canEditOperationalData: true,
    canAuditCompliance: true,
    canReviewCCTV: true,
    canVerifyObservations: true,
    canCreateCAPA: true,
    canCloseCases: true,
  },
  OWNER: {
    canManageUsers: false,
    canManageOutlets: false,
    canViewAllOutlets: true,
    canViewAllReports: true,
    canViewFinancials: true,
    canEditOperationalData: false, // Explicit rule: Cannot edit outlet operational data
    canAuditCompliance: false,
    canReviewCCTV: true,
    canVerifyObservations: false,
    canCreateCAPA: false,
    canCloseCases: false,
  },
  FRANCHISE: {
    canManageUsers: false,
    canManageOutlets: false,
    canViewAllOutlets: false, // Access only assigned outlet
    canViewAllReports: false,
    canViewFinancials: false, // Only view own outlet numbers
    canEditOperationalData: true, // Submit sales, maintain inventory
    canAuditCompliance: false,
    canReviewCCTV: false,
    canVerifyObservations: false,
    canCreateCAPA: false,
    canCloseCases: false,
  },
  OFFICER: {
    canManageUsers: false,
    canManageOutlets: false,
    canViewAllOutlets: true,
    canViewAllReports: true,
    canViewFinancials: false,
    canEditOperationalData: false,
    canAuditCompliance: true,
    canReviewCCTV: true,
    canVerifyObservations: true,
    canCreateCAPA: true,
    canCloseCases: true,
  },
};

export const DEMO_USERS: (AuthUser & { passwordHash: string })[] = [
  {
    id: "usr-admin-01",
    email: "admin@aurafoods.com",
    name: "Vikram Malhotra",
    role: "ADMIN",
    companyId: "cmp-aura-01",
    passwordHash: "admin123",
  },
  {
    id: "usr-owner-02",
    email: "owner@aurafoods.com",
    name: "Rajesh Singhania",
    role: "OWNER",
    companyId: "cmp-aura-01",
    passwordHash: "owner123",
  },
  {
    id: "usr-franchise-03",
    email: "franchise.lucknow@aurafoods.com",
    name: "Pooja Verma",
    role: "FRANCHISE",
    assignedOutletId: "OUT-042",
    assignedOutletName: "Hazratganj Flagship (Lucknow)",
    companyId: "cmp-aura-01",
    passwordHash: "franchise123",
  },
  {
    id: "usr-officer-04",
    email: "officer.sen@aurafoods.com",
    name: "Arunava Sen",
    role: "OFFICER",
    companyId: "cmp-aura-01",
    passwordHash: "officer123",
  },
];

const JWT_SECRET = process.env.JWT_SECRET || "franchise-saas-enterprise-secret-key-2026";

export function signAuthToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedOutletId: user.assignedOutletId,
      assignedOutletName: user.assignedOutletName,
      companyId: user.companyId,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyAuthToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

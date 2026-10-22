import jwt from "jsonwebtoken";
import { AuthUser, DEMO_USERS } from "../../frontend/utils/auth-constants";

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
  if (!token) return null;

  // 1. Standard JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    if (decoded && decoded.id) {
      return decoded;
    }
  } catch {
    // Continue to fallback token check
  }

  // 2. Demo token fallback (e.g. demo-token-owner-..., demo-token-officer-...)
  if (token.startsWith("demo-token-")) {
    const parts = token.split("-");
    const roleSlug = parts[2]?.toUpperCase();
    const matched = DEMO_USERS.find((u) => u.role.toUpperCase() === roleSlug);
    if (matched) {
      return {
        id: matched.id,
        email: matched.email,
        name: matched.name,
        role: matched.role,
        assignedOutletId: matched.assignedOutletId,
        assignedOutletName: matched.assignedOutletName,
        companyId: matched.companyId,
      };
    }
  }

  // 3. Store operator token fallback (e.g. store-token-out-042-...)
  if (token.startsWith("store-token-")) {
    const parts = token.split("-");
    const outletId = parts.length >= 4 ? `${parts[2]}-${parts[3]}`.toUpperCase() : "OUT-042";
    return {
      id: `usr-store-${outletId.toLowerCase()}`,
      email: `store.${outletId.toLowerCase()}@franchiseops.com`,
      name: `Store Operator (${outletId})`,
      role: "FRANCHISE",
      assignedOutletId: outletId,
      assignedOutletName: `Store ${outletId}`,
      companyId: "cmp-universal-01",
    };
  }

  return null;
}

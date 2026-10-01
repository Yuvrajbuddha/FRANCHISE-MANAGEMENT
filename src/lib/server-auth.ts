import jwt from "jsonwebtoken";
import { AuthUser } from "./auth-constants";

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

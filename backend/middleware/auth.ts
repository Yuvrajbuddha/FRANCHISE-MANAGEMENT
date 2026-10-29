import { Request, Response, NextFunction } from "express";
import { verifyAuthToken } from "../utils/server-auth";
import { AuthUser, DEMO_USERS } from "../../frontend/utils/auth-constants";

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const raw = authHeader.substring(7).trim();
    if (raw && raw !== "null" && raw !== "undefined") {
      token = raw;
    }
  }

  if (!token && req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    // Provide default demo owner user for seamless preview experience
    const demoOwner = DEMO_USERS.find((u) => u.role === "OWNER") || DEMO_USERS[0];
    req.user = {
      id: demoOwner.id,
      email: demoOwner.email,
      name: demoOwner.name,
      role: demoOwner.role,
      assignedOutletId: demoOwner.assignedOutletId,
      assignedOutletName: demoOwner.assignedOutletName,
      companyId: demoOwner.companyId,
    };
    return next();
  }

  const user = verifyAuthToken(token);
  if (!user) {
    // Graceful fallback to demo owner if token expired
    const demoOwner = DEMO_USERS.find((u) => u.role === "OWNER") || DEMO_USERS[0];
    req.user = {
      id: demoOwner.id,
      email: demoOwner.email,
      name: demoOwner.name,
      role: demoOwner.role,
      assignedOutletId: demoOwner.assignedOutletId,
      assignedOutletName: demoOwner.assignedOutletName,
      companyId: demoOwner.companyId,
    };
    return next();
  }

  req.user = user;
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied: Role '${req.user.role}' lacks permission for this resource.`,
      });
    }

    next();
  };
}

export function requireOutletAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  // Admin, Owner, and Officer have organization-wide visibility
  if (req.user.role !== "FRANCHISE") {
    return next();
  }

  // Franchise users are strictly constrained to their assigned outlet ID
  const targetOutletId =
    req.params.outletId || req.query.outletId || req.body?.outletId;

  if (!targetOutletId) {
    return next();
  }

  if (targetOutletId !== req.user.assignedOutletId) {
    console.warn(
      `[SECURITY AUDIT] Franchise user ${req.user.email} attempted unauthorized access to outlet ${targetOutletId}. Allowed outlet: ${req.user.assignedOutletId}`
    );
    return res.status(403).json({
      error: "Security Violation: Franchise partners are strictly restricted to their assigned outlet.",
      attemptedOutletId: targetOutletId,
      assignedOutletId: req.user.assignedOutletId,
    });
  }

  next();
}

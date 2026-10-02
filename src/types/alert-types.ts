export const ALERT_TYPES = [
  "Sales anomaly",
  "Inventory mismatch",
  "Repeated compliance issues",
  "Increased complaints",
  "CCTV evidence requiring review",
  "Operational deviations",
  "Sudden performance deterioration",
  "Unresolved corrective actions",
] as const;

export type AlertType = typeof ALERT_TYPES[number];

export const ALERT_SEVERITIES = [
  "LOW",
  "MODERATE",
  "ELEVATED",
  "HIGH",
  "CRITICAL",
] as const;

export type AlertSeverity = typeof ALERT_SEVERITIES[number];

export interface OutletAlertItem {
  id: number;
  alertId: string;
  outletId: string;
  type: AlertType;
  severity: AlertSeverity;
  priority: string;
  category: string;
  message: string;
  status: "NEW" | "REVIEWED" | "IN_PROGRESS" | "RESOLVED";
  riskScore?: number | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdDate: string;
  timestamp: string;
  resolved: boolean;
}

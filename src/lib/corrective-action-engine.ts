import { db } from "../db/index.ts";
import {
  outletCorrectiveActions,
  correctiveActionHistory,
  outletAlerts,
} from "../db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import {
  CorrectiveActionItem,
  CorrectiveActionHistoryEntry,
  CapaStatus,
  WorkflowStage,
} from "../types/corrective-action-types";

/**
 * Check and flag overdue actions across the database.
 * If deadline < today and status is not COMPLETED or CLOSED, updates status to OVERDUE
 * and generates an alert in outlet_alerts.
 */
export async function checkAndFlagOverdueActions(): Promise<number> {
  const allActions = await db.select().from(outletCorrectiveActions);
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  let updatedCount = 0;

  for (const act of allActions) {
    if (act.status !== "COMPLETED" && act.status !== "CLOSED") {
      const isPastDeadline = act.deadline < todayStr;
      if (isPastDeadline && act.status !== "OVERDUE") {
        // Update status to OVERDUE
        await db
          .update(outletCorrectiveActions)
          .set({
            status: "OVERDUE",
            currentStage: "Deadline",
            updatedAt: new Date(),
          })
          .where(eq(outletCorrectiveActions.actionId, act.actionId));

        // Record history log
        await db.insert(correctiveActionHistory).values({
          actionId: act.actionId,
          outletId: act.outletId,
          previousStatus: act.status,
          newStatus: "OVERDUE",
          stage: "Deadline Exceeded",
          performedBy: "System SLA Watchdog",
          remarks: `Action surpassed target deadline (${act.deadline}). Escalated to OVERDUE status.`,
          timestamp: nowStr,
        });

        // Create alert in outlet_alerts for overdue actions
        try {
          await db.insert(outletAlerts).values({
            alertId: `ALT-CAPA-OVD-${Date.now().toString().slice(-5)}`,
            outletId: act.outletId,
            type: "Unresolved corrective actions",
            severity: "HIGH",
            priority: "Prioritized officer review",
            category: "CAPA Overdue",
            message: `Overdue CAPA Action ${act.actionId}: "${act.issue}" past deadline (${act.deadline}). Assigned to: ${act.assignedPerson}. Immediate escalation required.`,
            status: "NEW",
            createdDate: todayStr,
            timestamp: nowStr,
            resolved: false,
          });
        } catch {
          // ignore duplicate alert error
        }

        updatedCount++;
      }
    }
  }

  return updatedCount;
}

/**
 * Seed initial sample Corrective Actions across the workflow if table is empty
 */
export async function seedInitialCorrectiveActions() {
  const existing = await db.select().from(outletCorrectiveActions);
  if (existing.length > 0) return;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const pastDateStr = "2026-09-28";
  const futureDateStr = "2026-10-15";
  const farFutureDateStr = "2026-10-25";

  const initialItems = [
    {
      actionId: "CAPA-2026-042-01",
      outletId: "OUT-042",
      issue: "Chiller Temperature Reading Exceeded SOP Threshold (+8.5°C vs standard 4°C)",
      requiredAction: "Inspect door magnetic gasket seal, recalibrate digital sensor probe, and log 48-hr hourly manual verification temps.",
      assignedPerson: "Vikram Malhotra (Store GM)",
      deadline: pastDateStr, // OVERDUE
      status: "OVERDUE" as CapaStatus,
      currentStage: "Deadline",
      priority: "CRITICAL" as const,
      category: "Cold Chain Hygiene",
      evidence: "HVAC contractor inspection invoice and replacement gasket dispatch receipt.",
      evidenceSubmittedBy: "Vikram Malhotra",
      evidenceSubmittedAt: "2026-09-29 16:30",
      verificationNotes: "Awaiting final officer physical thermometer spot-check verification.",
      verifiedBy: null,
      verifiedAt: null,
      verificationDecision: "PENDING" as const,
      inspectionId: "INS-2026-042",
      createdBy: "Officer Ananya Roy",
    },
    {
      actionId: "CAPA-2026-042-02",
      outletId: "OUT-042",
      issue: "Staff Refresher Training on Double-Bag Packaging & Anti-Tamper Seals",
      requiredAction: "Conduct 30-minute mandatory training module for all kitchen shift crews; obtain signed roster.",
      assignedPerson: "Rahul Sharma (Shift Lead)",
      deadline: futureDateStr,
      status: "IN_PROGRESS" as CapaStatus,
      currentStage: "Corrective Action Assigned",
      priority: "HIGH" as const,
      category: "Packaging & Quality",
      evidence: null,
      evidenceSubmittedBy: null,
      evidenceSubmittedAt: null,
      verificationNotes: null,
      verifiedBy: null,
      verifiedAt: null,
      verificationDecision: null,
      inspectionId: "INS-2026-043",
      createdBy: "Officer Ananya Roy",
    },
    {
      actionId: "CAPA-2026-089-01",
      outletId: "OUT-089",
      issue: "Unverified CCTV Prep Counter Camera Alignment Obstructed by Hanging Menu Board",
      requiredAction: "Adjust camera mounting bracket to ensure unobstructed 180° field-of-view of assembly table.",
      assignedPerson: "Priya Nair (Store Manager)",
      deadline: futureDateStr,
      status: "PENDING_VERIFICATION" as CapaStatus,
      currentStage: "New Evidence Submitted",
      priority: "HIGH" as const,
      category: "Surveillance Compliance",
      evidence: "High-resolution photo showing re-angled CAM-01 mounting with clear prep line visibility.",
      evidenceSubmittedBy: "Priya Nair",
      evidenceSubmittedAt: "2026-10-01 11:20",
      verificationNotes: "Officer review in progress; field test camera feed matches compliance benchmark.",
      verifiedBy: null,
      verifiedAt: null,
      verificationDecision: "PENDING" as const,
      inspectionId: "INS-2026-089",
      createdBy: "Officer Sameer Sen",
    },
    {
      actionId: "CAPA-2026-114-01",
      outletId: "OUT-114",
      issue: "Discrepancy in Physical vs Recorded Inventory for Frozen Patty Premium",
      requiredAction: "Perform full physical recount of stock in presence of Area Audit Manager; verify waste disposal logs.",
      assignedPerson: "Kavita Reddy (Store GM)",
      deadline: farFutureDateStr,
      status: "OPEN" as CapaStatus,
      currentStage: "Violation Confirmed",
      priority: "MEDIUM" as const,
      category: "Inventory Controls",
      evidence: null,
      evidenceSubmittedBy: null,
      evidenceSubmittedAt: null,
      verificationNotes: null,
      verifiedBy: null,
      verifiedAt: null,
      verificationDecision: null,
      inspectionId: "INS-2026-114",
      createdBy: "Audit Specialist Rajesh V",
    },
    {
      actionId: "CAPA-2026-019-01",
      outletId: "OUT-019",
      issue: "Handwash Station Dispenser Empty During Lunch Peak Rush",
      requiredAction: "Refill antibacterial foam dispenser, install auxiliary backup canister, and update opening checklist.",
      assignedPerson: "Amitabh Verma (Store GM)",
      deadline: "2026-09-25",
      status: "CLOSED" as CapaStatus,
      currentStage: "Issue Closed",
      priority: "MEDIUM" as const,
      category: "Hygiene & Sanitation",
      evidence: "Photographic timestamp showing refilled automatic soap dispenser and stocked secondary cartridge.",
      evidenceSubmittedBy: "Amitabh Verma",
      evidenceSubmittedAt: "2026-09-26 09:15",
      verificationNotes: "Verified compliant during unannounced remote visual audit. Soap level at 100%.",
      verifiedBy: "Officer Ananya Roy",
      verifiedAt: "2026-09-26 14:00",
      verificationDecision: "APPROVED" as const,
      inspectionId: "INS-2026-019",
      createdBy: "Officer Ananya Roy",
    },
  ];

  for (const item of initialItems) {
    await db.insert(outletCorrectiveActions).values({
      actionId: item.actionId,
      outletId: item.outletId,
      issue: item.issue,
      requiredAction: item.requiredAction,
      assignedPerson: item.assignedPerson,
      deadline: item.deadline,
      status: item.status,
      currentStage: item.currentStage,
      priority: item.priority,
      category: item.category,
      evidence: item.evidence,
      evidenceSubmittedBy: item.evidenceSubmittedBy,
      evidenceSubmittedAt: item.evidenceSubmittedAt,
      verificationNotes: item.verificationNotes,
      verifiedBy: item.verifiedBy,
      verifiedAt: item.verifiedAt,
      verificationDecision: item.verificationDecision,
      inspectionId: item.inspectionId,
      title: item.issue,
      assignedTo: item.assignedPerson,
      dueDate: item.deadline,
      createdBy: item.createdBy,
    });

    // Seed audit trail history
    await db.insert(correctiveActionHistory).values({
      actionId: item.actionId,
      outletId: item.outletId,
      previousStatus: "OPEN",
      newStatus: item.status,
      stage: item.currentStage,
      performedBy: item.createdBy,
      remarks: `Corrective action initiated for "${item.issue}". Target deadline: ${item.deadline}.`,
      evidenceDetails: item.evidence,
      timestamp: "2026-09-24 10:00",
    });

    if (item.evidence) {
      await db.insert(correctiveActionHistory).values({
        actionId: item.actionId,
        outletId: item.outletId,
        previousStatus: "IN_PROGRESS",
        newStatus: item.status,
        stage: "New Evidence Submitted",
        performedBy: item.evidenceSubmittedBy || "Store Manager",
        remarks: `Evidence uploaded: ${item.evidence}`,
        evidenceDetails: item.evidence,
        timestamp: item.evidenceSubmittedAt || "2026-09-26 09:15",
      });
    }

    if (item.verifiedBy) {
      await db.insert(correctiveActionHistory).values({
        actionId: item.actionId,
        outletId: item.outletId,
        previousStatus: "PENDING_VERIFICATION",
        newStatus: "CLOSED",
        stage: "Officer Verification & Closure",
        performedBy: item.verifiedBy,
        remarks: item.verificationNotes || "Verified compliant.",
        evidenceDetails: null,
        timestamp: item.verifiedAt || "2026-09-26 14:00",
      });
    }
  }
}

/**
 * Transition Corrective Action along workflow stages and record history
 */
export async function transitionCorrectiveAction(
  actionId: string,
  newStage: WorkflowStage,
  newStatus: CapaStatus,
  user: { name: string; email: string; role: string },
  remarks: string,
  evidence?: string,
  verificationDecision?: "APPROVED" | "REJECTED" | "PENDING"
) {
  const normActionId = actionId.toUpperCase().trim();
  const [existing] = await db
    .select()
    .from(outletCorrectiveActions)
    .where(eq(outletCorrectiveActions.actionId, normActionId));

  if (!existing) {
    throw new Error(`Corrective Action ${normActionId} not found.`);
  }

  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

  const updatePayload: Record<string, any> = {
    currentStage: newStage,
    status: newStatus,
    updatedAt: new Date(),
  };

  if (evidence) {
    updatePayload.evidence = evidence;
    updatePayload.evidenceSubmittedBy = `${user.name} (${user.email})`;
    updatePayload.evidenceSubmittedAt = nowStr;
  }

  if (verificationDecision) {
    updatePayload.verificationDecision = verificationDecision;
    updatePayload.verificationNotes = remarks;
    updatePayload.verifiedBy = `${user.name} (${user.email})`;
    updatePayload.verifiedAt = nowStr;
  }

  const [updated] = await db
    .update(outletCorrectiveActions)
    .set(updatePayload)
    .where(eq(outletCorrectiveActions.actionId, normActionId))
    .returning();

  // Immutable history log
  await db.insert(correctiveActionHistory).values({
    actionId: normActionId,
    outletId: existing.outletId,
    previousStatus: existing.status,
    newStatus,
    stage: newStage,
    performedBy: `${user.name} (${user.role})`,
    remarks: remarks || `Transitioned to stage "${newStage}". Status: ${newStatus}`,
    evidenceDetails: evidence || null,
    timestamp: nowStr,
  });

  return updated;
}

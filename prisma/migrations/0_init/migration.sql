-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OWNER', 'FRANCHISE', 'OFFICER');

-- CreateEnum
CREATE TYPE "OperatingModel" AS ENUM ('COCO', 'FOCO');

-- CreateEnum
CREATE TYPE "OutletStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'PROBATION');

-- CreateEnum
CREATE TYPE "SupplyStatus" AS ENUM ('DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'RETURNED');

-- CreateEnum
CREATE TYPE "InventoryReviewStatus" AS ENUM ('PENDING', 'VERIFIED', 'DISCREPANCY_FLAGGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ViolationCategory" AS ENUM ('HYGIENE', 'SERVICE_QUALITY', 'OPERATIONAL_STANDARDS', 'STAFF_COMPLIANCE', 'SAFETY_CHECKS', 'STORE_CLEANLINESS', 'PROCESS_ADHERENCE');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OfficerVerificationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'MODIFIED');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('HYGIENE', 'FOOD_QUALITY', 'SERVICE', 'BILLING', 'STAFF_BEHAVIOR', 'DELAY', 'OTHER');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CorrectiveActionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'COMPLETED', 'CLOSED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('SALES_ANOMALY', 'INVENTORY_MISMATCH', 'COMPLIANCE_VIOLATION', 'CCTV_REVIEW_REQUIRED', 'UNRESOLVED_ACTION', 'PERFORMANCE_DROP', 'HIGH_COMPLAINT_VOLUME');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'OFFICER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "registrationNumber" TEXT,
    "gstNumber" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "operatingModel" "OperatingModel" NOT NULL,
    "status" "OutletStatus" NOT NULL DEFAULT 'ACTIVE',
    "address" TEXT,
    "phone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "assignedUserId" TEXT,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supply" (
    "id" TEXT NOT NULL,
    "supplyNumber" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "batch" TEXT NOT NULL,
    "supplyDate" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" "SupplyStatus" NOT NULL DEFAULT 'RECEIVED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Supply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "periodDate" TIMESTAMP(3) NOT NULL,
    "openingStock" DOUBLE PRECISION NOT NULL,
    "receivedStock" DOUBLE PRECISION NOT NULL,
    "soldQuantity" DOUBLE PRECISION NOT NULL,
    "closingStock" DOUBLE PRECISION NOT NULL,
    "actualPhysicalStock" DOUBLE PRECISION NOT NULL,
    "variance" DOUBLE PRECISION NOT NULL,
    "variancePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewStatus" "InventoryReviewStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outletId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outletId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceInspection" (
    "id" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outletId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,

    CONSTRAINT "ComplianceInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceObservation" (
    "id" TEXT NOT NULL,
    "violationCategory" "ViolationCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "SeverityLevel" NOT NULL DEFAULT 'MEDIUM',
    "reviewerNotes" TEXT,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "evidenceId" TEXT,

    CONSTRAINT "ComplianceObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "videoReference" TEXT,
    "frameReference" TEXT,
    "timestamp" TEXT NOT NULL,
    "aiObservation" TEXT NOT NULL,
    "aiConfidence" DOUBLE PRECISION,
    "officerVerificationStatus" "OfficerVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "officerNotes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outletId" TEXT NOT NULL,
    "verifiedById" TEXT,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "complaintNumber" TEXT NOT NULL,
    "category" "ComplaintCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "SeverityLevel" NOT NULL DEFAULT 'MEDIUM',
    "date" TIMESTAMP(3) NOT NULL,
    "customerContact" TEXT,
    "resolutionStatus" "ResolutionStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outletId" TEXT NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "componentScores" TEXT NOT NULL,
    "riskFactors" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "previousScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outletId" TEXT NOT NULL,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "requiredAction" TEXT NOT NULL,
    "assignedPerson" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "CorrectiveActionStatus" NOT NULL DEFAULT 'OPEN',
    "verification" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "resolutionEvidenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outletId" TEXT NOT NULL,
    "observationId" TEXT,
    "assignedUserId" TEXT,
    "verifiedById" TEXT,

    CONSTRAINT "CorrectiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MODERATE',
    "message" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "outletId" TEXT NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Outlet_outletId_key" ON "Outlet"("outletId");

-- CreateIndex
CREATE INDEX "Outlet_city_idx" ON "Outlet"("city");

-- CreateIndex
CREATE INDEX "Outlet_operatingModel_idx" ON "Outlet"("operatingModel");

-- CreateIndex
CREATE INDEX "Outlet_status_idx" ON "Outlet"("status");

-- CreateIndex
CREATE INDEX "Outlet_companyId_idx" ON "Outlet"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_productId_key" ON "Product"("productId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Supply_supplyNumber_key" ON "Supply"("supplyNumber");

-- CreateIndex
CREATE INDEX "Supply_outletId_idx" ON "Supply"("outletId");

-- CreateIndex
CREATE INDEX "Supply_productId_idx" ON "Supply"("productId");

-- CreateIndex
CREATE INDEX "Supply_companyId_idx" ON "Supply"("companyId");

-- CreateIndex
CREATE INDEX "Supply_supplyDate_idx" ON "Supply"("supplyDate");

-- CreateIndex
CREATE INDEX "Inventory_outletId_idx" ON "Inventory"("outletId");

-- CreateIndex
CREATE INDEX "Inventory_productId_idx" ON "Inventory"("productId");

-- CreateIndex
CREATE INDEX "Inventory_periodDate_idx" ON "Inventory"("periodDate");

-- CreateIndex
CREATE INDEX "Inventory_reviewStatus_idx" ON "Inventory"("reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_saleId_key" ON "Sale"("saleId");

-- CreateIndex
CREATE INDEX "Sale_outletId_idx" ON "Sale"("outletId");

-- CreateIndex
CREATE INDEX "Sale_productId_idx" ON "Sale"("productId");

-- CreateIndex
CREATE INDEX "Sale_date_idx" ON "Sale"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceInspection_inspectionNumber_key" ON "ComplianceInspection"("inspectionNumber");

-- CreateIndex
CREATE INDEX "ComplianceInspection_outletId_idx" ON "ComplianceInspection"("outletId");

-- CreateIndex
CREATE INDEX "ComplianceInspection_reviewerId_idx" ON "ComplianceInspection"("reviewerId");

-- CreateIndex
CREATE INDEX "ComplianceInspection_inspectionDate_idx" ON "ComplianceInspection"("inspectionDate");

-- CreateIndex
CREATE INDEX "ComplianceInspection_status_idx" ON "ComplianceInspection"("status");

-- CreateIndex
CREATE INDEX "ComplianceObservation_inspectionId_idx" ON "ComplianceObservation"("inspectionId");

-- CreateIndex
CREATE INDEX "ComplianceObservation_violationCategory_idx" ON "ComplianceObservation"("violationCategory");

-- CreateIndex
CREATE INDEX "ComplianceObservation_severity_idx" ON "ComplianceObservation"("severity");

-- CreateIndex
CREATE INDEX "ComplianceObservation_status_idx" ON "ComplianceObservation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_evidenceId_key" ON "Evidence"("evidenceId");

-- CreateIndex
CREATE INDEX "Evidence_outletId_idx" ON "Evidence"("outletId");

-- CreateIndex
CREATE INDEX "Evidence_officerVerificationStatus_idx" ON "Evidence"("officerVerificationStatus");

-- CreateIndex
CREATE INDEX "Evidence_createdAt_idx" ON "Evidence"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_complaintNumber_key" ON "Complaint"("complaintNumber");

-- CreateIndex
CREATE INDEX "Complaint_outletId_idx" ON "Complaint"("outletId");

-- CreateIndex
CREATE INDEX "Complaint_category_idx" ON "Complaint"("category");

-- CreateIndex
CREATE INDEX "Complaint_severity_idx" ON "Complaint"("severity");

-- CreateIndex
CREATE INDEX "Complaint_resolutionStatus_idx" ON "Complaint"("resolutionStatus");

-- CreateIndex
CREATE INDEX "Complaint_date_idx" ON "Complaint"("date");

-- CreateIndex
CREATE INDEX "RiskAssessment_outletId_idx" ON "RiskAssessment"("outletId");

-- CreateIndex
CREATE INDEX "RiskAssessment_riskLevel_idx" ON "RiskAssessment"("riskLevel");

-- CreateIndex
CREATE INDEX "RiskAssessment_date_idx" ON "RiskAssessment"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CorrectiveAction_actionId_key" ON "CorrectiveAction"("actionId");

-- CreateIndex
CREATE INDEX "CorrectiveAction_outletId_idx" ON "CorrectiveAction"("outletId");

-- CreateIndex
CREATE INDEX "CorrectiveAction_status_idx" ON "CorrectiveAction"("status");

-- CreateIndex
CREATE INDEX "CorrectiveAction_deadline_idx" ON "CorrectiveAction"("deadline");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_alertId_key" ON "Alert"("alertId");

-- CreateIndex
CREATE INDEX "Alert_outletId_idx" ON "Alert"("outletId");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "Outlet" ADD CONSTRAINT "Outlet_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outlet" ADD CONSTRAINT "Outlet_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceInspection" ADD CONSTRAINT "ComplianceInspection_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceInspection" ADD CONSTRAINT "ComplianceInspection_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceObservation" ADD CONSTRAINT "ComplianceObservation_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "ComplianceInspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceObservation" ADD CONSTRAINT "ComplianceObservation_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "ComplianceObservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


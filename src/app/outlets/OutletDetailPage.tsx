import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Store,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Lock,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OutletDetailPage() {
  const { outletId } = useParams<{ outletId: string }>();
  const { user, canAccessOutlet } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [salesQuantity, setSalesQuantity] = useState("45");
  const [salesRevenue, setSalesRevenue] = useState("24500");
  const [salesMessage, setSalesMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOutlet() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("franchise_auth_token");
        const res = await fetch(`/api/outlets/${outletId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to load outlet");
        } else {
          setData(json.outlet);
        }
      } catch (e: any) {
        setError("Network error fetching outlet details");
      } finally {
        setLoading(false);
      }
    }
    fetchOutlet();
  }, [outletId]);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalesMessage(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/outlets/${outletId}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          quantity: Number(salesQuantity),
          revenue: Number(salesRevenue),
          productId: "PRD-101",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSalesMessage(`Error: ${json.error}`);
      } else {
        setSalesMessage(`Success: ${json.message}`);
      }
    } catch {
      setSalesMessage("Failed to record sales.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading outlet dossier...</div>;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Denied by Server</h2>
        <p className="text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>
        <div className="text-xs text-slate-500">
          {user?.role === "FRANCHISE" && (
            <p>
              Your assigned outlet is <strong className="font-mono text-slate-900">{user.assignedOutletId}</strong>. Changing the URL to another outlet is strictly rejected by server authorization.
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/outlets/${user?.assignedOutletId || "OUT-042"}`)}>
          Go to My Authorized Outlet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link to="/outlets" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {data.name}
              </h1>
              <Badge variant="outline" className="font-mono text-[10px]">
                {data.outletId}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-slate-100">
                {data.operatingModel}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {data.city} · Assigned Manager: {data.manager}
            </p>
          </div>
        </div>

        {/* Security Isolation Indicator */}
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="text-[11px] text-slate-500">Viewing as:</span>
          <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
            {user?.role} ({user?.name})
          </span>
        </div>
      </div>

      {/* URL Tamper / Authorization Test Box */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 text-xs">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Requirement 6: URL Tamper & Franchise Isolation Test
            </span>
            <p className="text-[11px] text-indigo-700 mt-1">
              Test accessing other outlets directly via URL parameters. If logged in as <strong>FRANCHISE</strong>, only <strong>OUT-042</strong> is permitted. Any URL tampering to <strong>OUT-089</strong> or <strong>OUT-019</strong> is blocked at the API & router layer.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {["OUT-042", "OUT-089", "OUT-019", "OUT-114"].map((id) => (
            <button
              key={id}
              onClick={() => navigate(`/outlets/${id}`)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-colors cursor-pointer ${
                outletId === id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Test /outlets/{id} {id === user?.assignedOutletId ? "(Assigned to You)" : "(Unauthorized for Franchise)"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500">Monthly Run-rate</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{data.monthlyRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500">Compliance Audit</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{data.complianceScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500">Risk Score</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{data.riskScore}/100</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500">Operating Model</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{data.operatingModel}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Submission Form (Testing operational edit permissions) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Operational Sales Submission</CardTitle>
          <CardDescription>
            {user?.role === "OWNER"
              ? "Owners have executive read-only access and are prevented from submitting operational data."
              : user?.role === "OFFICER"
              ? "Compliance officers do not submit daily sales."
              : "Franchisees and Admins can submit operational transaction batches."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesMessage && (
            <div className={`p-3 mb-4 rounded text-xs font-mono ${salesMessage.startsWith("Success") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {salesMessage}
            </div>
          )}

          <form onSubmit={handleRecordSale} className="flex flex-col sm:flex-row gap-3 items-end">
            <div>
              <label className="text-xs text-slate-600 block mb-1">Quantity</label>
              <input
                type="number"
                value={salesQuantity}
                onChange={(e) => setSalesQuantity(e.target.value)}
                className="h-9 px-3 border border-slate-200 rounded-md text-xs w-32"
                disabled={user?.role === "OWNER" || user?.role === "OFFICER"}
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Revenue (₹)</label>
              <input
                type="number"
                value={salesRevenue}
                onChange={(e) => setSalesRevenue(e.target.value)}
                className="h-9 px-3 border border-slate-200 rounded-md text-xs w-36"
                disabled={user?.role === "OWNER" || user?.role === "OFFICER"}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={user?.role === "OWNER" || user?.role === "OFFICER"}
            >
              Submit Sales Batch
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

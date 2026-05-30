"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type UploadItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  notes: string | null;
  uploadedAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

const FILE_TYPE_LABELS: Record<string, string> = {
  passport: "Passport",
  id_card: "ID Card",
  license: "Guide License",
  certification: "Certification",
  photo: "Photo",
  other: "Other",
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    VERIFIED:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
    REJECTED:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  };
  return (
    <span
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium ${styles[status] || ""}`}
    >
      {status === "PENDING" && <Clock className="h-3.5 w-3.5" />}
      {status === "VERIFIED" && <CheckCircle className="h-3.5 w-3.5" />}
      {status === "REJECTED" && <XCircle className="h-3.5 w-3.5" />}
      {status}
    </span>
  );
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchUploads = async (status: string) => {
    setLoading(true);
    try {
      const params = status !== "ALL" ? `?status=${status}` : "";
      const res = await fetch(`/api/admin/uploads${params}`);
      const data = await res.json();
      if (res.ok) setUploads(data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads(statusFilter);
  }, [statusFilter]);

  const handleVerify = async (id: string) => {
    setActionLoading(`verify-${id}`);
    try {
      await fetch(`/api/admin/uploads/${id}/verify`, { method: "PUT" });
      fetchUploads(statusFilter);
    } catch {
      /* ignore */
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const id = rejectModal.id;
    setRejectModal(null);
    setRejectReason("");
    setActionLoading(`reject-${id}`);
    try {
      await fetch(`/api/admin/uploads/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: rejectReason.trim() }),
      });
      fetchUploads(statusFilter);
    } catch {
      /* ignore */
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = searchQuery
    ? uploads.filter(
        (u) =>
          u.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : uploads;

  const tabs = [
    { value: "PENDING", label: "Pending", count: 0 },
    { value: "VERIFIED", label: "Verified", count: 0 },
    { value: "REJECTED", label: "Rejected", count: 0 },
    { value: "ALL", label: "All", count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uploads</h1>
          <p className="mt-1 text-muted-foreground">
            Review and verify user-submitted documents
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, file, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Documents ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Shield className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No {statusFilter !== "ALL" ? statusFilter.toLowerCase() : ""} documents
              </p>
              <p className="text-xs text-muted-foreground/60">
                {statusFilter === "PENDING"
                  ? "All documents have been reviewed"
                  : "No documents match the current filter"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.user.name}{" "}
                          <span className="text-muted-foreground/60">
                            ({item.user.email})
                          </span>
                          <span className="mx-1.5">&middot;</span>
                          {FILE_TYPE_LABELS[item.fileType] || item.fileType}
                          <span className="mx-1.5">&middot;</span>
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {item.status === "REJECTED" && item.notes && (
                      <p className="mt-2 ml-13 text-xs text-red-600 dark:text-red-400">
                        Reason: {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <StatusBadge status={item.status} />

                    {item.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="w-24 bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleVerify(item.id)}
                          disabled={actionLoading === `verify-${item.id}`}
                        >
                          {actionLoading === `verify-${item.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="w-24 bg-red-600 text-white hover:bg-red-700"
                          onClick={() => { setRejectReason(""); setRejectModal({ id: item.id }); }}
                          disabled={actionLoading === `reject-${item.id}`}
                        >
                          {actionLoading === `reject-${item.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Reject document</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Provide a reason for rejection.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason..."
              className="mt-4 h-24 w-full resize-none rounded-lg border border-input bg-background p-3 text-sm ring-offset-background transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-24"
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="w-24 text-white"
                onClick={handleReject}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

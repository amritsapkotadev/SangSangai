"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import {
  Mountain,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  User,
  BadgeCheck,
  Camera,
  ChevronDown,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatarUrl: string | null;
};

type UploadedFile = {
  id: string;
  fileName: string;
  fileType: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  notes: string | null;
  uploadedAt: string;
};

const FILE_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "id_card", label: "ID Card" },
  { value: "license", label: "Guide License" },
  { value: "certification", label: "Certification" },
  { value: "photo", label: "Photo" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  VERIFIED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
  REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
};

function StatusBadge({ status }: { status: string }) {
  const Icon = status === "PENDING" ? Clock : status === "VERIFIED" ? CheckCircle : XCircle;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[status] || ""}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

export function DashboardContent({ user }: { user: UserData }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fileType, setFileType] = useState("passport");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/users/avatar", { method: "PUT", body: formData });
      const data = await res.json();
      if (res.ok && data.data?.avatarUrl) {
        setAvatarUrl(data.data.avatarUrl + "?t=" + Date.now());
      }
    } catch {
      /* ignore */
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
      if (res.ok) setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch {
      /* ignore */
    }
  };

  const fetchUploads = async () => {
    try {
      const res = await fetch("/api/uploads");
      const data = await res.json();
      if (res.ok) setFiles(data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUploads(); }, []);

  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => { setSuccess(""); setError(""); }, 2000);
    return () => clearTimeout(t);
  }, [success, error]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileType", fileType);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Upload failed"); return; }
      setSuccess("File uploaded successfully");
      setSelectedFile(null);
      setFileType("passport");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchUploads();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-stone-100 dark:from-background dark:via-muted/30 dark:to-background">
      <header className="flex items-center justify-between border-b bg-white/50 px-6 py-4 backdrop-blur-sm dark:bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600">
            <Mountain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold">SangSangai</h1>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <div className="flex items-center gap-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/20 disabled:opacity-50"
            >
              <div className="h-full w-full transition-opacity group-hover:opacity-30">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-7 w-7 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/50">
                <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </button>
            {avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatarUpload(f);
              }}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Welcome, {user.name}</h2>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>{user.role === "NEPALI" ? "Guide" : "Trekker"}</span>
              <span className="text-muted-foreground/40">&middot;</span>
              {user.isVerified ? (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <BadgeCheck className="h-4 w-4" /> Verified
                </span>
              ) : (
                <span>Unverified</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="border-b px-5 py-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Upload className="h-4 w-4 text-green-500" />
                  Upload a document
                </h3>
              </div>
              <div className="p-5">
                <form onSubmit={handleUpload} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Document type</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        disabled={uploading}
                        className="flex h-9 w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-3 text-sm ring-offset-background transition-colors hover:border-stone-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-transparent dark:hover:border-stone-600"
                      >
                        <span>{FILE_TYPES.find((t) => t.value === fileType)?.label}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
                            {FILE_TYPES.map((t) => (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => { setFileType(t.value); setOpen(false); }}
                                className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 ${
                                  fileType === t.value ? "text-green-700 font-medium dark:text-green-400" : "text-foreground"
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">File (image or PDF)</label>
                    <div
                      onClick={() => !selectedFile && fileInputRef.current?.click()}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                    >
                      {selectedFile ? (
                        <>
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate text-foreground">
                            {selectedFile.name.length > 30
                              ? selectedFile.name.slice(0, 15) + "..." + selectedFile.name.slice(-12)
                              : selectedFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1 text-muted-foreground">Choose a file...</span>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      required
                      disabled={uploading}
                      className="hidden"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/30"
                    disabled={uploading || !selectedFile}
                  >
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="h-4 w-4" /> Upload file</>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="border-b px-5 py-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-stone-500" />
                  My documents
                  {!loading && <span className="ml-auto text-xs text-muted-foreground">{files.length} file{files.length !== 1 ? "s" : ""}</span>}
                </h3>
              </div>
              <div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-12 text-center">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-stone-300" />
                    <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{file.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {FILE_TYPES.find((t) => t.value === file.fileType)?.label || file.fileType}
                              <span className="mx-1.5">&middot;</span>
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                            {file.notes && (
                              <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                                {file.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={file.status} />
                          <button
                            type="button"
                            onClick={() => handleDelete(file.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

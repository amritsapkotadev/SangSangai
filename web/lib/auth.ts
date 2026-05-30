import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { ApiResponse, JwtPayload } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const SALT_ROUNDS = 10;

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export function authenticateRequest(
  request: NextRequest
): ApiResponse<JwtPayload> {
  const token = getTokenFromRequest(request);
  if (!token) return { success: false, error: "Missing or invalid token" };

  const payload = verifyToken(token);
  if (!payload) return { success: false, error: "Invalid or expired token" };

  return { success: true, data: payload };
}

export function requireAdmin(
  request: NextRequest
): ApiResponse<JwtPayload> {
  const auth = authenticateRequest(request);
  if (!auth.success) return auth;

  if (auth.data!.role !== "ADMIN") {
    return { success: false, error: "Admin access required" };
  }

  return auth;
}

export function getTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get("token")?.value ?? null;
}

export function authenticateAdminFromRequest(
  request: NextRequest
): ApiResponse<JwtPayload> {
  const token = getTokenFromCookie(request) || getTokenFromRequest(request);
  if (!token) return { success: false, error: "Not authenticated" };

  const payload = verifyToken(token);
  if (!payload) return { success: false, error: "Invalid or expired token" };
  if (payload.role !== "ADMIN")
    return { success: false, error: "Admin access required" };

  return { success: true, data: payload };
}

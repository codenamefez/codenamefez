import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { getSetting, setSetting } from "./db/settings.js";
import type { JwtPayload } from "./types.js";

const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await getSetting("admin_password_hash");
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function setPassword(password: string): Promise<void> {
  const hash = await bcrypt.hash(password, 10);
  await setSetting("admin_password_hash", hash);
}

export function signToken(): string {
  return jwt.sign({ sub: "admin" }, config.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN_SECONDS,
  });
}

export function verifyToken(authHeader: string | undefined): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    return payload.sub === "admin";
  } catch {
    return false;
  }
}

export function requireAuth(authHeader: string | undefined): boolean {
  return verifyToken(authHeader);
}

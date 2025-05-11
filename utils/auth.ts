import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { getCookies, setCookie, deleteCookie } from "std/http/cookie.ts";
import { createUser, getUserByEmail, getSession, saveSession, deleteSession, updateUser } from "../db/db.ts";
import { User } from "../types/index.ts";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_EXPIRY_DAYS = 7;

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Session management
export function createSessionId(): string {
  return crypto.randomUUID();
}

export async function setUserSession(userId: string, response: Response): Promise<string> {
  const sessionId = createSessionId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
  
  await saveSession(sessionId, userId, expiresAt);
  
  setCookie(response.headers, {
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
  });
  
  return sessionId;
}

export function clearUserSession(response: Response): void {
  deleteCookie(response.headers, SESSION_COOKIE_NAME, {
    path: "/",
  });
}

export async function getUserFromRequest(req: Request): Promise<User | null> {
  const cookies = getCookies(req.headers);
  const sessionId = cookies[SESSION_COOKIE_NAME];
  
  if (!sessionId) return null;
  
  const session = await getSession(sessionId);
  if (!session) return null;
  
  // Import the getUserById function to get the user details
  const { getUserById } = await import("../db/db.ts");
  return await getUserById(session.userId);
}

// Authentication functions
export async function signUp(email: string, password: string, name: string): Promise<User | null> {
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return null;
  }
  
  // Hash the password
  const hashedPassword = await hashPassword(password);
  
  // Create the user
  const user = await createUser({
    email,
    name,
    profileImage: "", // Default empty
    password: hashedPassword, // We'll store this in the user object for simplicity
  });
  
  return user;
}

export async function signIn(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.password) {
    return null;
  }
  
  // Check if user is approved
  if (!user.isApproved) {
    return null;
  }
  
  // Check if user is blocked
  if (user.isBlocked) {
    return null;
  }
  
  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return null;
  }
  
  // Update last login
  await updateUser(user.id, { lastLogin: new Date() });
  
  return user;
}

// Google Auth helper
export function getGoogleAuthUrl(): string {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID") || "";
  const redirectUri = Deno.env.get("GOOGLE_REDIRECT_URI") || "";
  
  const scope = "email profile";
  const state = crypto.randomUUID();
  
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  
  return url.toString();
}

export async function handleGoogleCallback(code: string): Promise<User | null> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID") || "";
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
  const redirectUri = Deno.env.get("GOOGLE_REDIRECT_URI") || "";
  
  // Exchange authorization code for tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  
  if (!tokenResponse.ok) {
    return null;
  }
  
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  
  // Get user info
  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!userInfoResponse.ok) {
    return null;
  }
  
  const userInfo = await userInfoResponse.json();
  
  // Check if user exists
  let user = await getUserByEmail(userInfo.email);
  
  if (user) {
    // Update profile image if needed
    if (user.profileImage !== userInfo.picture) {
      user = await updateUser(user.id, { 
        profileImage: userInfo.picture,
        lastLogin: new Date()
      });
    }
  } else {
    // Create new user
    user = await createUser({
      email: userInfo.email,
      name: userInfo.name,
      profileImage: userInfo.picture,
      // Google auth users don't need a password
    });
  }
  
  return user;
}
import { appConfig } from "@/shared/configs/app.config";
import { cookies } from "next/headers";

// Constants
export const ACCESS_TOKEN_KEY = appConfig.ACCESS_TOKEN_KEY;
export const REFRESH_TOKEN_KEY = appConfig.REFRESH_TOKEN_KEY;

export const TOKEN_COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	path: "/",
	sameSite: "strict" as const,
};

// Encryption settings
const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = Buffer.from(appConfig.TOKEN_ENCRYPTION_KEY, "hex"); // 64 hex chars = 32 bytes
const IV_LENGTH = 16;

if (SECRET_KEY.length !== 32) {
	throw new Error("TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
}

// export function encrypt(text: string): string {
// 	const iv = crypto.randomBytes(IV_LENGTH);
// 	const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
// 	let encrypted = cipher.update(text, "utf8", "base64");
// 	encrypted += cipher.final("base64");
// 	const authTag = cipher.getAuthTag();
// 	return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
// }

// export function decrypt(data: string): string {
// 	const [ivBase64, authTagBase64, encrypted] = data.split(":");
// 	if (!ivBase64 || !authTagBase64 || !encrypted) return "";
// 	const iv = Buffer.from(ivBase64, "base64");
// 	const authTag = Buffer.from(authTagBase64, "base64");
// 	const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
// 	decipher.setAuthTag(authTag);
// 	let decrypted = decipher.update(encrypted, "base64", "utf8");
// 	decrypted += decipher.final("utf8");
// 	return decrypted;
// }

/**
 * Sets both access and refresh tokens as HTTP-only cookies
 */
export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
	const cookieStore = await cookies();
	// const encryptedAccessToken = encrypt(accessToken);
	cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
		...TOKEN_COOKIE_OPTIONS,
		expires: new Date(Date.now() + 20 * 60 * 1000),
	}); // 20 min
	cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
		...TOKEN_COOKIE_OPTIONS,
		expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
	}); // 30 days
}

/**
 * Clears authentication cookies
 */
export function clearAuthCookies(): Headers {
	const headers = new Headers();
	headers.append("Set-Cookie", `${ACCESS_TOKEN_KEY}=; Path=/; Max-Age=0; HttpOnly; Secure`);
	headers.append("Set-Cookie", `${REFRESH_TOKEN_KEY}=; Path=/; Max-Age=0; HttpOnly; Secure`);
	return headers;
}

/**
 * Get access and refresh tokens from cookies
 */
export async function getAuthTokens(): Promise<{
	accessToken: string;
	refreshToken: string;
}> {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value || "";
	// const encryptedAccessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value || "";
	const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value || "";
	// const accessToken = encryptedAccessToken ? decrypt(encryptedAccessToken) : "";
	return { accessToken, refreshToken };
}

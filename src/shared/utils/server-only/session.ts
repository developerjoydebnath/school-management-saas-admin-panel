import { refreshAuthTokens } from "@/app/api/proxy/[...path]/route";
import { appConfig } from "@/shared/configs/app.config";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAuthTokens } from "./auth-tokens";

export type SessionUser = {
	userId: string;
	email: string;
	schema: string;
	profileId: string;
	profile?: {
		firstName?: string;
		lastName?: string;
		avatar?: string;
	};
	role?: string;
};

const SESSION_KEY = "session";

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	path: "/",
	expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

export async function validateSession(): Promise<SessionUser | null> {
	const { accessToken, refreshToken } = await getAuthTokens();

	if (!accessToken && !refreshToken) {
		// No tokens available, user is not logged in
		return null;
	}

	const secret = new TextEncoder().encode(appConfig.JWT_ACCESS_SECRET);

	try {
		// If we don't have an access token but we DO have a refresh token,
		// artificially throw an error so the catch block handles the refresh logic cleanly.
		if (!accessToken) {
			throw new Error("Access token expired");
		}

		// STATELESS VALIDATION: Mathematically verify the JWT locally.
		// This happens in 0ms and completely avoids hitting the backend!
		const { payload } = await jwtVerify(accessToken, secret);

		const sessionUser: SessionUser = {
			userId: payload.sub as string,
			email: payload.email as string,
			schema: payload.schema as string,
			role: payload.role as string,
			profileId: payload.profileId as string,
		};

		await createSession(sessionUser);
		return sessionUser;
	} catch (error: any) {
		if (refreshToken) {
			try {
				const newTokens = await refreshAuthTokens();

				if (newTokens?.access_token && newTokens?.refresh_token) {
					// Save new tokens to cookies using the auth-tokens helper
					const { setAuthCookies } = await import("./auth-tokens");
					await setAuthCookies(newTokens.access_token, newTokens.refresh_token);

					// Decode the NEW access token locally instead of hitting /auth/me
					const { payload } = await jwtVerify(newTokens.access_token, secret);

					const sessionUser: SessionUser = {
						userId: payload.sub as string,
						email: payload.email as string,
						schema: payload.schema as string,
						role: payload.role as string,
						profileId: payload.profileId as string,
					};

					await createSession(sessionUser);
					return sessionUser;
				}
			} catch (refreshError) {
				// Refresh token is expired or invalid
				return null;
			}
		}
	}

	return null;
}

export async function createSession(user: SessionUser): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(SESSION_KEY, JSON.stringify(user), {
		...COOKIE_OPTIONS,
		httpOnly: false,
	});
}

export async function getCurrentSession(): Promise<SessionUser | null> {
	// const session = (await cookies()).get(SESSION_KEY)?.value;
	const session = await validateSession();
	try {
		// return session ? (JSON.parse(session) as SessionUser) : null;
		return session as SessionUser;
	} catch (err) {
		console.error("Invalid session cookie:", err);
		return null;
	}
}

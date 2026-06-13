import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentSession } from "./shared/utils/server-only/session";

// Define paths that should not be accessible if already logged in
const authPaths = ["/login", "/forgot-password"];

// Define paths that are always public (no auth needed)
const publicPaths = ["/login", "/forgot-password", "/register"];

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isAuthPath = authPaths.some((p) => pathname.startsWith(p));
	const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

	// If it's a public path and user is already logged in, redirect to dashboard
	if (isAuthPath) {
		const session = await getCurrentSession();
		if (session?.userId) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
		return NextResponse.next();
	}

	// All other paths require authentication
	if (!isPublicPath) {
		const session = await getCurrentSession();

		if (!session) {
			const url = new URL("/login", request.url);
			url.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(url);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};

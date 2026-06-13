import { appConfig } from "@/shared/configs/app.config";
import {
	TOKEN_COOKIE_OPTIONS,
	clearAuthCookies,
	getAuthTokens,
	setAuthCookies,
} from "@/shared/utils/server-only/auth-tokens";
import { createSession } from "@/shared/utils/server-only/session";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Types
interface RefreshTokenResponse {
	access_token: string;
	refresh_token: string;
}

interface ApiErrorData {
	error: string;
	[key: string]: unknown;
}

// Define the API Key for your NestJS backend
const API_KEY = appConfig.FRONTEND_API_KEY;

if (!appConfig.API_URL || !appConfig.API_PREFIX) {
	throw new Error("API_URL and API_PREFIX must be defined in environment variables");
}
axios.defaults.baseURL = appConfig.API_URL + appConfig.API_PREFIX;

/**
 * Attempts to refresh the access token using the refresh token
 */
export async function refreshAuthTokens(): Promise<RefreshTokenResponse | null> {
	try {
		const { refreshToken } = await getAuthTokens();
		if (!refreshToken) throw new Error("No refresh token found");

		const response: AxiosResponse<RefreshTokenResponse> = await axios.post(
			"/auth/refresh-token", // Point to real NestJS endpoint
			{ refresh_token: refreshToken }, // Pass refresh token in body
			{
				headers: {
					"x-api-key": API_KEY, // Add API Key for NestJS guard
				},
			}
		);

		// The API response is now wrapped in the universal { success, data: {...} } format
		const responseData = response.data as any;

		if (!responseData.success || !responseData.data) {
			throw new Error("Invalid response format during refresh");
		}

		const { access_token, refresh_token } = responseData.data;

		if (access_token && refresh_token) {
			await setAuthCookies(access_token, refresh_token);
			return response.data;
		}
	} catch (error) {
		console.error("Token refresh failed:", error);
		new NextResponse(JSON.stringify({ error: "Authentication required" }), {
			status: 401,
			headers: clearAuthCookies(),
		});
	}
	return null;
}

/**
 * Handles API requests with token refresh logic
 */
async function handleApiRequest(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
	const { path } = await context.params;
	const queryString = new URL(request.url).searchParams.toString();
	const apiEndpoint = path.join("/");
	const targetUrl = `/${apiEndpoint}${queryString ? `?${queryString}` : ""}`;

	const { accessToken, refreshToken } = await getAuthTokens();

	const method = request.method;
	const contentType = request.headers.get("content-type") || "";
	let requestData: unknown = {};

	if (["POST", "PUT", "PATCH"].includes(method)) {
		if (contentType.includes("application/json")) {
			requestData = await request.json();
		} else if (contentType.includes("multipart/form-data")) {
			requestData = await request.formData();
		}
	}

	// Pass headers from the original request but override Authorization and API key
	const headersToForward: Record<string, string> = {};
	request.headers.forEach((value, key) => {
		if (
			!["host", "connection", "content-length", "cookie", "authorization"].includes(
				key.toLowerCase()
			)
		) {
			headersToForward[key] = value;
		}
	});

	const requestConfig: AxiosRequestConfig = {
		method: method as AxiosRequestConfig["method"],
		url: targetUrl,
		data: requestData,
		headers: {
			...headersToForward,
			"x-api-key": API_KEY, // Essential for NestJS global ApiKeyGuard
		},
		responseType: "arraybuffer",
	};

	// Add the Bearer token if we have one
	if (accessToken) {
		if (!requestConfig.headers) requestConfig.headers = {};
		requestConfig.headers.Authorization = `Bearer ${accessToken}`;
	}

	try {
		const response = await axios(requestConfig);
		return handleResponse(response);
	} catch (error) {
		const err = error as AxiosError;
		const statusCode = err.response?.status || 500;

		if (statusCode === 401 && !!refreshToken) {
			const newTokens = await refreshAuthTokens();

			if (newTokens?.access_token && newTokens?.refresh_token) {
				if (!requestConfig.headers) requestConfig.headers = {};
				requestConfig.headers.Authorization = `Bearer ${newTokens.access_token}`;

				try {
					const retryResponse = await axios(requestConfig);
					const apiResponse = await handleResponse(retryResponse);

					// Re-attach cookies manually to the proxy response
					const setCookieHeader = clearAuthCookies();
					apiResponse.headers.append(
						"Set-Cookie",
						setCookieHeader.get("Set-Cookie") as string
					);

					return apiResponse;
				} catch (retryError) {
					return handleApiError(retryError as AxiosError);
				}
			}
		}

		return handleApiError(err);
	}
}

// Convert Axios headers to a plain object
function normalizeAxiosHeaders(headers: any): Record<string, string> {
	const result: Record<string, string> = {};
	Object.entries(headers || {}).forEach(([key, value]) => {
		if (value !== undefined) {
			result[key] = Array.isArray(value) ? value.join(", ") : String(value);
		}
	});
	return result;
}

async function handleResponse(axiosResponse: AxiosResponse): Promise<NextResponse> {
	const contentTypeHeader = (axiosResponse.headers["content-type"] ||
		"application/octet-stream") as string;

	if (!contentTypeHeader.includes("application/json") && Buffer.isBuffer(axiosResponse.data)) {
		const headers = new Headers();
		headers.set("Content-Type", contentTypeHeader);

		const contentDisposition = axiosResponse.headers["content-disposition"] || "";
		if (contentDisposition) {
			headers.set("Content-Disposition", contentDisposition);
		}

		// Create a pure ArrayBuffer
		const arrayBuffer = new Uint8Array(axiosResponse.data).buffer;

		return new NextResponse(arrayBuffer, {
			status: axiosResponse.status,
			headers,
		});
	}

	const text = Buffer.from(axiosResponse.data).toString("utf8");

	let data: any;

	try {
		data = JSON.parse(text);
	} catch {
		data = { raw: text };
	}

	// store automatically access tokens in cookies
	const cookieStore = await cookies();

	// Check for standard format { success, data: { access_token... } }
	const responseData = data?.data || data;

	if (responseData?.access_token) {
		const accessTokenStr = responseData.access_token;
		// const encryptedToken = encrypt(accessTokenStr);
		cookieStore.set(appConfig.ACCESS_TOKEN_KEY, accessTokenStr, TOKEN_COOKIE_OPTIONS);
	}

	if (responseData?.refresh_token) {
		const refreshTokenStr = responseData.refresh_token;
		cookieStore.set(appConfig.REFRESH_TOKEN_KEY, refreshTokenStr, TOKEN_COOKIE_OPTIONS);
	}

	// If a user object is returned (e.g., from login), save it to the session
	if (responseData?.user) {
		await createSession(responseData.user);
	}

	return NextResponse.json(data, {
		status: axiosResponse.status,
		headers: normalizeAxiosHeaders(axiosResponse.headers),
	});
}

function handleApiError(error: AxiosError): NextResponse {
	const statusCode = error.response?.status || 500;
	let errorData: ApiErrorData = { error: "API request failed" };

	if (error.response?.data) {
		const data = error.response.data;

		if (data instanceof ArrayBuffer) {
			const buffer = Buffer.from(new Uint8Array(data));
			try {
				errorData = JSON.parse(buffer.toString("utf8"));
			} catch {
				errorData = { error: "API request failed with unreadable error data" };
			}
		} else if (Buffer.isBuffer(data)) {
			try {
				errorData = JSON.parse(data.toString("utf8"));
			} catch {
				errorData = { error: "API request failed with unreadable error data" };
			}
		} else if (typeof data === "string") {
			try {
				errorData = JSON.parse(data);
			} catch {
				errorData = { error: data };
			}
		} else {
			errorData = data as ApiErrorData;
		}
	}

	return NextResponse.json(errorData, { status: statusCode });
}

// Export HTTP method handlers
export const GET = handleApiRequest;
export const POST = handleApiRequest;
export const PUT = handleApiRequest;
export const PATCH = handleApiRequest;
export const DELETE = handleApiRequest;

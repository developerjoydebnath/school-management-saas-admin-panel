export const appConfig = {
	// app configs
	APP_URL: process.env.NEXT_PUBLIC_APP_URL,

	// api configs
	API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
	API_KEY: process.env.NEXT_PUBLIC_API_KEY,
	API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX ?? "",
	API_WS_URL: process.env.NEXT_PUBLIC_API_WS_URL,

	// Server-only keys (will not be bundled to client browser)
	FRONTEND_API_KEY: process.env.FRONTEND_API_KEY,
	TOKEN_ENCRYPTION_KEY: process.env.TOKEN_ENCRYPTION_KEY ?? "",
	REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY ?? "",
	ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY ?? "",
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "",
};

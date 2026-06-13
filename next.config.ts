import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const backendUrlObj = new URL(BACKEND_URL);

const nextConfig: NextConfig = {
	reactCompiler: true,
	allowedDevOrigins: ["192.168.1.101"],
	images: {
		// Use our custom loader for all images
		loaderFile: "./image.loader.ts",
		// Allow serving images from the backend server
		remotePatterns: [
			{
				protocol: backendUrlObj.protocol.replace(":", "") as "http" | "https",
				hostname: backendUrlObj.hostname,
				port: backendUrlObj.port,
				pathname: "/**",
			},
		],
	},
};

export default withNextIntl(nextConfig);

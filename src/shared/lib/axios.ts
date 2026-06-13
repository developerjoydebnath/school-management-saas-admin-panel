import Axios from "axios";

const axios = Axios.create({
	baseURL: "/api/proxy",
	withCredentials: true,
});

import { toast } from "sonner";

axios.interceptors.request.use((config) => {
	if (typeof document !== "undefined") {
		const match = document.cookie.match(new RegExp("(^| )NEXT_LOCALE=([^;]+)"));
		const locale = match ? match[2] : "en";

		// Add Accept-Language header
		config.headers["Accept-Language"] = locale;
	}
	return config;
});

// Universal error handler
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		// Determine the error message
		let errorMessage = "An unexpected error occurred. Please try again.";

		if (error.response?.data) {
			const data = error.response.data;
			// Handle NestJS format: { message: "...", error: "..." }
			if (typeof data.message === "string") {
				errorMessage = data.message;
			} else if (Array.isArray(data.message) && data.message.length > 0) {
				errorMessage = data.message[0]; // First validation error
			} else if (typeof data.error === "string") {
				errorMessage = data.error;
			}
		} else if (error.request) {
			errorMessage = "Network error. Please check your internet connection.";
		} else if (error.message) {
			errorMessage = error.message;
		}

		// Show toast for all errors except 404 on GET requests
		const method = error.config?.method?.toUpperCase() || "";
		const isGet = method === "GET";
		const isNotFound = error.response?.status === 404;

		if (!isGet || !isNotFound) {
			toast.error(errorMessage);
		}

		return Promise.reject(error);
	}
);

export default axios;

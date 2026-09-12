"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GeoStatus =
	| "idle"
	| "unsupported"
	| "insecure"
	| "prompting"
	| "granted"
	| "denied"
	| "unavailable"
	| "timeout";

export type GeoPosition = {
	lat: number;
	lng: number;
	accuracy: number;
	capturedAt: string;
};

type Options = {
	/** Keep watching and retain the best fix — see the note on accuracy below. */
	watch?: boolean;
	enableHighAccuracy?: boolean;
	timeout?: number;
};

/** How long a previously-good fix stays "best" before we stop preferring it. */
const BEST_FIX_TTL_MS = 30_000;

/**
 * Browser geolocation for attendance punching.
 *
 * Two behaviours here are load-bearing:
 *
 * 1. `maximumAge: 0` — a cached fix from an hour ago would let someone punch in
 *    from home, so a fresh reading is always required.
 * 2. In watch mode we keep the BEST (lowest-accuracy-number) fix from the last
 *    30s. The first Android fix is typically a ~2000m cell-tower estimate that
 *    tightens over about ten seconds; without this the submit button would be
 *    permanently disabled behind an unusable first reading.
 */
export function useGeolocation(options: Options = {}) {
	const { watch = true, enableHighAccuracy = true, timeout = 15000 } = options;

	const [position, setPosition] = useState<GeoPosition | null>(null);
	const [status, setStatus] = useState<GeoStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const watchIdRef = useRef<number | null>(null);
	const bestRef = useRef<{ fix: GeoPosition; at: number } | null>(null);

	const stop = useCallback(() => {
		if (watchIdRef.current !== null && typeof navigator !== "undefined") {
			navigator.geolocation.clearWatch(watchIdRef.current);
			watchIdRef.current = null;
		}
	}, []);

	const preflight = useCallback((): GeoStatus | null => {
		if (typeof navigator === "undefined" || typeof window === "undefined") {
			return "idle";
		}
		if (!("geolocation" in navigator)) return "unsupported";
		// Distinct from `denied`: the browser blocks the API outright on an
		// insecure origin, which is what http://<tenant>.lvh.me:3000 is.
		if (!window.isSecureContext) return "insecure";
		return null;
	}, []);

	const handleSuccess = useCallback((result: GeolocationPosition) => {
		const fix: GeoPosition = {
			lat: result.coords.latitude,
			lng: result.coords.longitude,
			accuracy: result.coords.accuracy,
			capturedAt: new Date(result.timestamp).toISOString(),
		};

		const best = bestRef.current;
		const bestIsFresh = best && Date.now() - best.at < BEST_FIX_TTL_MS;
		if (!bestIsFresh || fix.accuracy <= best!.fix.accuracy) {
			bestRef.current = { fix, at: Date.now() };
			setPosition(fix);
		}

		setStatus("granted");
		setError(null);
		setIsRefreshing(false);
	}, []);

	const handleError = useCallback((geoError: GeolocationPositionError) => {
		setIsRefreshing(false);
		if (geoError.code === geoError.PERMISSION_DENIED) {
			setStatus("denied");
			setError("Location permission was denied.");
		} else if (geoError.code === geoError.TIMEOUT) {
			setStatus("timeout");
			setError("Timed out while getting your location.");
		} else {
			setStatus("unavailable");
			setError("Your location is currently unavailable.");
		}
	}, []);

	const request = useCallback(() => {
		const blocked = preflight();
		if (blocked) {
			setStatus(blocked);
			if (blocked === "insecure") {
				setError(
					"Location needs a secure connection (HTTPS or localhost)."
				);
			} else if (blocked === "unsupported") {
				setError("This browser cannot read your location.");
			}
			return;
		}

		setStatus("prompting");
		setIsRefreshing(true);
		bestRef.current = null;

		navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
			enableHighAccuracy,
			timeout,
			maximumAge: 0,
		});

		if (watch && watchIdRef.current === null) {
			watchIdRef.current = navigator.geolocation.watchPosition(
				handleSuccess,
				handleError,
				{ enableHighAccuracy, timeout, maximumAge: 0 }
			);
		}
	}, [enableHighAccuracy, handleError, handleSuccess, preflight, timeout, watch]);

	/** Explicit user-driven re-read, like the recentre button on a maps app. */
	const refresh = useCallback(() => {
		const blocked = preflight();
		if (blocked) {
			setStatus(blocked);
			return;
		}
		setIsRefreshing(true);
		bestRef.current = null;
		navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
			enableHighAccuracy,
			timeout,
			maximumAge: 0,
		});
	}, [enableHighAccuracy, handleError, handleSuccess, preflight, timeout]);

	useEffect(() => stop, [stop]);

	return {
		position,
		accuracy: position?.accuracy ?? null,
		status,
		error,
		isRefreshing,
		request,
		refresh,
		stop,
	};
}

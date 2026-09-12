/**
 * Single shared Leaflet loader.
 *
 * Leaflet is pulled from a CDN rather than bundled (matching how the school
 * location maps have always done it). This module owns the one promise and the
 * one pair of DOM ids, which removes a real race the previous duplicated
 * loaders had: the `existingScript` branch attached a `load` listener to a tag
 * that may already have fired, so its promise never resolved.
 */
export type LeafletInstance = any;

const LEAFLET_SCRIPT_ID = "leaflet-script";
const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

let loader: Promise<LeafletInstance> | null = null;

export function loadLeaflet(): Promise<LeafletInstance> {
	if (typeof window === "undefined") {
		return Promise.reject(new Error("Leaflet can only load in the browser"));
	}

	if ((window as any).L) return Promise.resolve((window as any).L);
	if (loader) return loader;

	loader = new Promise((resolve, reject) => {
		if (!document.getElementById(LEAFLET_CSS_ID)) {
			const link = document.createElement("link");
			link.id = LEAFLET_CSS_ID;
			link.rel = "stylesheet";
			link.href = LEAFLET_CSS_URL;
			document.head.appendChild(link);
		}

		const finish = () => {
			const L = (window as any).L;
			if (L) resolve(L);
			else reject(new Error("Leaflet loaded but window.L is missing"));
		};

		const existing = document.getElementById(LEAFLET_SCRIPT_ID);
		if (existing) {
			// The tag may have already fired `load`, in which case window.L is
			// set and we must resolve immediately rather than wait forever.
			if ((window as any).L) return finish();
			existing.addEventListener("load", finish);
			existing.addEventListener("error", () =>
				reject(new Error("Failed to load Leaflet"))
			);
			return;
		}

		const script = document.createElement("script");
		script.id = LEAFLET_SCRIPT_ID;
		script.src = LEAFLET_JS_URL;
		script.async = true;
		script.onload = finish;
		script.onerror = () => {
			// Let a later attempt retry rather than caching the rejection —
			// rural uplinks drop this request often enough to matter.
			loader = null;
			reject(new Error("Failed to load Leaflet"));
		};
		document.body.appendChild(script);
	});

	return loader;
}

export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
	return (
		typeof lat === "number" &&
		typeof lng === "number" &&
		Number.isFinite(lat) &&
		Number.isFinite(lng) &&
		lat >= -90 &&
		lat <= 90 &&
		lng >= -180 &&
		lng <= 180
	);
}

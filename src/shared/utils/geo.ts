/**
 * COSMETIC ONLY — the server recomputes every geofence verdict from the raw
 * coordinates it receives. These helpers exist so the punch dialog can show a
 * live "≈ 42 m from campus" hint while the reading settles; nothing here is
 * ever trusted for an attendance decision.
 *
 * Mirrors backend-server/src/common/utils/geo.util.ts. There is no shared
 * package in this monorepo, so this is a deliberate small duplication.
 */

const EARTH_RADIUS_M = 6371008.8;

export type LatLng = { lat: number; lng: number };
export type Geofence =
	| { type: "circle"; center: LatLng; radiusMeters: number }
	| { type: "polygon"; vertices: LatLng[] };

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function haversineMeters(a: LatLng, b: LatLng): number {
	const lat1 = toRadians(a.lat);
	const lat2 = toRadians(b.lat);
	const deltaLat = toRadians(b.lat - a.lat);
	const deltaLng = toRadians(b.lng - a.lng);
	const h =
		Math.sin(deltaLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
	return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function isPointInPolygon(point: LatLng, vertices: LatLng[]): boolean {
	if (vertices.length < 3) return false;
	const x = point.lng;
	const y = point.lat;
	let inside = false;
	for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
		const xi = vertices[i].lng;
		const yi = vertices[i].lat;
		const xj = vertices[j].lng;
		const yj = vertices[j].lat;
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
			inside = !inside;
		}
	}
	return inside;
}

export function distanceToGeofenceMeters(
	point: LatLng,
	fence: Geofence
): number {
	if (fence.type === "circle") {
		return Math.max(0, haversineMeters(point, fence.center) - fence.radiusMeters);
	}

	if (isPointInPolygon(point, fence.vertices)) return 0;

	const cosLat = Math.cos(toRadians(point.lat));
	const project = (v: LatLng) => ({
		x: EARTH_RADIUS_M * toRadians(v.lng - point.lng) * cosLat,
		y: EARTH_RADIUS_M * toRadians(v.lat - point.lat),
	});
	const projected = fence.vertices.map(project);

	let minimum = Infinity;
	for (let i = 0, j = projected.length - 1; i < projected.length; j = i++) {
		const a = projected[j];
		const b = projected[i];
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const lengthSquared = dx * dx + dy * dy;
		const t =
			lengthSquared === 0
				? 0
				: Math.max(
						0,
						Math.min(1, ((0 - a.x) * dx + (0 - a.y) * dy) / lengthSquared)
					);
		const distance = Math.hypot(0 - (a.x + t * dx), 0 - (a.y + t * dy));
		if (distance < minimum) minimum = distance;
	}
	return minimum;
}

export function formatDistance(meters: number): string {
	if (meters < 1000) return `${Math.round(meters)} m`;
	return `${(meters / 1000).toFixed(1)} km`;
}

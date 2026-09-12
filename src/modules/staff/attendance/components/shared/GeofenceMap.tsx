"use client";

import { useLeafletMap } from "@/shared/hooks/use-leaflet-map";
import { cn } from "@/shared/lib/utils";
import { Geofence, LatLng } from "@/shared/utils/geo";
import { MapPinOff } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
	geofence: Geofence | null;
	/** Where the person actually is, if known. */
	position?: LatLng | null;
	/** GPS accuracy in metres — drawn as the translucent halo. */
	accuracyMeters?: number | null;
	/** Extra tolerance the server adds; drawn as a dashed outer ring. */
	bufferMeters?: number;
	className?: string;
	height?: string;
};

const DHAKA: [number, number] = [23.8103, 90.4125];

function fenceCenter(fence: Geofence | null): [number, number] | null {
	if (!fence) return null;
	if (fence.type === "circle") return [fence.center.lat, fence.center.lng];
	if (!fence.vertices.length) return null;
	const lat = fence.vertices.reduce((sum, v) => sum + v.lat, 0) / fence.vertices.length;
	const lng = fence.vertices.reduce((sum, v) => sum + v.lng, 0) / fence.vertices.length;
	return [lat, lng];
}

/**
 * Read-only view of the campus boundary, optionally with a live position.
 *
 * The accuracy halo is drawn honestly: people intuitively read the blue blob
 * as "how sure the phone is", which is exactly what it means.
 */
export function GeofenceMap({
	geofence,
	position,
	accuracyMeters,
	bufferMeters = 0,
	className,
	height = "h-72",
}: Props) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const layersRef = useRef<any[]>([]);
	const center = position
		? ([position.lat, position.lng] as [number, number])
		: fenceCenter(geofence) || DHAKA;

	const { L, map, error } = useLeafletMap(containerRef, { center, zoom: 16 });

	useEffect(() => {
		if (!L || !map) return;

		layersRef.current.forEach((layer) => layer.remove());
		layersRef.current = [];

		const add = (layer: any) => {
			layer.addTo(map);
			layersRef.current.push(layer);
			return layer;
		};

		const fenceStyle = {
			color: "#059669",
			weight: 2,
			fillColor: "#059669",
			fillOpacity: 0.12,
		};
		const bufferStyle = {
			color: "#059669",
			weight: 1,
			dashArray: "6 6",
			fill: false,
			opacity: 0.6,
		};

		if (geofence?.type === "circle") {
			add(
				L.circle([geofence.center.lat, geofence.center.lng], {
					radius: geofence.radiusMeters,
					...fenceStyle,
				})
			);
			if (bufferMeters > 0) {
				add(
					L.circle([geofence.center.lat, geofence.center.lng], {
						radius: geofence.radiusMeters + bufferMeters,
						...bufferStyle,
					})
				);
			}
		} else if (geofence?.type === "polygon" && geofence.vertices.length >= 3) {
			add(
				L.polygon(
					geofence.vertices.map((v) => [v.lat, v.lng]),
					fenceStyle
				)
			);
		}

		if (position) {
			if (accuracyMeters && accuracyMeters > 0) {
				add(
					L.circle([position.lat, position.lng], {
						radius: accuracyMeters,
						color: "#2563eb",
						weight: 1,
						fillColor: "#2563eb",
						fillOpacity: 0.15,
					})
				);
			}
			add(
				L.circleMarker([position.lat, position.lng], {
					radius: 7,
					color: "#ffffff",
					weight: 2,
					fillColor: "#2563eb",
					fillOpacity: 1,
				})
			);
		}

		const bounds: any[] = [];
		if (geofence?.type === "circle") bounds.push([geofence.center.lat, geofence.center.lng]);
		if (geofence?.type === "polygon") {
			geofence.vertices.forEach((v) => bounds.push([v.lat, v.lng]));
		}
		if (position) bounds.push([position.lat, position.lng]);
		if (bounds.length > 1) {
			map.fitBounds(L.latLngBounds(bounds).pad(0.35));
		} else if (bounds.length === 1) {
			map.setView(bounds[0], 16);
		}
	}, [L, map, geofence, position, accuracyMeters, bufferMeters]);

	if (error) {
		return (
			<div
				className={cn(
					"text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm",
					height,
					className
				)}
			>
				<MapPinOff className="size-5" />
				<span>Map could not be loaded.</span>
			</div>
		);
	}

	return (
		<div className={cn("bg-muted overflow-hidden rounded-lg border", height, className)}>
			<div ref={containerRef} className="h-full w-full" />
		</div>
	);
}

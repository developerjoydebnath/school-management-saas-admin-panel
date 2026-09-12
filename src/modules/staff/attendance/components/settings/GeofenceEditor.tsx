"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useLeafletMap } from "@/shared/hooks/use-leaflet-map";
import { Geofence, LatLng } from "@/shared/utils/geo";
import { MapPinOff, School, Trash2, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchSchoolLocation } from "../../hooks/use-staff-attendance-mutations";

type Props = {
	value: Geofence | null;
	onChange: (fence: Geofence | null) => void;
	/** Drawn as a dashed outer ring so the admin can see the real tolerance. */
	bufferMeters: number;
};

const DHAKA: [number, number] = [23.8103, 90.4125];

const centerOf = (fence: Geofence | null): [number, number] => {
	if (fence?.type === "circle") return [fence.center.lat, fence.center.lng];
	if (fence?.type === "polygon" && fence.vertices.length) {
		const lat = fence.vertices.reduce((s, v) => s + v.lat, 0) / fence.vertices.length;
		const lng = fence.vertices.reduce((s, v) => s + v.lng, 0) / fence.vertices.length;
		return [lat, lng];
	}
	return DHAKA;
};

const round = (value: number) => Number(value.toFixed(6));

export function GeofenceEditor({ value, onChange, bufferMeters }: Props) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const layersRef = useRef<any[]>([]);

	const [mode, setMode] = useState<"circle" | "polygon">(value?.type || "circle");
	const [radius, setRadius] = useState(
		value?.type === "circle" ? value.radiusMeters : 150
	);
	// Both drafts live in state, not a ref: the vertex count is rendered, and
	// keeping the other shape alive means switching modes is not destructive.
	const [circleCenter, setCircleCenter] = useState<LatLng | null>(
		value?.type === "circle" ? value.center : null
	);
	const [vertices, setVertices] = useState<LatLng[]>(
		value?.type === "polygon" ? value.vertices : []
	);

	const { L, map, error } = useLeafletMap(containerRef, {
		center: centerOf(value),
		zoom: 16,
	});

	// One place decides what the current draft means, so the parent never sees
	// a half-built shape (a 2-vertex polygon is not a fence).
	useEffect(() => {
		if (mode === "circle") {
			onChange(
				circleCenter
					? { type: "circle", center: circleCenter, radiusMeters: radius }
					: null
			);
		} else {
			onChange(
				vertices.length >= 3 ? { type: "polygon", vertices } : null
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, radius, circleCenter, vertices]);

	// Map clicks: place the circle centre, or append a polygon vertex.
	useEffect(() => {
		if (!map) return;
		const handler = (event: any) => {
			const point = {
				lat: round(event.latlng.lat),
				lng: round(event.latlng.lng),
			};
			if (mode === "circle") setCircleCenter(point);
			else setVertices((prev) => [...prev, point]);
		};
		map.on("click", handler);
		return () => map.off("click", handler);
	}, [map, mode]);

	// Redraw whenever the shape, mode or buffer changes.
	useEffect(() => {
		if (!L || !map) return;
		layersRef.current.forEach((layer) => layer.remove());
		layersRef.current = [];

		const add = (layer: any) => {
			layer.addTo(map);
			layersRef.current.push(layer);
			return layer;
		};

		const style = {
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
			opacity: 0.55,
		};

		if (mode === "circle" && circleCenter) {
			const center: [number, number] = [circleCenter.lat, circleCenter.lng];
			add(L.circle(center, { radius, ...style }));
			if (bufferMeters > 0) {
				add(L.circle(center, { radius: radius + bufferMeters, ...bufferStyle }));
			}
			const marker = add(L.marker(center, { draggable: true }));
			marker.on("dragend", () => {
				const position = marker.getLatLng();
				setCircleCenter({ lat: round(position.lat), lng: round(position.lng) });
			});
		}

		if (mode === "polygon" && vertices.length) {
			const latLngs = vertices.map((v) => [v.lat, v.lng]);
			if (vertices.length >= 3) {
				add(L.polygon(latLngs, style));
			} else {
				// Not a fence yet — show the run of points so it reads as in-progress.
				add(L.polyline(latLngs, { color: "#059669", weight: 2, dashArray: "4 4" }));
			}

			vertices.forEach((vertex, index) => {
				const handle = add(
					L.circleMarker([vertex.lat, vertex.lng], {
						radius: 7,
						color: "#ffffff",
						weight: 2,
						fillColor: "#059669",
						fillOpacity: 1,
					})
				);
				handle.bindTooltip(String(index + 1), {
					permanent: true,
					direction: "center",
				});
				// Leaflet circleMarkers are not draggable, so drive it off the map's
				// own mouse events while the handle is held.
				handle.on("mousedown", () => {
					const move = (moveEvent: any) =>
						setVertices((prev) => {
							const next = [...prev];
							next[index] = {
								lat: round(moveEvent.latlng.lat),
								lng: round(moveEvent.latlng.lng),
							};
							return next;
						});
					const up = () => {
						map.off("mousemove", move);
						map.off("mouseup", up);
						map.dragging.enable();
					};
					map.dragging.disable();
					map.on("mousemove", move);
					map.on("mouseup", up);
				});
			});
		}
	}, [L, map, mode, radius, bufferMeters, circleCenter, vertices]);

	const useSchoolLocation = async () => {
		try {
			const location = await fetchSchoolLocation();
			if (!location?.center) {
				toast.error("The school has no saved coordinates yet.");
				return;
			}
			setMode("circle");
			setCircleCenter(location.center);
			setRadius(location.radiusMeters || 150);
			map?.setView([location.center.lat, location.center.lng], 16);
		} catch {
			toast.error("Could not read the school location.");
		}
	};

	const clearShape = () => {
		if (mode === "circle") setCircleCenter(null);
		else setVertices([]);
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Tabs value={mode} onValueChange={(next) => setMode(next as "circle" | "polygon")}>
					<TabsList>
						<TabsTrigger value="circle">Circle</TabsTrigger>
						<TabsTrigger value="polygon">Polygon</TabsTrigger>
					</TabsList>
				</Tabs>
				<div className="flex flex-wrap items-center gap-2">
					<Button type="button" variant="outline" size="sm" onClick={useSchoolLocation}>
						<School className="size-4" /> Use school location
					</Button>
					{mode === "polygon" && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setVertices((prev) => prev.slice(0, -1))}
							disabled={!vertices.length}
						>
							<Undo2 className="size-4" /> Undo
						</Button>
					)}
					<Button type="button" variant="outline" size="sm" onClick={clearShape}>
						<Trash2 className="size-4" /> Clear
					</Button>
				</div>
			</div>

			{error ? (
				<div className="text-muted-foreground flex h-80 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
					<MapPinOff className="size-5" />
					Map could not be loaded. Check your connection and reload.
				</div>
			) : (
				<div className="bg-muted h-80 overflow-hidden rounded-lg border">
					<div ref={containerRef} className="h-full w-full" />
				</div>
			)}

			<p className="text-muted-foreground text-xs">
				{mode === "circle"
					? "Click the map to place the campus centre, then drag the pin to fine-tune."
					: `Click to add boundary points (${vertices.length} placed — at least 3 needed). Drag a point to move it.`}
			</p>

			{mode === "circle" && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label>Radius</Label>
						<span className="text-muted-foreground text-sm tabular-nums">{radius} m</span>
					</div>
					<div className="flex items-center gap-3">
						<Slider
							value={[radius]}
							min={20}
							max={2000}
							step={10}
							onValueChange={([next]) => setRadius(next)}
							className="flex-1"
						/>
						<Input
							type="number"
							min={20}
							max={2000}
							value={radius}
							onChange={(event) => {
								const next = Number(event.target.value);
								if (Number.isFinite(next)) setRadius(next);
							}}
							className="w-24"
						/>
					</div>
				</div>
			)}

			<p className="text-muted-foreground rounded-md border border-dashed p-3 text-xs">
				The dashed ring shows the real tolerance — your boundary plus the{" "}
				{bufferMeters} m accuracy buffer. Anyone inside that ring counts as on
				campus, because phone GPS indoors is routinely off by 50–150 m.
			</p>
		</div>
	);
}

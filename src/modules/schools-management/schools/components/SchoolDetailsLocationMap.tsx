"use client";

import { cn } from "@/shared/lib/utils";
import { useEffect, useRef, useState } from "react";

type LeafletInstance = any;

type Props = {
	latitude: number | null;
	longitude: number | null;
	className?: string;
};

const SELECTED_ZOOM = 15;
const LEAFLET_SCRIPT_ID = "leaflet-script";
const LEAFLET_CSS_ID = "leaflet-css";

let leafletLoader: Promise<LeafletInstance> | null = null;

function loadLeaflet() {
	if (typeof window === "undefined") {
		return Promise.reject(new Error("Leaflet can only load in the browser"));
	}

	if ((window as any).L) {
		return Promise.resolve((window as any).L);
	}

	if (leafletLoader) {
		return leafletLoader;
	}

	leafletLoader = new Promise((resolve, reject) => {
		if (!document.getElementById(LEAFLET_CSS_ID)) {
			const link = document.createElement("link");
			link.id = LEAFLET_CSS_ID;
			link.rel = "stylesheet";
			link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
			document.head.appendChild(link);
		}

		const existingScript = document.getElementById(LEAFLET_SCRIPT_ID);
		if (existingScript) {
			existingScript.addEventListener("load", () => resolve((window as any).L));
			existingScript.addEventListener("error", reject);
			return;
		}

		const script = document.createElement("script");
		script.id = LEAFLET_SCRIPT_ID;
		script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
		script.async = true;
		script.onload = () => resolve((window as any).L);
		script.onerror = reject;
		document.body.appendChild(script);
	});

	return leafletLoader;
}

function isValidCoordinate(lat: unknown, lng: unknown) {
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

export function SchoolDetailsLocationMap({ latitude, longitude, className }: Props) {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<LeafletInstance | null>(null);
	const [hasMapError, setHasMapError] = useState(false);

	useEffect(() => {
		if (!isValidCoordinate(latitude, longitude)) {
			return;
		}

		let disposed = false;

		loadLeaflet()
			.then((L) => {
				if (disposed || !mapContainerRef.current || mapRef.current) {
					return;
				}

				const latLng: [number, number] = [Number(latitude), Number(longitude)];
				const map = L.map(mapContainerRef.current, {
					center: latLng,
					zoom: SELECTED_ZOOM,
					scrollWheelZoom: false,
				});

				const street = L.tileLayer(
					"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
					{
						maxZoom: 19,
						attribution: "&copy; OpenStreetMap contributors",
					}
				);
				const light = L.tileLayer(
					"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
					{
						maxZoom: 20,
						attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
					}
				);
				const dark = L.tileLayer(
					"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
					{
						maxZoom: 20,
						attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
					}
				);
				const topo = L.tileLayer(
					"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
					{
						maxZoom: 17,
						attribution: "&copy; OpenStreetMap contributors, SRTM, OpenTopoMap",
					}
				);

				street.addTo(map);
				L.control
					.layers(
						{
							Street: street,
							Light: light,
							Dark: dark,
							Topographic: topo,
						},
						undefined,
						{ position: "topright" }
					)
					.addTo(map);
				L.marker(latLng).addTo(map);

				mapRef.current = map;
				setTimeout(() => map.invalidateSize(), 0);
			})
			.catch(() => setHasMapError(true));

		return () => {
			disposed = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, [latitude, longitude]);

	if (!isValidCoordinate(latitude, longitude)) {
		return (
			<div
				className={cn(
					"text-muted-foreground flex h-[360px] items-center justify-center rounded-lg border border-dashed text-sm",
					className
				)}
			>
				Location coordinates are not available.
			</div>
		);
	}

	if (hasMapError) {
		return (
			<div
				className={cn(
					"text-muted-foreground flex h-[360px] items-center justify-center rounded-lg border border-dashed text-sm",
					className
				)}
			>
				Map could not be loaded.
			</div>
		);
	}

	return (
		<div className={cn("h-[360px] overflow-hidden rounded-lg border bg-muted", className)}>
			<div ref={mapContainerRef} className="h-full w-full" />
		</div>
	);
}

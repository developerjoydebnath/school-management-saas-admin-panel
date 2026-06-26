"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { Search, X } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";

type LeafletInstance = any;

type Props = {
	control: Control<any>;
	setValue: UseFormSetValue<any>;
	className?: string;
};

type SearchResult = {
	display_name: string;
	lat: string;
	lon: string;
};

const BANGLADESH_CENTER: [number, number] = [23.685, 90.3563];
const DEFAULT_ZOOM = 7;
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

function isValidCoordinate(lat: unknown, lng: unknown): lat is number {
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

function roundCoordinate(value: number) {
	return Number(value.toFixed(6));
}

function getResultCoordinates(result: SearchResult): [number, number] | null {
	const lat = Number(result.lat);
	const lng = Number(result.lon);

	if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
		return null;
	}

	return [lat, lng];
}

export function SchoolLocationMap({ control, setValue, className }: Props) {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<LeafletInstance | null>(null);
	const markerRef = useRef<LeafletInstance | null>(null);
	const leafletRef = useRef<LeafletInstance | null>(null);
	const lastSyncedPointRef = useRef<string>("");
	const latitude = useWatch({ control, name: "latitude" });
	const longitude = useWatch({ control, name: "longitude" });
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState("");

	useEffect(() => {
		let disposed = false;

		loadLeaflet()
			.then((L) => {
				if (disposed || !mapContainerRef.current || mapRef.current) {
					return;
				}

				leafletRef.current = L;

				const initialCenter = isValidCoordinate(latitude, longitude)
					? [latitude, longitude]
					: BANGLADESH_CENTER;
				const initialZoom = isValidCoordinate(latitude, longitude)
					? SELECTED_ZOOM
					: DEFAULT_ZOOM;

				const map = L.map(mapContainerRef.current, {
					center: initialCenter,
					zoom: initialZoom,
					scrollWheelZoom: true,
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

				map.on("click", (event: any) => {
					const lat = roundCoordinate(event.latlng.lat);
					const lng = roundCoordinate(event.latlng.lng);

					setValue("latitude", lat, {
						shouldDirty: true,
						shouldTouch: true,
						shouldValidate: true,
					});
					setValue("longitude", lng, {
						shouldDirty: true,
						shouldTouch: true,
						shouldValidate: true,
					});
				});

				mapRef.current = map;
				setTimeout(() => map.invalidateSize(), 0);
			})
			.catch(() => {
				setSearchError("Map could not be loaded. Please try again.");
			});

		return () => {
			disposed = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
				markerRef.current = null;
			}
		};
	}, [setValue]);

	useEffect(() => {
		if (!mapRef.current || !leafletRef.current) {
			return;
		}

		if (!isValidCoordinate(latitude, longitude)) {
			if (markerRef.current) {
				markerRef.current.remove();
				markerRef.current = null;
			}
			lastSyncedPointRef.current = "";
			return;
		}

		const pointKey = `${latitude},${longitude}`;
		const L = leafletRef.current;
		const latLng: [number, number] = [latitude, longitude];

		if (!markerRef.current) {
			markerRef.current = L.marker(latLng).addTo(mapRef.current);
		} else {
			markerRef.current.setLatLng(latLng);
		}

		if (lastSyncedPointRef.current !== pointKey) {
			mapRef.current.setView(latLng, Math.max(mapRef.current.getZoom(), SELECTED_ZOOM));
			lastSyncedPointRef.current = pointKey;
		}
	}, [latitude, longitude]);

	const handleSearch = async () => {
		const trimmedQuery = searchQuery.trim();

		if (!trimmedQuery) {
			setResults([]);
			setSearchError("");
			return;
		}

		try {
			setIsSearching(true);
			setSearchError("");
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					trimmedQuery
				)}&countrycodes=bd&limit=5`
			);

			if (!response.ok) {
				throw new Error("Location search failed");
			}

			const data = (await response.json()) as SearchResult[];
			setResults(data);
			if (!data.length) {
				setSearchError("No locations found.");
				return;
			}

			const topResultCoordinates = getResultCoordinates(data[0]);
			if (topResultCoordinates && mapRef.current) {
				mapRef.current.flyTo(topResultCoordinates, SELECTED_ZOOM, {
					duration: 1.2,
				});
			}
		} catch {
			setSearchError("Location search failed. Please try again.");
		} finally {
			setIsSearching(false);
		}
	};

	const handleResultSelect = (result: SearchResult) => {
		const coordinates = getResultCoordinates(result);

		if (!coordinates || !mapRef.current) {
			return;
		}

		mapRef.current.flyTo(coordinates, SELECTED_ZOOM, {
			duration: 1.2,
		});
		setResults([]);
		setSearchQuery(result.display_name);
	};

	const handleSearchClear = () => {
		setSearchQuery("");
		setResults([]);
		setSearchError("");
	};

	return (
		<div className={cn("space-y-3", className)}>
			<div className="relative h-[420px] overflow-hidden rounded-lg border bg-muted">
				<div ref={mapContainerRef} className="h-full w-full" />
				<div
					className="absolute left-1/2 -translate-x-1/2 top-3 z-[500] flex w-[calc(100%-1.5rem)] max-w-md gap-2"
				>
					<div className="relative flex-1">
						<Input
							type="search"
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
								if (event.key === "Enter") {
									event.preventDefault();
									void handleSearch();
								}
							}}
							placeholder="Search location"
							className="h-10 bg-white! pr-10 text-black! shadow-sm"
						/>
						{searchQuery && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={handleSearchClear}
								className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-black hover:bg-black/10"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
					<Button
						type="button"
						size="icon-lg"
						disabled={isSearching}
						onClick={() => void handleSearch()}
						className="bg-white! text-black!"
					>
						<Search className="h-4 w-4" />
					</Button>
				</div>
				{results.length > 0 && (
					<div className="absolute left-1/2 top-16 z-[500] max-h-64 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 overflow-auto rounded-md border bg-background shadow-md">
						{results.map((result) => (
							<button
								key={`${result.lat}-${result.lon}-${result.display_name}`}
								type="button"
								onClick={() => handleResultSelect(result)}
								className="w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
							>
								{result.display_name}
							</button>
						))}
					</div>
				)}
			</div>
			{searchError && <p className="text-sm text-muted-foreground">{searchError}</p>}
		</div>
	);
}

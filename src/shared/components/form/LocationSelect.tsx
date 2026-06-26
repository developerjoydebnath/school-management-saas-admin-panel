"use client";

import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import { useSWR } from "@/shared/hooks/use-swr";

interface GeoItem {
	id: number;
	bnName: string;
	enName: string;
}

interface LocationSelectProps {
	control: any;
	// Field names (defaults)
	divisionName?: string;
	districtName?: string;
	upazilaName?: string;
	unionName?: string;
	// Labels
	divisionLabel?: string;
	districtLabel?: string;
	upazilaLabel?: string;
	unionLabel?: string;
	// Visibility
	divisionHidden?: boolean;
	districtHidden?: boolean;
	upazilaHidden?: boolean;
	unionHidden?: boolean;
	// Required
	divisionRequired?: boolean;
	districtRequired?: boolean;
	upazilaRequired?: boolean;
}

interface FieldWrapperProps {
	name: string;
	label: string;
	required?: boolean;
	hidden?: boolean;
	disabled?: boolean;
	options: GeoItem[];
	isLoading?: boolean;
	control: any;
	onChangeSideEffect?: (val: number | null) => void;
}

function LocationField({
	name,
	label,
	required = false,
	hidden = false,
	disabled = false,
	options,
	isLoading = false,
	control,
	onChangeSideEffect,
}: FieldWrapperProps) {
	const { field, fieldState } = useController({ name, control });

	if (hidden) return null;

	return (
		<div className="flex flex-col gap-2">
			<Label
				htmlFor={name}
				className={cn("text-muted-foreground text-sm font-medium", required ? "gap-0" : "gap-1")}
			>
				{label}
				{required ? (
					<span className="text-destructive">*</span>
				) : (
					<span>(Optional)</span>
				)}
			</Label>
			<Select
				name={name}
				value={field.value ? String(field.value) : undefined}
				disabled={disabled || isLoading}
				onValueChange={(value) => {
					const val = value ? Number(value) : null;
					field.onChange(val);
					onChangeSideEffect?.(val);
				}}
			>
				<SelectTrigger
					id={name}
					className={cn(
						"h-10! w-full",
						(disabled || isLoading) && "cursor-not-allowed opacity-50"
					)}
				>
					<SelectValue
						placeholder={isLoading ? `Loading ${label}...` : `Select ${label}`}
					/>
				</SelectTrigger>
				<SelectContent className="p-1">
					{options.map((opt) => (
						<SelectItem
							key={opt.id}
							value={String(opt.id)}
							className="cursor-pointer py-2"
						>
							{opt.enName} ({opt.bnName})
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{fieldState.error && (
				<p className="text-sm text-red-500">{fieldState.error.message}</p>
			)}
		</div>
	);
}

export function LocationSelect({
	control,
	divisionName = "divisionId",
	districtName = "districtId",
	upazilaName = "upazilaId",
	unionName = "unionId",
	divisionLabel = "Division",
	districtLabel = "District",
	upazilaLabel = "Upazila",
	unionLabel = "Union",
	divisionHidden = false,
	districtHidden = false,
	upazilaHidden = false,
	unionHidden = true,
	divisionRequired = true,
	districtRequired = true,
	upazilaRequired = false,
}: LocationSelectProps) {
	const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
	const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
	const [selectedUpazilaId, setSelectedUpazilaId] = useState<number | null>(null);

	const { field: divisionField } = useController({ name: divisionName, control });
	const { field: districtField } = useController({ name: districtName, control });

	// Sync initial values from form (edit mode)
	useEffect(() => {
		if (divisionField.value) setSelectedDivisionId(Number(divisionField.value));
	}, [divisionField.value]);

	useEffect(() => {
		if (districtField.value) setSelectedDistrictId(Number(districtField.value));
	}, [districtField.value]);

	// Fetch Data
	const { data: divisionsRes, isLoading: loadingDivisions } = useSWR(
		"/public/locations/divisions"
	);
	const { data: districtsRes, isLoading: loadingDistricts } = useSWR(
		selectedDivisionId ? `/public/locations/districts/${selectedDivisionId}` : null
	);
	const { data: upazilasRes, isLoading: loadingUpazilas } = useSWR(
		selectedDistrictId ? `/public/locations/upazilas/${selectedDistrictId}` : null
	);
	const { data: unionsRes, isLoading: loadingUnions } = useSWR(
		selectedUpazilaId && !unionHidden ? `/public/locations/unions/${selectedUpazilaId}` : null
	);

	// Safe Extraction from response { data: GeoItem[] }
	const extractData = (res: any): GeoItem[] => {
		if (Array.isArray(res)) return res;
		if (Array.isArray(res?.data)) return res.data;
		return [];
	};

	const divisions = extractData(divisionsRes);
	const districts = extractData(districtsRes);
	const upazilas = extractData(upazilasRes);
	const unions = extractData(unionsRes);

	return (
		<>
			<LocationField
				name={divisionName}
				label={divisionLabel}
				required={divisionRequired}
				hidden={divisionHidden}
				options={divisions}
				isLoading={loadingDivisions}
				control={control}
				onChangeSideEffect={(val) => {
					setSelectedDivisionId(val);
					setSelectedDistrictId(null);
					setSelectedUpazilaId(null);
					// Reset child fields
					districtField.onChange(null);
				}}
			/>

			<LocationField
				name={districtName}
				label={districtLabel}
				required={districtRequired}
				hidden={districtHidden}
				disabled={!selectedDivisionId}
				options={districts}
				isLoading={loadingDistricts}
				control={control}
				onChangeSideEffect={(val) => {
					setSelectedDistrictId(val);
					setSelectedUpazilaId(null);
				}}
			/>

			<LocationField
				name={upazilaName}
				label={upazilaLabel}
				required={upazilaRequired}
				hidden={upazilaHidden}
				disabled={!selectedDistrictId}
				options={upazilas}
				isLoading={loadingUpazilas}
				control={control}
				onChangeSideEffect={(val) => {
					setSelectedUpazilaId(val);
				}}
			/>

			{/* Union – hidden by default */}
			{!unionHidden && (
				<LocationField
					name={unionName}
					label={unionLabel}
					hidden={false}
					disabled={!selectedUpazilaId}
					options={unions}
					isLoading={loadingUnions}
					control={control}
				/>
			)}
		</>
	);
}

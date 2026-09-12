"use client";

import UploadImage from "@/shared/components/form/UploadImage";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import dynamic from "next/dynamic";
import type { ChangeEvent } from "react";
import { useController, type UseControllerProps } from "react-hook-form";
import { match } from "ts-pattern";
import ClassRoomSelect from "./ClassRoomSelect";
import ClassSelect from "./ClassSelect";
import ClassSelection from "./ClassSelection";
import DatePicker from "./DatePicker";
import DepartmentSelect from "./DepartmentSelect";
import DesignationSelect from "./DesignationSelect";
import ExamSelect from "./ExamSelect";
import GeoLocationSelect from "./GeoLocationSelect";
import InventoryCategorySelect from "./InventoryCategorySelect";
import InventoryItemSelect from "./InventoryItemSelect";
import InventoryLocationSelect from "./InventoryLocationSelect";
import MultiCheckbox from "./MultiCheckbox";
import NumberInput from "./NumberInput";
import PasswordInput from "./PasswordInput";
import PaymentMethodSelect from "./PaymentMethodSelect";
import SchoolSelect from "./SchoolSelect";
import SchoolSubscriptionSelect from "./SchoolSubscriptionSelect";
import SectionSelect from "./SectionSelect";
import SessionSelect from "./SessionSelect";
import ShiftSelect from "./ShiftSelect";
import SubjectSelection from "./SubjectSelection";
import SubjectSingleSelection from "./SubjectSingleSelection";
import SubscriptionPlanSelect from "./SubscriptionPlanSelect";
import TagInput from "./TagInput";
import TeacherSelection from "./TeacherSelection";
import UploadDocumentMulti from "./UploadDocumentMulti";
import UploadDocumentSingle from "./UploadDocumentSingle";
import UserSingleSelection from "./UserSingleSelection";
import VoucherSelect from "./VoucherSelect";

/**
 * The rich editor is loaded on demand, never with the form.
 *
 * It used to be a plain static import, which dragged the whole tiptap and
 * ProseMirror graph into EVERY page that renders an InputField -- around a
 * megabyte of editor for forms that only have text boxes and selects.
 *
 * That also caused a real crash. `prosemirror-gapcursor` registers itself
 * globally at module scope (`Selection.jsonID("gapcursor", ...)`), which throws
 * "Duplicate use of selection JSON ID gapcursor" if the module body ever runs
 * twice. Reachable statically from every form route, it was being emitted into
 * more than one chunk, so the second such page visited in a session
 * re-registered it and died. One lazily-loaded chunk is fetched once and cached
 * by the module runtime, so it can only register once.
 *
 * `ssr: false` because the editor is browser-only anyway (it touches document,
 * selection and the speech APIs), and because per the Next docs the option is
 * only honoured inside a Client Component -- hence the "use client" above.
 */
const SimpleEditor = dynamic(
	() => import("./rich-editor/simple-editor").then((mod) => mod.SimpleEditor),
	{
		ssr: false,
		loading: () => (
			<div className="bg-muted/40 h-64 w-full animate-pulse rounded-md border" />
		),
	},
);

interface FormFieldProps extends UseControllerProps {
	label?: string;
	moduleName?: string;
	placeholder?: string;
	type?: string;
	required?: boolean;
	options?: { label: string; value: string }[];
	defaultPreview?: string;
	className?: string;
	labelClass?: string;
	helperText?: string;
	/**
	 * Reserves the height of a block label above a `switch`/`checkbox`.
	 *
	 * Those two render their own label INSIDE the control box, so in a grid
	 * beside a select or input they start a label's height higher than their
	 * neighbour and the row looks broken. Opt-in rather than automatic: a
	 * switch standing on its own must not gain the extra space.
	 */
	alignWithLabel?: boolean;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	control: any;
	dependencyId?: string;
	sessionId?: string;
	/**
	 * Secondary scope for selects that filter on more than one parent, e.g.
	 * `examSelect` narrows by session (via `dependencyId`) *and* class.
	 */
	classId?: string;
	/** Narrows `designationSelect` to a designation type ("teacher" | "staff"). */
	designationType?: string;
	placeholderBase64?: string | null;
	disabled?: boolean;
	fieldClass?: string;
	skipLocalization?: boolean;
	excludeId?: string;
	/** Rich-text editor options, forwarded to SimpleEditor for `textEditor`. */
	enableTables?: boolean;
	documentMode?: boolean;
	enableVoiceInput?: boolean;
	editorClassName?: string;
}

export default function InputField({
	required = false,
	type = "text",
	labelClass,
	className,
	helperText,
	alignWithLabel,
	...props
}: FormFieldProps) {
	const { field, fieldState } = useController(props);
	const isPhoneInput = type === "tel" || type === "phone";

	const handleNativeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (isPhoneInput) {
			field.onChange(event.target.value.replace(/\D/g, "").slice(0, 11));
			return;
		}
		field.onChange(event);
	};

	return (
		<div className={cn("flex w-full flex-col gap-2", props.fieldClass)}>
			{alignWithLabel && (type === "switch" || type === "checkbox") && (
				<span aria-hidden className="invisible w-full text-sm font-medium">
					{props.label || " "}
				</span>
			)}
			{/* Checkbox and Switch render their own inline label – skip the block label */}
			{props.label && type !== "switch" && type !== "checkbox" && (
				<Label
					htmlFor={
						[
							"text",
							"email",
							"date",
							"tel",
							"phone",
							"url",
							"search",
							"color",
							"time",
							"number",
							"password",
							"textarea",
							"switch",
						].includes(type)
							? field.name
							: undefined
					}
					className={cn(
						"text-muted-foreground w-full text-sm font-medium",
						required ? "gap-0" : "gap-1",
						labelClass
					)}
				>
					{props.label}
					{required ? (
						<span className="text-destructive">*</span>
					) : (
						<span>(Optional)</span>
					)}
				</Label>
			)}
			{match(type)
				.with("textarea", () => (
					<Textarea
						{...field}
						value={field.value ?? ""}
						placeholder={props?.placeholder}
						disabled={props.disabled}
						className={cn("h-32", className)}
					/>
				))

				.with("switch", () => (
					<div className="dark:bg-input/30 flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3">
						<p>{props.label}</p>
						<Switch
							id={field.name}
							checked={!!field.value}
							onCheckedChange={field.onChange}
							className={className}
						/>
					</div>
				))

				.with("checkbox", () => (
					<div className="dark:bg-input/30 flex h-10 w-full items-center justify-start gap-2 rounded-md border bg-transparent px-3">
						<>
							{type === "checkbox" && (
								<Checkbox
									id={field.name}
									checked={!!field.value}
									onCheckedChange={field.onChange}
									disabled={props.disabled}
									className={className}
								/>
							)}
							{props.label && (
								<Label
									htmlFor={field.name}
									className={cn("cursor-pointer text-sm font-medium", labelClass)}
								>
									{props.label}
								</Label>
							)}
						</>
					</div>
				))

				.with("textEditor", () => (
					<SimpleEditor
						value={field.value}
						onValueChange={field.onChange}
						className={className}
						enableTables={props.enableTables}
						documentMode={props.documentMode}
						enableVoiceInput={props.enableVoiceInput}
						editorClassName={props.editorClassName}
					/>
				))

				// file
				.with("file", () => (
					<UploadImage
						className={className}
						placeholderBase64={props.placeholderBase64}
						{...props}
						{...field}
					/>
				))
				// document-multi
				.with("document-multi", () => (
					<UploadDocumentMulti className={className} {...props} {...field} />
				))
				// document-single
				.with("document-single", () => (
					<UploadDocumentSingle className={className} {...props} {...field} />
				))
				// radio type
				.with("radio", () => (
					<RadioGroup
						value={field.value}
						onValueChange={field.onChange}
						className={cn("flex items-center gap-2", className)}
					>
						{props.options?.map((option) => (
							<Label key={option.value} className="cursor-pointer font-normal">
								<RadioGroupItem value={option.value} />
								<span> {option.label} </span>
							</Label>
						))}
					</RadioGroup>
				))

				// multi-checkbox
				.with("multi-checkbox", () => (
					<MultiCheckbox
						value={field.value || []}
						onChange={field.onChange}
						options={props.options || []}
						className={className}
					/>
				))

				// number
				.with("number", () => (
					<NumberInput
						type="number"
						min={props.min}
						max={props.max}
						step={props.step}
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
					/>
				))

				// Type select option
				.with("select", () => {
					const selectedValue =
						field.value === undefined || field.value === null || field.value === ""
							? undefined
							: field.value.toString();

					return (
						<Select
							name={field.name}
							value={selectedValue}
							onValueChange={field.onChange}
							disabled={props.disabled}
						>
							<SelectTrigger className={cn("h-10! w-full", className)}>
								<SelectValue placeholder={props.placeholder} />
							</SelectTrigger>
							<SelectContent className="p-1" sideOffset={4}>
								{props?.options?.map((opt) => (
									<SelectItem
										key={opt.value}
										value={opt.value}
										className="cursor-pointer py-2"
									>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					);
				})

				// Type native_select
				.with("native_select", () => (
					<NativeSelect
						name={field.name}
						value={field.value?.toString()}
						onChange={field.onChange}
						disabled={props.disabled}
						className={cn("h-10", className)}
					>
						{props?.options?.map((opt) => (
							<NativeSelectOption key={opt.value} value={opt.value}>
								{opt.label}
							</NativeSelectOption>
						))}
					</NativeSelect>
				))

				.with("password", () => (
					<PasswordInput
						name={field.name}
						placeholder={props.placeholder}
						className={className}
						value={field.value}
						onChange={field.onChange}
						hasError={!!fieldState.error}
					/>
				))

				// Date Picker
				.with("DatePicker", () => (
					<DatePicker
						value={field.value}
						onValueChange={field.onChange}
						className={className}
					/>
				))

				// tags
				.with("tags", () => (
					<TagInput
						value={field.value || []}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// classSelection
				.with("classSelection", () => (
					<ClassSelection
						value={field.value || []}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						skipLocalization={props.skipLocalization}
					/>
				))

				// subjectSelection
				.with("subjectSelection", () => (
					<SubjectSelection
						value={field.value || []}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						classId={props.dependencyId}
					/>
				))

				// subjectSingleSelect
				.with("subjectSingleSelect", () => (
					<SubjectSingleSelection
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						classId={props.dependencyId}
					/>
				))

				// classSelect
				.with("classSelect", () => (
					<ClassSelect
						value={field.value}
						onChange={field.onChange}
						sessionId={props.dependencyId}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
					/>
				))

				// classRoomSelect
				.with("classRoomSelect", () => (
					<ClassRoomSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
					/>
				))

				// inventoryCategorySelect
				.with("inventoryCategorySelect", () => (
					<InventoryCategorySelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
					/>
				))

				// inventoryItemSelect
				.with("inventoryItemSelect", () => (
					<InventoryItemSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
					/>
				))

				// inventoryLocationSelect
				.with("inventoryLocationSelect", () => (
					<InventoryLocationSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
						itemId={props.dependencyId}
						excludeId={props.excludeId}
					/>
				))

				// paymentMethodSelect
				.with("paymentMethodSelect", () => (
					<PaymentMethodSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
					/>
				))

				// geo location selects
				.with("divisionSelect", () => (
					<GeoLocationSelect
						type="division"
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
					/>
				))

				.with("districtSelect", () => (
					<GeoLocationSelect
						type="district"
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						dependencyId={props.dependencyId}
						disabled={props.disabled}
					/>
				))

				.with("upazilaSelect", () => (
					<GeoLocationSelect
						type="upazila"
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						dependencyId={props.dependencyId}
						disabled={props.disabled}
					/>
				))

				// sectionSelect

				// userSingleSelect
				.with("userSingleSelect", () => (
					<UserSingleSelection
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
					/>
				))
				.with("sectionSelect", () => (
					<SectionSelect
						value={field.value}
						onChange={field.onChange}
						classId={props.dependencyId}
						sessionId={props.sessionId}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// sessionSelect
				.with("sessionSelect", () => (
					<SessionSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// examSelect
				.with("examSelect", () => (
					<ExamSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						sessionId={props.dependencyId}
						classId={props.classId}
						disabled={props.disabled}
					/>
				))

				// shiftSelect
				.with("shiftSelect", () => (
					<ShiftSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
					/>
				))

				// teacherSelect
				.with("teacherSelect", () => (
					<TeacherSelection
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// designationSelect
				.with("designationSelect", () => (
					<DesignationSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
						type={props.designationType}
					/>
				))

				// departmentSelect
				.with("departmentSelect", () => (
					<DepartmentSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
					/>
				))

				// schoolSelect
				.with("schoolSelect", () => (
					<SchoolSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// subscriptionPlanSelect
				.with("subscriptionPlanSelect", () => (
					<SubscriptionPlanSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
					/>
				))

				// schoolSubscriptionSelect
				.with("schoolSubscriptionSelect", () => (
					<SchoolSubscriptionSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						schoolId={props.dependencyId}
					/>
				))

				// voucherSelect
				.with("voucherSelect", () => (
					<VoucherSelect
						value={field.value}
						onChange={field.onChange}
						placeholder={props.placeholder}
						className={className}
						disabled={props.disabled}
					/>
				))

				// native type
				.with(
					"text",
					"email",
					"date",
					"tel",
					"phone",
					"url",
					"search",
					"color",
					"time",
					"datetime-local",
					() => (
						<Input
							id={field.name}
							type={isPhoneInput ? "tel" : type}
							inputMode={isPhoneInput ? "numeric" : undefined}
							pattern={isPhoneInput ? "[0-9]*" : undefined}
							maxLength={isPhoneInput ? 11 : undefined}
							min={props.min}
							max={props.max}
							placeholder={props.placeholder}
							{...field}
							onChange={handleNativeInputChange}
							value={field.value ?? ""}
							disabled={props.disabled}
							className={cn(
								fieldState.error ? "border-red-500 focus:ring-red-500" : "",
								"focus:border-primary focus:ring-primary h-10 rounded-md shadow-none",
								className
							)}
						/>
					)
				)
				.otherwise(() => null)}

			{helperText && (
				<p data-helper-text className="text-sm text-gray-500">
					{helperText}
				</p>
			)}

			{fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
		</div>
	);
}

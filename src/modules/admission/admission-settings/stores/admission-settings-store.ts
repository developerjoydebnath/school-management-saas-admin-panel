import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADMISSION_FIELDS, AdmissionField } from "../constants/admission-fields";

interface AdmissionSettingsState {
	admissionMode: "fast" | "full";
	fieldVisibility: Record<string, boolean>;
	fieldRequired: Record<string, boolean>;
	customFields: AdmissionField[];
	updateAdmissionMode: (mode: "fast" | "full") => void;
	updateFieldVisibility: (fieldId: string, value: boolean) => void;
	updateFieldRequired: (fieldId: string, value: boolean) => void;
	addCustomField: (field: AdmissionField) => void;
	removeCustomField: (fieldId: string) => void;
	resetSettings: () => void;
}

export const useAdmissionSettingsStore = create<AdmissionSettingsState>()(
	persist(
		(set) => ({
			admissionMode: "fast",
			fieldVisibility: ADMISSION_FIELDS.reduce(
				(acc, field) => {
					acc[field.id] = true; // All shown by default in V2
					return acc;
				},
				{} as Record<string, boolean>
			),
			fieldRequired: ADMISSION_FIELDS.reduce(
				(acc, field) => {
					acc[field.id] = field.isStep1 || field.isFixed || false;
					return acc;
				},
				{} as Record<string, boolean>
			),
			customFields: [],

			updateAdmissionMode: (mode) => set({ admissionMode: mode }),

			updateFieldVisibility: (fieldId, value) =>
				set((state) => ({
					fieldVisibility: { ...state.fieldVisibility, [fieldId]: value },
				})),

			updateFieldRequired: (fieldId, value) =>
				set((state) => ({
					fieldRequired: { ...state.fieldRequired, [fieldId]: value },
				})),

			addCustomField: (field) =>
				set((state) => ({
					customFields: [...state.customFields, { ...field, isCustom: true }],
					fieldVisibility: { ...state.fieldVisibility, [field.id]: true },
					fieldRequired: { ...state.fieldRequired, [field.id]: false },
				})),

			removeCustomField: (fieldId) =>
				set((state) => {
					const { [fieldId]: _v, ...restVisibility } = state.fieldVisibility;
					const { [fieldId]: _r, ...restRequired } = state.fieldRequired;
					return {
						customFields: state.customFields.filter((f) => f.id !== fieldId),
						fieldVisibility: restVisibility,
						fieldRequired: restRequired,
					};
				}),

			resetSettings: () =>
				set({
					admissionMode: "fast",
					fieldVisibility: ADMISSION_FIELDS.reduce(
						(acc, field) => {
							acc[field.id] = true;
							return acc;
						},
						{} as Record<string, boolean>
					),
					fieldRequired: ADMISSION_FIELDS.reduce(
						(acc, field) => {
							acc[field.id] = field.isStep1 || field.isFixed || false;
							return acc;
						},
						{} as Record<string, boolean>
					),
					customFields: [],
				}),
		}),
		{
			name: "admission-settings-v2",
		}
	)
);

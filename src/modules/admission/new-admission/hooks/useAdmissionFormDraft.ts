"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

export const ADMISSION_DRAFT_VERSION = 1;
const DRAFT_DEBOUNCE_MS = 800;
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export type AdmissionDraftPayload = {
	version: number;
	values: Record<string, any>;
	step: number;
	savedAt: number;
};

function stripFilesForDraft(value: any): any {
	if (value instanceof File) return undefined;
	if (Array.isArray(value)) {
		return value
			.map((item) => stripFilesForDraft(item))
			.filter((item) => item !== undefined);
	}
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value)
				.map(([key, item]) => [key, stripFilesForDraft(item)])
				.filter(([, item]) => item !== undefined)
		);
	}
	return value;
}

function scheduleIdle(callback: () => void) {
	if (typeof window === "undefined") return undefined;
	const idleCallback = window.requestIdleCallback;
	if (idleCallback) {
		const id = idleCallback(callback, { timeout: 1500 });
		return () => window.cancelIdleCallback?.(id);
	}
	const id = window.setTimeout(callback, 0);
	return () => window.clearTimeout(id);
}

function readDraft(draftKey: string): AdmissionDraftPayload | null {
	if (typeof window === "undefined") return null;
	const rawDraft = window.localStorage.getItem(draftKey);
	if (!rawDraft) return null;

	try {
		const parsed = JSON.parse(rawDraft) as AdmissionDraftPayload;
		const savedAt = Number(parsed.savedAt || 0);
		if (parsed.version !== ADMISSION_DRAFT_VERSION || !savedAt) {
			return null;
		}
		if (Date.now() - savedAt > DRAFT_EXPIRY_MS) {
			window.localStorage.removeItem(draftKey);
			return null;
		}
		return parsed;
	} catch {
		window.localStorage.removeItem(draftKey);
		return null;
	}
}

export function useAdmissionFormDraft({
	form,
	draftKey,
	enabled,
	ready,
	step,
}: {
	form: UseFormReturn<any>;
	draftKey: string;
	enabled: boolean;
	ready: boolean;
	step: number;
}) {
	const [draft, setDraft] = useState<AdmissionDraftPayload | null>(null);
	const stepRef = useRef(step);
	const debounceRef = useRef<number | null>(null);
	const cancelIdleRef = useRef<(() => void) | undefined>(undefined);
	const didMountStepRef = useRef(false);
	const isBlockedByRestoreChoiceRef = useRef(false);
	const sessionActiveKey = `${draftKey}:session-active`;

	useEffect(() => {
		stepRef.current = step;
	}, [step]);

	const clearDraft = useCallback(() => {
		if (typeof window === "undefined") return;
		window.localStorage.removeItem(draftKey);
		window.sessionStorage.removeItem(sessionActiveKey);
		isBlockedByRestoreChoiceRef.current = false;
		setDraft(null);
	}, [draftKey, sessionActiveKey]);

	const dismissDraft = useCallback(() => {
		isBlockedByRestoreChoiceRef.current = false;
		setDraft(null);
	}, []);

	const writeDraft = useCallback((overrideValues?: Record<string, any>, overrideStep?: number) => {
		if (typeof window === "undefined") return;
		const values = stripFilesForDraft(overrideValues ?? form.getValues());
		const payload: AdmissionDraftPayload = {
			version: ADMISSION_DRAFT_VERSION,
			values,
			step: overrideStep ?? stepRef.current,
			savedAt: Date.now(),
		};

		cancelIdleRef.current?.();
		cancelIdleRef.current = scheduleIdle(() => {
			window.localStorage.setItem(draftKey, JSON.stringify(payload));
		});
	}, [draftKey, form]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!ready) return;
		if (!enabled) {
			clearDraft();
			return;
		}
		const existingDraft = readDraft(draftKey);
		const navigationEntry = window.performance?.getEntriesByType?.(
			"navigation"
		)?.[0] as PerformanceNavigationTiming | undefined;
		const isReload = navigationEntry?.type === "reload";
		const hasActiveSession = window.sessionStorage.getItem(sessionActiveKey) === "1";
		const shouldOfferRestore = Boolean(existingDraft && (!hasActiveSession || isReload));

		window.sessionStorage.setItem(sessionActiveKey, "1");
		isBlockedByRestoreChoiceRef.current = shouldOfferRestore;
		setDraft(shouldOfferRestore ? existingDraft : null);
	}, [clearDraft, draftKey, enabled, ready, sessionActiveKey]);

	useEffect(() => {
		if (!enabled || typeof window === "undefined") return;

		const subscription = form.watch((_value, info) => {
			if (!info.name) return;
			if (isBlockedByRestoreChoiceRef.current) return;
			if (debounceRef.current) window.clearTimeout(debounceRef.current);
			cancelIdleRef.current?.();

			debounceRef.current = window.setTimeout(() => {
				writeDraft();
			}, DRAFT_DEBOUNCE_MS);
		});

		return () => {
			subscription.unsubscribe();
			if (debounceRef.current) window.clearTimeout(debounceRef.current);
			cancelIdleRef.current?.();
		};
	}, [enabled, form, writeDraft]);

	useEffect(() => {
		if (!enabled || typeof window === "undefined") return;
		if (isBlockedByRestoreChoiceRef.current) return;
		if (!didMountStepRef.current) {
			didMountStepRef.current = true;
			return;
		}
		writeDraft();
	}, [enabled, step, writeDraft]);

	return {
		draft,
		clearDraft,
		hideDraftBanner: dismissDraft,
		saveDraftNow: writeDraft,
		restoreDraft: () => draft,
	};
}

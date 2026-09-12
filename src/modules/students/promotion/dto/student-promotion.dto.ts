export type PromotionAction = "promote" | "retain" | "leave";

export interface PromotionDecision {
	studentId: string;
	action: PromotionAction;
	toClassId?: string;
	toSectionId?: string;
	toRoll?: string;
	remarks?: string;
}

export interface ProcessPromotionPayload {
	fromSessionId: string;
	fromClassId: string;
	fromSectionId?: string;
	toSessionId: string;
	decisions: PromotionDecision[];
}

export interface PromotionSummary {
	promoted: number;
	retained: number;
	left: number;
}

/** Per-row working state the table edits before submit. */
export interface PromotionRowState {
	action: PromotionAction;
	toClassId: string;
	toSectionId: string;
	toRoll: string;
	remarks: string;
}

/**
 * A student can render before the container's effect has seeded its row
 * state (the fetch resolves, the table re-renders, and only then does the
 * effect run) -- callers should fall back to this rather than assume
 * `rows[studentId]` is already populated.
 */
export const emptyPromotionRow = (): PromotionRowState => ({
	action: "promote",
	toClassId: "",
	toSectionId: "",
	toRoll: "",
	remarks: "",
});

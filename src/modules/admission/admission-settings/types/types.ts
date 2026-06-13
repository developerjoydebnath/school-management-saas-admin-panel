export type FeeType = "One-time" | "Monthly" | "Yearly";

export interface FeeHead {
	id: string;
	name: string;
	type: FeeType;
	amount: number;
	isShown: boolean;
	isRequired: boolean;
	isSystem: boolean;
}

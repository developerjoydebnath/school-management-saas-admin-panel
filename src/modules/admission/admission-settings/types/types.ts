export type FeeType = "one_time" | "monthly" | "yearly";

export interface FeeHead {
	id: string;
	name: string;
	nameBn?: string | null;
	code?: string;
	type: FeeType;
	amount: number;
	isShown: boolean;
	isRequired: boolean;
	isSystem: boolean;
	sortOrder?: number;
	description?: string | null;
	classAmounts?: {
		id?: string;
		classId: string;
		amount: number;
		class?: {
			id: string;
			enName?: string;
			bnName?: string | null;
			name?: string;
		};
	}[];
}

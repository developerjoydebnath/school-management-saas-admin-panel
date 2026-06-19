export class VoucherModel {
	private _id: string;
	private _code: string;
	private _name: string;
	private _description: string;
	private _discountType: "percentage" | "fixed_amount";
	private _discountValue: number;
	private _maxDiscountBdt: number | null;
	private _maxRedemptions: number | null;
	private _currentRedemptions: number;
	private _onePerSchool: boolean;
	private _durationCycles: number | null;
	private _applicablePlanIds: string[];
	private _minimumBillBdt: number | null;
	private _validFrom: string;
	private _expiresAt: string | null;
	private _isActive: boolean;
	private _notes: string | null;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._code = data.code || "";
		this._name = data.name || "";
		this._description = data.description || "";
		this._discountType = data.discountType || "percentage";
		this._discountValue = Number(data.discountValue) || 0;
		this._maxDiscountBdt = data.maxDiscountBdt !== null && data.maxDiscountBdt !== undefined ? Number(data.maxDiscountBdt) : null;
		this._maxRedemptions = data.maxRedemptions || null;
		this._currentRedemptions = data.currentRedemptions || 0;
		this._onePerSchool = data.onePerSchool ?? true;
		this._durationCycles = data.durationCycles || null;
		this._applicablePlanIds = data.applicablePlanIds || [];
		this._minimumBillBdt = data.minimumBillBdt !== null && data.minimumBillBdt !== undefined ? Number(data.minimumBillBdt) : null;
		this._validFrom = data.validFrom || "";
		this._expiresAt = data.expiresAt || null;
		this._isActive = data.isActive ?? true;
		this._notes = data.notes || null;
	}

	get id(): string { return this._id; }
	get code(): string { return this._code; }
	get name(): string { return this._name; }
	get description(): string { return this._description; }
	get discountType(): "percentage" | "fixed_amount" { return this._discountType; }
	get discountValue(): number { return this._discountValue; }
	get maxDiscountBdt(): number | null { return this._maxDiscountBdt; }
	get maxRedemptions(): number | null { return this._maxRedemptions; }
	get currentRedemptions(): number { return this._currentRedemptions; }
	get onePerSchool(): boolean { return this._onePerSchool; }
	get durationCycles(): number | null { return this._durationCycles; }
	get applicablePlanIds(): string[] { return this._applicablePlanIds; }
	get minimumBillBdt(): number | null { return this._minimumBillBdt; }
	get validFrom(): string { return this._validFrom; }
	get expiresAt(): string | null { return this._expiresAt; }
	get isActive(): boolean { return this._isActive; }
	get notes(): string | null { return this._notes; }
}

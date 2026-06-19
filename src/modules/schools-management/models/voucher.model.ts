export class VoucherModel {
	private _id: string;
	private _code: string;
	private _discountType: string;
	private _discountValue: number;
	private _maxUses: number;
	private _usedCount: number;
	private _validFrom: string;
	private _validUntil: string;
	private _status: string;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._code = data.code || "";
		this._discountType = data.discountType || "";
		this._discountValue = data.discountValue || 0;
		this._maxUses = data.maxUses || 0;
		this._usedCount = data.usedCount || 0;
		this._validFrom = data.validFrom || "";
		this._validUntil = data.validUntil || "";
		this._status = data.status || "";
	}

	get id(): string {
		return this._id;
	}

	get code(): string {
		return this._code;
	}

	get discountType(): string {
		return this._discountType;
	}

	get discountValue(): number {
		return this._discountValue;
	}

	get maxUses(): number {
		return this._maxUses;
	}

	get usedCount(): number {
		return this._usedCount;
	}

	get validFrom(): string {
		return this._validFrom;
	}

	get validUntil(): string {
		return this._validUntil;
	}

	get status(): string {
		return this._status;
	}
}

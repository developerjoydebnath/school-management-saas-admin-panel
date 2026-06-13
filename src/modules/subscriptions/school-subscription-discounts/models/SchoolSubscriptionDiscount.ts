export class SchoolSubscriptionDiscount {
    private _id: string;
    private _subscriptionId: string;
    private _adjustmentType: string;
    private _voucherId: string | null;
    private _voucherCode: string | null;
    private _discountType: string;
    private _discountValue: number;
    private _discountAmountBdt: number;
    private _durationCycles: number | null;
    private _appliedCyclesCount: number;
    private _isActive: boolean;
    private _revokedAt: Date | null;
    private _revokedBy: string | null;
    private _revokeReason: string | null;
    private _appliedBy: string | null;
    private _reason: string | null;
    private _createdAt: Date;
    private _updatedAt: Date;

    private _original: any;

    constructor(data: any = {}) {
        this._id = data.id || "";
        this._subscriptionId = data.subscriptionId || "";
        this._adjustmentType = data.adjustmentType || "manual";
        this._voucherId = data.voucherId ?? null;
        this._voucherCode = data.voucherCode ?? null;
        this._discountType = data.discountType || "percentage";
        
        this._discountValue = typeof data.discountValue === 'string' ? parseFloat(data.discountValue) : (data.discountValue || 0);
        this._discountAmountBdt = typeof data.discountAmountBdt === 'string' ? parseFloat(data.discountAmountBdt) : (data.discountAmountBdt || 0);
        
        this._durationCycles = data.durationCycles ?? null;
        this._appliedCyclesCount = data.appliedCyclesCount || 0;
        this._isActive = data.isActive ?? true;
        
        this._revokedAt = data.revokedAt ? new Date(data.revokedAt) : null;
        this._revokedBy = data.revokedBy ?? null;
        this._revokeReason = data.revokeReason ?? null;
        
        this._appliedBy = data.appliedBy ?? null;
        this._reason = data.reason ?? null;

        this._createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this._updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();

        this._original = data.original || data;
    }

    get id(): string { return this._id; }
    get subscriptionId(): string { return this._subscriptionId; }
    get adjustmentType(): string { return this._adjustmentType; }
    get voucherId(): string | null { return this._voucherId; }
    get voucherCode(): string | null { return this._voucherCode; }
    get discountType(): string { return this._discountType; }
    get discountValue(): number { return this._discountValue; }
    get discountAmountBdt(): number { return this._discountAmountBdt; }
    get durationCycles(): number | null { return this._durationCycles; }
    get appliedCyclesCount(): number { return this._appliedCyclesCount; }
    get isActive(): boolean { return this._isActive; }
    get revokedAt(): Date | null { return this._revokedAt; }
    get revokedBy(): string | null { return this._revokedBy; }
    get revokeReason(): string | null { return this._revokeReason; }
    get appliedBy(): string | null { return this._appliedBy; }
    get reason(): string | null { return this._reason; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }
    get original(): any { return this._original; }
}

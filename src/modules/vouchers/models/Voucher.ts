export class Voucher {
    private _id: string;
    private _code: string;
    private _name: string;
    private _description: string | null;
    private _discountType: string;
    private _discountValue: number;
    private _maxDiscountBdt: number | null;
    private _maxRedemptions: number | null;
    private _currentRedemptions: number;
    private _onePerSchool: boolean;
    private _durationCycles: number | null;
    private _applicablePlanIds: string[];
    private _minimumBillBdt: number | null;
    private _validFrom: Date;
    private _expiresAt: Date | null;
    private _isActive: boolean;
    private _createdBy: string | null;
    private _notes: string | null;
    private _createdAt: Date;
    private _updatedAt: Date;
    
    private _original: any;

    constructor(data: any = {}) {
        this._id = data.id || "";
        this._code = data.code || "";
        this._name = data.name || "";
        this._description = data.description ?? null;
        this._discountType = data.discountType || "percentage";
        
        this._discountValue = typeof data.discountValue === 'string' ? parseFloat(data.discountValue) : (data.discountValue || 0);
        this._maxDiscountBdt = data.maxDiscountBdt != null ? (typeof data.maxDiscountBdt === 'string' ? parseFloat(data.maxDiscountBdt) : data.maxDiscountBdt) : null;
        
        this._maxRedemptions = data.maxRedemptions ?? null;
        this._currentRedemptions = data.currentRedemptions || 0;
        this._onePerSchool = data.onePerSchool ?? true;
        this._durationCycles = data.durationCycles ?? null;
        
        this._applicablePlanIds = Array.isArray(data.applicablePlanIds) ? data.applicablePlanIds : [];
        this._minimumBillBdt = data.minimumBillBdt != null ? (typeof data.minimumBillBdt === 'string' ? parseFloat(data.minimumBillBdt) : data.minimumBillBdt) : null;
        
        this._validFrom = data.validFrom ? new Date(data.validFrom) : new Date();
        this._expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
        this._isActive = data.isActive ?? true;
        this._createdBy = data.createdBy ?? null;
        this._notes = data.notes ?? null;
        
        this._createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this._updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        
        this._original = data.original || data;
    }

    get id(): string { return this._id; }
    get code(): string { return this._code; }
    get name(): string { return this._name; }
    get description(): string | null { return this._description; }
    get discountType(): string { return this._discountType; }
    get discountValue(): number { return this._discountValue; }
    get maxDiscountBdt(): number | null { return this._maxDiscountBdt; }
    get maxRedemptions(): number | null { return this._maxRedemptions; }
    get currentRedemptions(): number { return this._currentRedemptions; }
    get onePerSchool(): boolean { return this._onePerSchool; }
    get durationCycles(): number | null { return this._durationCycles; }
    get applicablePlanIds(): string[] { return this._applicablePlanIds; }
    get minimumBillBdt(): number | null { return this._minimumBillBdt; }
    get validFrom(): Date { return this._validFrom; }
    get expiresAt(): Date | null { return this._expiresAt; }
    get isActive(): boolean { return this._isActive; }
    get createdBy(): string | null { return this._createdBy; }
    get notes(): string | null { return this._notes; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }
    get original(): any { return this._original; }
}

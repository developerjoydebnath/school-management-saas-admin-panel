export class SchoolBankAccount {
    private _id: string;
    private _schoolId: string;
    private _accountLabel: string;
    private _accountPurpose: string;
    private _isPrimary: boolean;
    private _bankName: string;
    private _bankBranch: string | null;
    private _bankRoutingNo: string | null;
    private _accountNo: string;
    private _accountName: string;
    private _mobileBankingProvider: string | null;
    private _mobileBankingNo: string | null;
    private _isActive: boolean;
    private _createdAt: Date;
    private _updatedAt: Date;

    private _original: any;

    constructor(data: any = {}) {
        this._id = data.id || "";
        this._schoolId = data.schoolId || "";
        this._accountLabel = data.accountLabel || "";
        this._accountPurpose = data.accountPurpose || "";
        this._isPrimary = data.isPrimary ?? false;
        
        this._bankName = data.bankName || "";
        this._bankBranch = data.bankBranch ?? null;
        this._bankRoutingNo = data.bankRoutingNo ?? null;
        this._accountNo = data.accountNo || "";
        this._accountName = data.accountName || "";
        
        this._mobileBankingProvider = data.mobileBankingProvider ?? null;
        this._mobileBankingNo = data.mobileBankingNo ?? null;
        
        this._isActive = data.isActive ?? true;

        this._createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this._updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();

        this._original = data.original || data;
    }

    get id(): string { return this._id; }
    get schoolId(): string { return this._schoolId; }
    get accountLabel(): string { return this._accountLabel; }
    get accountPurpose(): string { return this._accountPurpose; }
    get isPrimary(): boolean { return this._isPrimary; }
    get bankName(): string { return this._bankName; }
    get bankBranch(): string | null { return this._bankBranch; }
    get bankRoutingNo(): string | null { return this._bankRoutingNo; }
    get accountNo(): string { return this._accountNo; }
    get accountName(): string { return this._accountName; }
    get mobileBankingProvider(): string | null { return this._mobileBankingProvider; }
    get mobileBankingNo(): string | null { return this._mobileBankingNo; }
    get isActive(): boolean { return this._isActive; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }
    get original(): any { return this._original; }
}

export class SchoolSubscription {
    private _id: string;
    private _schoolId: string;
    private _planId: string;
    private _startsAt: Date;
    private _expiresAt: Date | null;
    private _trialEndsAt: Date | null;
    private _status: string;
    private _gracePeriodDays: number;
    private _maxStudents: number | null;
    private _maxTeachers: number | null;
    private _maxStaff: number | null;
    private _maxClasses: number | null;
    private _maxSubjects: number | null;
    private _maxBranches: number | null;
    private _storageGb: number | null;
    private _freeStudentLimit: number;
    private _hasSmsNotifications: boolean;
    private _hasEmailNotifications: boolean;
    private _hasParentPortal: boolean;
    private _hasOnlineAdmission: boolean;
    private _hasOnlineFeePayment: boolean;
    private _hasResultPublishing: boolean;
    private _hasCustomDomain: boolean;
    private _hasApiAccess: boolean;
    private _hasAdvancedReports: boolean;
    private _hasPrioritySupport: boolean;
    private _hasDedicatedAccountManager: boolean;
    private _priceBdt: number;
    private _billingCycle: string;
    private _setupFeeBdt: number;
    private _discountPct: number;
    private _discountNote: string | null;
    private _activatedBy: string | null;
    private _cancelledAt: Date | null;
    private _cancelledBy: string | null;
    private _cancelReason: string | null;
    private _notes: string | null;
    private _metadata: any;
    private _createdAt: Date;
    private _updatedAt: Date;

    private _original: any;

    constructor(data: any = {}) {
        this._id = data.id || "";
        this._schoolId = data.schoolId || "";
        this._planId = data.planId || "";
        this._startsAt = data.startsAt ? new Date(data.startsAt) : new Date();
        this._expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
        this._trialEndsAt = data.trialEndsAt ? new Date(data.trialEndsAt) : null;
        this._status = data.status || "trial";
        this._gracePeriodDays = data.gracePeriodDays || 7;
        
        this._maxStudents = data.maxStudents ?? null;
        this._maxTeachers = data.maxTeachers ?? null;
        this._maxStaff = data.maxStaff ?? null;
        this._maxClasses = data.maxClasses ?? null;
        this._maxSubjects = data.maxSubjects ?? null;
        this._maxBranches = data.maxBranches ?? null;
        this._storageGb = data.storageGb ?? null;
        this._freeStudentLimit = data.freeStudentLimit || 0;

        this._hasSmsNotifications = data.hasSmsNotifications ?? false;
        this._hasEmailNotifications = data.hasEmailNotifications ?? true;
        this._hasParentPortal = data.hasParentPortal ?? false;
        this._hasOnlineAdmission = data.hasOnlineAdmission ?? false;
        this._hasOnlineFeePayment = data.hasOnlineFeePayment ?? false;
        this._hasResultPublishing = data.hasResultPublishing ?? false;
        this._hasCustomDomain = data.hasCustomDomain ?? false;
        this._hasApiAccess = data.hasApiAccess ?? false;
        this._hasAdvancedReports = data.hasAdvancedReports ?? false;
        this._hasPrioritySupport = data.hasPrioritySupport ?? false;
        this._hasDedicatedAccountManager = data.hasDedicatedAccountManager ?? false;

        this._priceBdt = typeof data.priceBdt === 'string' ? parseFloat(data.priceBdt) : (data.priceBdt || 0);
        this._billingCycle = data.billingCycle || "monthly";
        this._setupFeeBdt = typeof data.setupFeeBdt === 'string' ? parseFloat(data.setupFeeBdt) : (data.setupFeeBdt || 0);
        this._discountPct = typeof data.discountPct === 'string' ? parseFloat(data.discountPct) : (data.discountPct || 0);
        
        this._discountNote = data.discountNote ?? null;
        this._activatedBy = data.activatedBy ?? null;
        this._cancelledAt = data.cancelledAt ? new Date(data.cancelledAt) : null;
        this._cancelledBy = data.cancelledBy ?? null;
        this._cancelReason = data.cancelReason ?? null;
        this._notes = data.notes ?? null;
        this._metadata = data.metadata ?? null;

        this._createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this._updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();

        this._original = data.original || data;
    }

    get id(): string { return this._id; }
    get schoolId(): string { return this._schoolId; }
    get planId(): string { return this._planId; }
    get startsAt(): Date { return this._startsAt; }
    get expiresAt(): Date | null { return this._expiresAt; }
    get trialEndsAt(): Date | null { return this._trialEndsAt; }
    get status(): string { return this._status; }
    get gracePeriodDays(): number { return this._gracePeriodDays; }
    get maxStudents(): number | null { return this._maxStudents; }
    get maxTeachers(): number | null { return this._maxTeachers; }
    get maxStaff(): number | null { return this._maxStaff; }
    get maxClasses(): number | null { return this._maxClasses; }
    get maxSubjects(): number | null { return this._maxSubjects; }
    get maxBranches(): number | null { return this._maxBranches; }
    get storageGb(): number | null { return this._storageGb; }
    get freeStudentLimit(): number { return this._freeStudentLimit; }
    get hasSmsNotifications(): boolean { return this._hasSmsNotifications; }
    get hasEmailNotifications(): boolean { return this._hasEmailNotifications; }
    get hasParentPortal(): boolean { return this._hasParentPortal; }
    get hasOnlineAdmission(): boolean { return this._hasOnlineAdmission; }
    get hasOnlineFeePayment(): boolean { return this._hasOnlineFeePayment; }
    get hasResultPublishing(): boolean { return this._hasResultPublishing; }
    get hasCustomDomain(): boolean { return this._hasCustomDomain; }
    get hasApiAccess(): boolean { return this._hasApiAccess; }
    get hasAdvancedReports(): boolean { return this._hasAdvancedReports; }
    get hasPrioritySupport(): boolean { return this._hasPrioritySupport; }
    get hasDedicatedAccountManager(): boolean { return this._hasDedicatedAccountManager; }
    get priceBdt(): number { return this._priceBdt; }
    get billingCycle(): string { return this._billingCycle; }
    get setupFeeBdt(): number { return this._setupFeeBdt; }
    get discountPct(): number { return this._discountPct; }
    get discountNote(): string | null { return this._discountNote; }
    get activatedBy(): string | null { return this._activatedBy; }
    get cancelledAt(): Date | null { return this._cancelledAt; }
    get cancelledBy(): string | null { return this._cancelledBy; }
    get cancelReason(): string | null { return this._cancelReason; }
    get notes(): string | null { return this._notes; }
    get metadata(): any { return this._metadata; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }
    get original(): any { return this._original; }
}

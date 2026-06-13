export class SubscriptionPlan {
    private _id: string;
    private _slug: string;
    private _name: string;
    private _tagline: string | null;
    private _description: string | null;
    
    private _isPublic: boolean;
    private _isActive: boolean;
    private _sortOrder: number;
    
    private _priceBdt: number;
    private _billingCycle: string;
    private _setupFeeBdt: number;
    private _trialDays: number;
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
    
    private _metadata: any;
    private _notes: string | null;
    
    private _createdAt: Date;
    private _updatedAt: Date;
    
    private _original: any;

    constructor(data: any = {}) {
        this._id = data.id || "";
        this._slug = data.slug || "";
        this._name = data.name || "";
        this._tagline = data.tagline ?? null;
        this._description = data.description ?? null;
        
        this._isPublic = data.isPublic ?? true;
        this._isActive = data.isActive ?? true;
        this._sortOrder = typeof data.sortOrder === 'number' ? data.sortOrder : 0;
        
        this._priceBdt = typeof data.priceBdt === 'string' ? parseFloat(data.priceBdt) : (data.priceBdt || 0);
        this._billingCycle = data.billingCycle || "monthly";
        this._setupFeeBdt = typeof data.setupFeeBdt === 'string' ? parseFloat(data.setupFeeBdt) : (data.setupFeeBdt || 0);
        this._trialDays = data.trialDays || 0;
        this._gracePeriodDays = typeof data.gracePeriodDays === 'number' ? data.gracePeriodDays : 7;
        
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
        
        this._metadata = data.metadata ?? null;
        this._notes = data.notes ?? null;
        
        this._createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this._updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        
        this._original = data.original || data;
    }

    get id(): string { return this._id; }
    get slug(): string { return this._slug; }
    get name(): string { return this._name; }
    get tagline(): string | null { return this._tagline; }
    get description(): string | null { return this._description; }
    
    get isPublic(): boolean { return this._isPublic; }
    get isActive(): boolean { return this._isActive; }
    get sortOrder(): number { return this._sortOrder; }
    
    get priceBdt(): number { return this._priceBdt; }
    get billingCycle(): string { return this._billingCycle; }
    get setupFeeBdt(): number { return this._setupFeeBdt; }
    get trialDays(): number { return this._trialDays; }
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
    
    get metadata(): any { return this._metadata; }
    get notes(): string | null { return this._notes; }
    
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }
    
    get original(): any { return this._original; }
}

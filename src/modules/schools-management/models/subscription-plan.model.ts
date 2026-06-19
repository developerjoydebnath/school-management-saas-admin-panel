export class SubscriptionPlanModel {
	private _id: string;
	private _name: string;
	private _tagline: string;
	private _description: string;
	private _price: number;
	private _billingCycle: string;
	private _maxStudents: number;
	private _maxStaff: number;
	private _maxTeachers: number;
	private _maxClasses: number;
	private _trialDays: number;
	private _isPublic: boolean;
	private _status: string;
	private _sortOrder: number;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._name = data.name || "";
		this._tagline = data.tagline || "";
		this._description = data.description || "";
		this._price = data.priceBdt ?? data.price ?? 0;
		this._billingCycle = data.billingCycle || "";
		this._maxStudents = data.maxStudents ?? 0;
		this._maxStaff = data.maxStaff ?? 0;
		this._maxTeachers = data.maxTeachers ?? 0;
		this._maxClasses = data.maxClasses ?? 0;
		this._trialDays = data.trialDays ?? 0;
		this._isPublic = data.isPublic ?? false;
		this._status = data.isActive ? "active" : "inactive";
		this._sortOrder = data.sortOrder ?? 0;
		this._original = data.original || data;
	}

	get id(): string { return this._id; }
	get name(): string { return this._name; }
	get tagline(): string { return this._tagline; }
	get description(): string { return this._description; }
	get price(): number { return this._price; }
	get billingCycle(): string { return this._billingCycle; }
	get maxStudents(): number { return this._maxStudents; }
	get maxStaff(): number { return this._maxStaff; }
	get maxTeachers(): number { return this._maxTeachers; }
	get maxClasses(): number { return this._maxClasses; }
	get trialDays(): number { return this._trialDays; }
	get isPublic(): boolean { return this._isPublic; }
	get status(): string { return this._status; }
	get sortOrder(): number { return this._sortOrder; }
	get original(): any { return this._original; }
}

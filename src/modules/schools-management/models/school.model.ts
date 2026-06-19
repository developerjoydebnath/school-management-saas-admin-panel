export class SchoolModel {
	private _id: string;
	private _schoolName: string;
	private _schoolSlug: string;
	private _schoolType: string;
	private _status: string;
	private _createdAt: string;
	private _address: string;
	private _contactEmail: string;
	private _contactPhone: string;
	private _contactPersonName: string;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._schoolName = data.schoolName || "";
		this._schoolSlug = data.schoolSlug || "";
		this._schoolType = data.schoolType || "";
		this._status = data.status || "";
		this._createdAt = data.createdAt || "";
		this._address = data.address || "";
		this._contactEmail = data.contactEmail || "";
		this._contactPhone = data.contactPhone || "";
		this._contactPersonName = data.contactPersonName || "";
		this._original = data.original || data;
	}

	get id(): string {
		return this._id;
	}

	get schoolName(): string {
		return this._schoolName;
	}

	get schoolSlug(): string {
		return this._schoolSlug;
	}

	get schoolType(): string {
		return this._schoolType;
	}

	get status(): string {
		return this._status;
	}

	get createdAt(): string {
		return this._createdAt;
	}

	get address(): string {
		return this._address;
	}

	get contactEmail(): string {
		return this._contactEmail;
	}

	get contactPhone(): string {
		return this._contactPhone;
	}

	get contactPersonName(): string {
		return this._contactPersonName;
	}

	get original(): any {
		return this._original;
	}
}

import { StatusEnum } from "../types/enums";

export class Teacher {
	private _id: string;
	private _name: string | { en: string; bn: string };
	private _subjects: string[];
	private _mobileNumber: string;
	private _email: string;
	private _address: string;
	private _status: StatusEnum;
	private _createdAt: Date;
	private _updatedAt: Date;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._name = data.name || "";
		this._subjects = data.subjects || data.sections || [];
		this._mobileNumber = data.mobile || data.contact || "";
		this._email = data.email || "";
		this._address = data.address || "";
		this._status = (data.status?.toUpperCase() as StatusEnum) || StatusEnum.ACTIVE;
		this._createdAt = data.createdAt || new Date();
		this._updatedAt = data.updatedAt || new Date();
		this._original = data.original || data;
	}

	get id(): string {
		return this._id;
	}

	get name(): any {
		return this._name;
	}

	get subjects(): string[] {
		return this._subjects;
	}

	get mobileNumber(): string {
		return this._mobileNumber;
	}

	get email(): string {
		return this._email;
	}

	get address(): string {
		return this._address;
	}

	get status(): StatusEnum {
		return this._status;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	get original(): any {
		return this._original;
	}
}

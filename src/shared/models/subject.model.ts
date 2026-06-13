import { StatusEnum, SubjectTypeEnum } from "../types/enums";

export class Subject {
	private _id: string;
	private _name: string | { en: string; bn: string };
	private _code: string;
	private _type: SubjectTypeEnum;
	private _status: StatusEnum;
	private _classes: string[];
	private _createdAt: Date;
	private _updatedAt: Date;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._name = data.name || "";
		this._code = data.code || "";
		this._type = data.type || "";
		this._status = data.status || "";
		this._classes = data.classes || [];
		this._createdAt = data.createdAt || "";
		this._updatedAt = data.updatedAt || "";
		this._original = data.original || "";
	}

	get id(): string {
		return this._id;
	}

	get name(): any {
		return this._name;
	}

	get code(): string {
		return this._code;
	}

	get type(): SubjectTypeEnum {
		return this._type;
	}

	get status(): StatusEnum {
		return this._status;
	}

	get classes(): string[] {
		return this._classes;
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

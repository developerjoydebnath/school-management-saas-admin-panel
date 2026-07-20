import { StatusEnum } from "../types/enums";

export interface Section {
	id?: string;
	name: string;
	classRoomId?: string;
	shiftId?: string;
}

export class ClassModel {
	private _id: string;
	private _name: string | { en: string; bn: string };
	private _sections: Section[];
	private _status: StatusEnum;
	private _createdAt: Date;
	private _updatedAt: Date;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._name =
			data.name ||
			{
				en: data.enName || "",
				bn: data.bnName || "",
			};
		this._sections = data.sections || [];
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

	get sections(): Section[] {
		return this._sections;
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

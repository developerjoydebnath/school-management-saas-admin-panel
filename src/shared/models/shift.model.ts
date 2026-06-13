import { StatusEnum } from "../types/enums";

export class ShiftModel {
	private _id: string;
	private _name: string;
	private _startTime: string;
	private _endTime: string;
	private _status: StatusEnum;
	private _createdAt: Date;
	private _updatedAt: Date;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._name = data.name || "";
		this._startTime = data.startTime || data.start_time || "";
		this._endTime = data.endTime || data.end_time || "";
		this._status = (data.status?.toUpperCase() as StatusEnum) || StatusEnum.ACTIVE;
		this._createdAt = data.createdAt || new Date();
		this._updatedAt = data.updatedAt || new Date();
		this._original = data.original || data;
	}

	get id(): string {
		return this._id;
	}

	get name(): string {
		return this._name;
	}

	get startTime(): string {
		return this._startTime;
	}

	get endTime(): string {
		return this._endTime;
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

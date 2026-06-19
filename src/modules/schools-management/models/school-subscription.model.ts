import { SchoolModel } from "./school.model";
import { SubscriptionPlanModel } from "./subscription-plan.model";

export class SchoolSubscriptionModel {
	private _id: string;
	private _schoolId: string;
	private _planId: string;
	private _startDate: string;
	private _endDate: string;
	private _status: string;
	private _price: number;
	private _school: SchoolModel | null;
	private _plan: SubscriptionPlanModel | null;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._schoolId = data.schoolId || "";
		this._planId = data.planId || "";
		this._startDate = data.startDate || "";
		this._endDate = data.endDate || "";
		this._status = data.status || "";
		this._price = data.price || 0;
		this._school = data.school ? new SchoolModel(data.school) : null;
		this._plan = data.plan ? new SubscriptionPlanModel(data.plan) : null;
	}

	get id(): string {
		return this._id;
	}

	get schoolId(): string {
		return this._schoolId;
	}

	get planId(): string {
		return this._planId;
	}

	get startDate(): string {
		return this._startDate;
	}

	get endDate(): string {
		return this._endDate;
	}

	get status(): string {
		return this._status;
	}

	get price(): number {
		return this._price;
	}

	get school(): SchoolModel | null {
		return this._school;
	}

	get plan(): SubscriptionPlanModel | null {
		return this._plan;
	}
}

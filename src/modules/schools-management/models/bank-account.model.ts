import { SchoolModel } from "@/shared/models/school.model";

export class BankAccountModel {
	private _id: string;
	private _schoolId: string;
	private _accountLabel: string;
	private _accountPurpose: string;
	private _isPrimary: boolean;
	private _bankName: string;
	private _bankBranch: string;
	private _bankRoutingNo: string;
	private _accountNo: string;
	private _accountName: string;
	private _mobileBankingProvider: string;
	private _mobileBankingNo: string;
	private _isActive: boolean;
	private _createdAt: string;
	private _updatedAt: string;
	private _school: SchoolModel | null;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._schoolId = data.schoolId || "";
		this._accountLabel = data.accountLabel || "";
		this._accountPurpose = data.accountPurpose || "";
		this._isPrimary = data.isPrimary ?? false;
		this._bankName = data.bankName || "";
		this._bankBranch = data.bankBranch || "";
		this._bankRoutingNo = data.bankRoutingNo || "";
		this._accountNo = data.accountNo || "";
		this._accountName = data.accountName || "";
		this._mobileBankingProvider = data.mobileBankingProvider || "";
		this._mobileBankingNo = data.mobileBankingNo || "";
		this._isActive = data.isActive ?? true;
		this._createdAt = data.createdAt || "";
		this._updatedAt = data.updatedAt || "";
		this._school = data.school ? new SchoolModel(data.school) : null;
		this._original = data.original || data;
	}

	get id(): string {
		return this._id;
	}

	get schoolId(): string {
		return this._schoolId;
	}

	get accountLabel(): string {
		return this._accountLabel;
	}

	get accountPurpose(): string {
		return this._accountPurpose;
	}

	get isPrimary(): boolean {
		return this._isPrimary;
	}

	get bankName(): string {
		return this._bankName;
	}

	get bankBranch(): string {
		return this._bankBranch;
	}

	get bankRoutingNo(): string {
		return this._bankRoutingNo;
	}

	get accountNo(): string {
		return this._accountNo;
	}

	get accountName(): string {
		return this._accountName;
	}

	get mobileBankingProvider(): string {
		return this._mobileBankingProvider;
	}

	get mobileBankingNo(): string {
		return this._mobileBankingNo;
	}

	get isActive(): boolean {
		return this._isActive;
	}

	get createdAt(): string {
		return this._createdAt;
	}

	get updatedAt(): string {
		return this._updatedAt;
	}

	get school(): SchoolModel | null {
		return this._school;
	}

	get original(): any {
		return this._original;
	}
}

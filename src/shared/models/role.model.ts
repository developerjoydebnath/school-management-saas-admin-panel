import { StatusEnum } from "../types/enums";

export class RoleModel {
	private _id: string;
	private _name: string;
	private _description: string | null;
	private _permissions: string[];
	private _isSystem: boolean;
	private _status: StatusEnum;
	private _createdAt: string;
	private _updatedAt: string;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._name = data.name || "";
		this._description = data.description || null;
		this._permissions = data.permissions || [];
		this._isSystem = Boolean(data.isSystem);
		this._status = (data.status?.toUpperCase() as StatusEnum) || StatusEnum.ACTIVE;
		this._createdAt = data.createdAt || new Date().toISOString();
		this._updatedAt = data.updatedAt || new Date().toISOString();
		this._original = data.original || data;
	}

	get id(): string {
		return this._id;
	}

	get name(): string {
		return this._name;
	}

	get description(): string | null {
		return this._description;
	}

	get permissions(): string[] {
		return this._permissions;
	}

	get isSystem(): boolean {
		return this._isSystem;
	}

	get status(): StatusEnum {
		return this._status;
	}

	get createdAt(): string {
		return this._createdAt;
	}

	get updatedAt(): string {
		return this._updatedAt;
	}

	get original(): any {
		return this._original;
	}

	get hasFullAccess(): boolean {
		return this._isSystem || this._permissions.includes("roles.all");
	}
}

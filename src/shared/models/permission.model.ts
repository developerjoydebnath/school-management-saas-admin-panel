export class PermissionModel {
	private _id: number;
	private _permissionName: string;
	private _groupName: string;
	private _permissionKey: string;
	private _moduleName: string[];
	private _createdAt: string;
	private _updatedAt: string;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || 0;
		this._permissionName = data.permissionName || "";
		this._groupName = data.groupName || "";
		this._permissionKey = data.permissionKey || "";
		this._moduleName = data.moduleName || [];
		this._createdAt = data.createdAt || new Date().toISOString();
		this._updatedAt = data.updatedAt || new Date().toISOString();
		this._original = data.original || data;
	}

	get id(): number {
		return this._id;
	}

	get permissionName(): string {
		return this._permissionName;
	}

	get groupName(): string {
		return this._groupName;
	}

	get permissionKey(): string {
		return this._permissionKey;
	}

	get moduleName(): string[] {
		return this._moduleName;
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
}

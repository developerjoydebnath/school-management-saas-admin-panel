import { BaseRoleEnum } from "../types/enums";

export class User {
	id: string;
	name: string;
	email: string;
	base_role: BaseRoleEnum;
	permissions: string[];
	status?: string;

	constructor(data: any) {
		this.id = data.id || "";
		this.name = data.name || "";
		this.email = data.email || "";
		this.base_role = data.base_role || BaseRoleEnum.TEACHER;
		this.permissions = data.permissions || [];
		this.status = data.status || "Active"; // Defaulting to active if missing
	}
}

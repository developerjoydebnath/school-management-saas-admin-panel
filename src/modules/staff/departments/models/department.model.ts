export type DepartmentModel = {
	id: string;
	name: string;
	nameBn?: string;
	headTeacherId?: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	headTeacher?: {
		id: string;
		fullName: string;
		employeeCode: string;
	};
};

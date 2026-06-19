import { z } from "zod";

export const permissionSchema = z.object({
	permissionName: z.string().min(1, "Permission name is required"),
	groupName: z.string().min(1, "Group name is required"),
	permissionKey: z.string().min(1, "Permission key is required"),
	moduleName: z.array(z.string()).min(1, "At least one module must be selected"),
});

export type PermissionFormValues = z.infer<typeof permissionSchema>;

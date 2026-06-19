import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

export const roleSchema = z.object({
	name: z.string().min(1, "Role name is required"),
	description: z.string().optional().nullable(),
	permissions: z.array(z.string()).default([]),
	status: z.nativeEnum(StatusEnum).default(StatusEnum.ACTIVE),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

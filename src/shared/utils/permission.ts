import { AuthUserStateType } from "@/shared/stores/authStore";
import { ROLES } from "../configs/roles.config";

/**
 * Utility function to check if a user has the required permissions.
 * Super Admins bypass permission checks.
 */
export const hasAccess = (
	user: AuthUserStateType | null,
	requiredPermissions: string[],
	requireAll: boolean = false
): boolean => {
	if (!user) return false;

	// Developer bypass
	if (user.base_role === ROLES.DEVELOPER) {
		return true;
	}

	// Super Admin bypass
	if (user.base_role === ROLES.SUPER_ADMIN) {
		return true;
	}

	// If no permissions are required, grant access
	if (!requiredPermissions || requiredPermissions.length === 0) {
		return true;
	}

	// If user has no permissions but some are required, deny access
	if (!user.permissions || user.permissions.length === 0) {
		return false;
	}

	// Check if user has all or some of the required permissions
	if (requireAll) {
		return requiredPermissions.every((perm) => user.permissions!.includes(perm));
	}

	return requiredPermissions.some((perm) => user.permissions!.includes(perm));
};

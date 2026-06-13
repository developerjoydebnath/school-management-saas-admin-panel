"use client";

import { useAuthStore } from '@/shared/stores/authStore';
import { hasAccess } from '@/shared/utils/permission';
import React from 'react';

interface PermissionGuardProps {
  /** Array of required permissions to check */
  permissions: string[];
  /** If true, the user must have ALL the required permissions. Default is false (ANY) */
  requireAll?: boolean;
  /** Content to render if access is granted */
  children: React.ReactNode;
  /** Content to render if access is denied */
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that conditionally renders its children based on the user's permissions.
 */
export default function PermissionGuard({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { user, isAuthenticated } = useAuthStore((state) => state.auth);

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  const isAllowed = hasAccess(user, permissions, requireAll);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

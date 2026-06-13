"use client";

import React, { useEffect } from 'react';
import PageHeading from '@/shared/components/custom/PageHeading';
import NewAdmissionForm from '@/modules/admission/new-admission/components/NewAdmissionForm';
import { useBreadcrumbStore } from '@/shared/stores/breadcrumb-store';
import { PATHS } from '@/shared/configs/paths.config';
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl";

export default function NewAdmissionPage() {
  const { setBreadcrumbs } = useBreadcrumbStore();
  const router = useRouter();
  const tNav = useTranslations("Navigation");

  useEffect(() => {
    setBreadcrumbs([
      { label: tNav("dashboard"), href: PATHS.DASHBOARD },
      { label: tNav("admission"), href: PATHS.ADMISSION.ROOT },
      { label: tNav("admission_new"), href: PATHS.ADMISSION.NEW.ROOT },
    ]);
  }, [setBreadcrumbs, tNav]);

  const handleSuccess = () => {
    // Optionally redirect to application list on success
    router.push(PATHS.ADMISSION.LIST.ROOT);
  };

  return (
    <div className="space-y-6">
      <PageHeading 
        routeName="AdmissionNew" 
      />
      
      <div className="max-w-4xl mx-auto">
        <NewAdmissionForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

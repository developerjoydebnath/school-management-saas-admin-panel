"use client";

import React, { useEffect } from 'react';
import PageHeading from '@/shared/components/custom/PageHeading';
import NewAdmissionForm from '@/modules/admission/new-admission/components/NewAdmissionForm';
import { useBreadcrumbStore } from '@/shared/stores/breadcrumb-store';
import { PATHS } from '@/shared/configs/paths.config';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from "next-intl";
import { useSWR } from '@/shared/hooks/use-swr';
import { Spinner } from '@/shared/components/ui/spinner';

export default function EditAdmissionPage() {
  const { setBreadcrumbs } = useBreadcrumbStore();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const tNav = useTranslations("Navigation");

  const { data: application, isLoading } = useSWR(`/admissions/${id}`);

  useEffect(() => {
    if (id) {
      setBreadcrumbs([
        { label: tNav("dashboard"), href: PATHS.DASHBOARD },
        { label: tNav("admission"), href: PATHS.ADMISSION.ROOT },
        { label: tNav("admission_list"), href: PATHS.ADMISSION.LIST.ROOT },
        { label: "Edit Application", href: PATHS.ADMISSION.LIST.EDIT(id) },
      ]);
    }
  }, [setBreadcrumbs, tNav, id]);

  const handleSuccess = () => {
    router.push(PATHS.ADMISSION.LIST.ROOT);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading 
        routeName="ApplicationEdit" 
      />
      
      <div className="max-w-4xl mx-auto">
        <NewAdmissionForm 
          id={id}
          initialData={application}
          onSuccess={handleSuccess} 
        />
      </div>
    </div>
  );
}

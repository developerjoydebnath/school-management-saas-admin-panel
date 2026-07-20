import PublicAdmissionForm from "@/modules/admission/public-form/components/PublicAdmissionForm";

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdmissionFormPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const tenantValue = params.tenant || params.school;
	const slugValue = params.slug || tenantValue;
	const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue;
	const tenant = Array.isArray(tenantValue) ? tenantValue[0] : tenantValue;

	return <PublicAdmissionForm slug={slug || ""} tenant={tenant || ""} />;
}

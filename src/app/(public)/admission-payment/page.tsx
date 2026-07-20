import PublicAdmissionPayment from "@/modules/admission/public-payment/components/PublicAdmissionPayment";

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdmissionPaymentPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const tenantValue = params.tenant || params.school;
	const slugValue = params.slug || tenantValue;
	const applicationValue = params.applicationId || params.application;
	const statusValue = params.status;
	const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue;
	const tenant = Array.isArray(tenantValue) ? tenantValue[0] : tenantValue;
	const applicationId = Array.isArray(applicationValue)
		? applicationValue[0]
		: applicationValue;
	const status = Array.isArray(statusValue) ? statusValue[0] : statusValue;

	return (
		<PublicAdmissionPayment
			slug={slug || ""}
			tenant={tenant || ""}
			applicationId={applicationId || ""}
			resultStatus={status || ""}
		/>
	);
}

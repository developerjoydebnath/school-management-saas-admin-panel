import ParentDetails from "@/modules/parents/directory/components/ParentDetails";

export default async function ParentDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <ParentDetails parentId={id} />;
}

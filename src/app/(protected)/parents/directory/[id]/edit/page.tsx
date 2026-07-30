import ParentEditPage from "@/modules/parents/directory/components/ParentEditPage";

export default async function EditParentPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <ParentEditPage parentId={id} />;
}

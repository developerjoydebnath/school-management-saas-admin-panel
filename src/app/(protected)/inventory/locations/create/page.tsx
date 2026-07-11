import { getTranslations } from "next-intl/server";
import { LocationFormPage } from "@/modules/inventory/locations/components/LocationFormPage";

export async function generateMetadata() {
	const t = await getTranslations("Inventory");
	return { title: t("createTitle") };
}

export default function InventoryLocationCreatePage() {
	return <LocationFormPage />;
}

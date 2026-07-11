import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTranslations } from "next-intl";
import AdmissionSettingsForm from "./AdmissionSettingsForm";
import DiscountSettings from "./DiscountSettings";
import FeeStructureSettings from "./FeeStructureSettings";

export default function AdmissionSettingsTabs() {
	const t = useTranslations("AdmissionSettings");
	return (
		<div>
			<Tabs defaultValue="field-configuration" className="w-full">
				<TabsList className="h-12! gap-2 border">
					<TabsTrigger value="field-configuration" className="h-10 cursor-pointer px-4">
						{t("title")}
					</TabsTrigger>
					<TabsTrigger value="fee-structure" className="h-10 cursor-pointer px-4">
						{t("feeStructure")}
					</TabsTrigger>
					<TabsTrigger value="discounts" className="h-10 cursor-pointer px-4">
						Discounts
					</TabsTrigger>
				</TabsList>
				<TabsContent value="field-configuration">
					<AdmissionSettingsForm />
				</TabsContent>
				<TabsContent value="fee-structure">
					<FeeStructureSettings />
				</TabsContent>
				<TabsContent value="discounts">
					<DiscountSettings />
				</TabsContent>
			</Tabs>
		</div>
	);
}

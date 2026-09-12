import axios from "@/shared/lib/axios";
import { ProcessPromotionPayload, PromotionSummary } from "../dto/student-promotion.dto";

export const getNextRoll = async (params: {
	sessionId: string;
	classId: string;
	sectionId?: string;
}): Promise<string> => {
	const response = await axios.get("/students/promotion/next-roll", { params });
	return response.data?.data?.nextRoll ?? "001";
};

export const processPromotion = async (
	payload: ProcessPromotionPayload
): Promise<PromotionSummary> => {
	const response = await axios.post("/students/promotion/process", payload);
	return response.data?.data;
};

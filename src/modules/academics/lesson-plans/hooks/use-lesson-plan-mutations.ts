import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { LessonPlanFormValues, LessonPlanStatusEnum } from "../dto/lesson-plan.dto";

export const refreshLessonPlanCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/lesson-plans"));

const normalize = (data: LessonPlanFormValues) => {
	const { homeworkTypes, homeworkItems, ...rest } = data;
	return {
		...rest,
		sectionId: data.sectionId || undefined,
		teacherId: data.teacherId || undefined,
		learningOutcomes: data.learningOutcomes?.trim() || undefined,
		priorKnowledge: data.priorKnowledge?.trim() || undefined,
		teachingAids: data.teachingAids?.trim() || undefined,
		introduction: data.introduction?.trim() || undefined,
		mainActivity: data.mainActivity?.trim() || undefined,
		evaluation: data.evaluation?.trim() || undefined,
		homeworkNote: data.homeworkNote?.trim() || undefined,
		teacherReflection: data.teacherReflection?.trim() || undefined,
		// One item per selected type, created as Draft alongside the lesson —
		// only meaningful on create; the backend ignores it on update.
		homeworks: homeworkTypes.length
			? homeworkTypes.map((type) => {
					const item = homeworkItems[type]!;
					return {
						type,
						title: item.title?.trim(),
						titleBn: item.titleBn?.trim() || undefined,
						instructions: item.instructions?.trim() || undefined,
						dueDate: item.dueDate,
						totalMarks: item.totalMarks ?? undefined,
						attachments: item.attachments || [],
					};
				})
			: undefined,
	};
};

export const createLessonPlan = async (data: LessonPlanFormValues) => {
	const response = await axios.post("/lesson-plans", normalize(data));
	await refreshLessonPlanCaches();
	return response.data;
};

export const updateLessonPlan = async (id: string, data: LessonPlanFormValues) => {
	const response = await axios.put(`/lesson-plans/${id}`, normalize(data));
	await refreshLessonPlanCaches();
	return response.data;
};

export const updateLessonPlanStatus = async (id: string, status: LessonPlanStatusEnum) => {
	const response = await axios.patch(`/lesson-plans/${id}/status`, { status });
	await refreshLessonPlanCaches();
	return response.data;
};

export const deleteLessonPlan = async (id: string) => {
	const response = await axios.delete(`/lesson-plans/${id}`);
	await refreshLessonPlanCaches();
	return response.data;
};

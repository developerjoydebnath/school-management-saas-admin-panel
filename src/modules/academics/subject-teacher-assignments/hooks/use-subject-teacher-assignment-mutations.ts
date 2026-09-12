import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { SubjectTeacherSetupPayload } from "../dto/subject-teacher-assignment.dto";

export async function saveSubjectTeacherSetup(payload: SubjectTeacherSetupPayload) {
	const response = await axios.put("/subject-teacher-assignments/setup", payload);
	await mutate(
		(key: unknown) => typeof key === "string" && key.startsWith("/subject-teacher-assignments")
	);
	return response.data;
}

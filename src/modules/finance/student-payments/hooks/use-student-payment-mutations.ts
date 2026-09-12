import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import {
	CreateStudentPaymentPayload,
	UpdateStudentPaymentPayload,
} from "../dto/student-payment.dto";

export const refreshStudentPaymentCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/student-payments"));

export const createStudentPayment = async (data: CreateStudentPaymentPayload) => {
	const response = await axios.post("/student-payments", data);
	await refreshStudentPaymentCaches();
	return response.data;
};

export const updateStudentPayment = async (
	id: string,
	data: UpdateStudentPaymentPayload
) => {
	const response = await axios.patch("/student-payments/" + id, data);
	await refreshStudentPaymentCaches();
	return response.data;
};

export const deleteStudentPayment = async (id: string) => {
	const response = await axios.delete("/student-payments/" + id);
	await refreshStudentPaymentCaches();
	return response.data;
};

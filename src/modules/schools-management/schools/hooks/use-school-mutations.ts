import axios from "@/shared/lib/axios";
import { CreateSchoolDto, UpdateSchoolDto } from "@/shared/models/school.dto";

export const createSchool = async (data: CreateSchoolDto) => {
	const response = await axios.post("/superadmin/schools", data);
	return response.data;
};

export const updateSchool = async (id: string, data: Partial<UpdateSchoolDto>) => {
	const response = await axios.patch(`/superadmin/schools/${id}`, data);
	return response.data;
};

export const deleteSchool = async (id: string) => {
	const response = await axios.delete(`/superadmin/schools/${id}`);
	return response.data;
};

export const updateSchoolStatus = async (id: string, isActive: boolean) => {
	const response = await axios.patch(`/superadmin/schools/${id}/is-active`, { isActive });
	return response.data;
};

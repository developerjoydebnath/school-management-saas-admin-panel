import axiosInstance from "@/shared/lib/axios";

export interface UploadResponse {
	url: string;
	placeholder: string;
	mediaId: string;
	deduplicated: boolean;
}

export async function uploadImage(
	file: File,
	module: string,
	entityType?: string,
	entityId?: string
): Promise<UploadResponse> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("module", module);
	if (entityType) formData.append("entityType", entityType);
	if (entityId) formData.append("entityId", entityId);

	const response = await axiosInstance.post("/uploads/image", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});

	return response?.data?.success
		? (response.data.data as UploadResponse)
		: { url: "", placeholder: "", mediaId: "", deduplicated: false };
}

export async function uploadDocument(
	file: File,
	module: string,
	entityType?: string,
	entityId?: string
): Promise<UploadResponse> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("module", module);
	if (entityType) formData.append("entityType", entityType);
	if (entityId) formData.append("entityId", entityId);

	const response = await axiosInstance.post("/uploads/document", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});

	return response?.data?.success
		? (response.data.data as UploadResponse)
		: { url: "", placeholder: "", mediaId: "", deduplicated: false };
}

export async function deleteImage(mediaId: string): Promise<void> {
	await axiosInstance.delete(`/uploads/image/${mediaId}`);
}

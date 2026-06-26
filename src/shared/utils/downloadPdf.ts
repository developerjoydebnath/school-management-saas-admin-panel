import axios from "@/shared/lib/axios";

/**
 * Fetches a PDF from the given backend URL and triggers a file download in the browser.
 *
 * @param url The API endpoint URL to fetch the PDF from (e.g., `/superadmin/payments/123/invoice`)
 * @param filename The desired filename for the downloaded file (e.g., `invoice-123.pdf`)
 */
export async function downloadPdf(url: string, filename: string): Promise<void> {
	try {
		const response = await axios.get(url, {
			responseType: "blob",
		});
		
		const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement("a");
		link.href = blobUrl;
		link.setAttribute("download", filename);
		
		document.body.appendChild(link);
		link.click();
		link.remove();
		
		// Clean up the object URL
		window.URL.revokeObjectURL(blobUrl);
	} catch (error) {
		console.error(`Failed to download PDF from ${url}`, error);
		throw error; // Re-throw so the caller can show a toast/notification if they want
	}
}

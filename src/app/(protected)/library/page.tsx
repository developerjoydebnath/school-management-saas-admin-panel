import { PATHS } from "@/shared/configs/paths.config";
import { redirect } from "next/navigation";

/**
 * The Library group's landing route.
 *
 * There is no hub page: each of the four areas carries its own stat strip, so a
 * separate dashboard would only repeat them. The nav parent still needs a
 * destination, and the catalog is where a librarian starts.
 */
export default function LibraryPage() {
	redirect(PATHS.LIBRARY.CATALOG.ROOT);
}

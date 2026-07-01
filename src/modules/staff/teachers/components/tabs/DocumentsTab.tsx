import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FileText } from "lucide-react";

type Props = {
	teacher: any;
	getDocumentUrl: (url: string) => string;
	onViewDocument: (url: string, name: string) => void;
};

export function DocumentsTab({ teacher, getDocumentUrl, onViewDocument }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<FileText className="text-muted-foreground h-5 w-5" /> Additional Notes & Documents
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div>
					<div className="text-muted-foreground text-sm mb-2">Notes</div>
					<div className="rounded-md border bg-muted/50 p-4 font-medium min-h-[100px]">
						{teacher.notes || "No additional notes provided."}
					</div>
				</div>

				<div>
					<div className="text-muted-foreground text-sm mb-4">Uploaded Documents</div>
					{!teacher.documents || (Array.isArray(teacher.documents) && teacher.documents.length === 0) ? (
						<div className="rounded-lg border border-dashed py-8 text-center text-muted-foreground text-sm">
							No documents attached.
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{Array.isArray(teacher.documents) &&
								teacher.documents.map((doc: any, index: number) => (
									<div key={index} className="flex items-center justify-between rounded-lg border bg-card p-4">
										<div className="flex flex-col overflow-hidden">
											<span className="font-medium text-sm truncate uppercase tracking-wider text-muted-foreground mb-1">
												{doc.type || "Document"}
											</span>
											<span className="font-medium text-sm truncate">{doc.originalName || "Uploaded File"}</span>
										</div>
										{doc.url && (
											<Button
												size="sm"
												variant="outline"
												onClick={() => {
													onViewDocument(getDocumentUrl(doc.url), doc.originalName || "Document");
												}}
											>
												View
											</Button>
										)}
									</div>
								))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
	createLibraryCategory,
	deleteLibraryCategory,
	updateLibraryCategory,
	useLibraryCategories,
} from "../../shared/hooks/use-library";

const CATALOG = PERMISSIONS.LIBRARY.CATALOG;

type Draft = { name: string; nameBn: string; ddcRange: string };

const EMPTY: Draft = { name: "", nameBn: "", ddcRange: "" };

/**
 * The shelf sections, managed where the rest of the library's configuration
 * lives rather than behind a sixth nav item.
 *
 * A school gets the standard Bangladeshi sections seeded on first read, so this
 * is about the edits that follow: renaming one to Bangla, adding the section
 * this particular school happens to keep, retiring one it does not.
 *
 * Editing is inline because these rows are three short fields — sending a
 * librarian to a separate route to rename "Reference" would be heavier than the
 * change itself.
 */
export default function LibraryCategoryManager() {
	const t = useTranslations("LibraryCatalog");
	const ts = useTranslations("LibrarySettings");
	const tc = useTranslations("Common");
	const ft = useTranslations("Forms");

	const { categories, isLoading } = useLibraryCategories({ limit: 200 });
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draft, setDraft] = useState<Draft>(EMPTY);
	const [isAdding, setIsAdding] = useState(false);
	const [newDraft, setNewDraft] = useState<Draft>(EMPTY);
	const [isSaving, setIsSaving] = useState(false);

	const startEdit = (category: any) => {
		setEditingId(category.id);
		setDraft({
			name: category.name || "",
			nameBn: category.nameBn || "",
			ddcRange: category.ddcRange || "",
		});
	};

	const save = async (id: string) => {
		if (!draft.name.trim()) {
			toast.error(ts("categoryNameRequired"));
			return;
		}
		setIsSaving(true);
		try {
			await updateLibraryCategory(id, {
				name: draft.name.trim(),
				nameBn: draft.nameBn.trim() || null,
				ddcRange: draft.ddcRange.trim() || null,
			});
			toast.success(ts("categorySaved"));
			setEditingId(null);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	const add = async () => {
		if (!newDraft.name.trim()) {
			toast.error(ts("categoryNameRequired"));
			return;
		}
		setIsSaving(true);
		try {
			await createLibraryCategory({
				name: newDraft.name.trim(),
				nameBn: newDraft.nameBn.trim() || undefined,
				ddcRange: newDraft.ddcRange.trim() || undefined,
			});
			toast.success(ts("categoryAdded"));
			setNewDraft(EMPTY);
			setIsAdding(false);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	const remove = async (id: string) => {
		try {
			await deleteLibraryCategory(id);
			toast.success(ts("categoryDeleted"));
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<Card className="shadow-none ring-0">
			<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
				<div className="min-w-0 space-y-1.5">
					<CardTitle className="text-base">{ts("categoriesTitle")}</CardTitle>
					<CardDescription>{ts("categoriesDescription")}</CardDescription>
				</div>
				<PermissionGuard
					permissions={[CATALOG.CREATE, CATALOG.ALL, PERMISSIONS.LIBRARY.ALL]}
				>
					<Button
						size="sm"
						variant="outline"
						onClick={() => setIsAdding((current) => !current)}
					>
						<Plus className="size-4" />
						{ts("addCategory")}
					</Button>
				</PermissionGuard>
			</CardHeader>

			<CardContent className="space-y-2">
				{isAdding && (
					<div className="bg-muted/30 grid grid-cols-1 gap-2 rounded-md border border-dashed p-3 @2xl/page:grid-cols-[1fr_1fr_120px_auto]">
						<div className="space-y-1">
							<Label className="text-xs">{ts("categoryName")}</Label>
							<Input
								value={newDraft.name}
								onChange={(event) =>
									setNewDraft({ ...newDraft, name: event.target.value })
								}
								placeholder="e.g. Science Fiction"
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs">{ts("categoryNameBn")}</Label>
							<Input
								value={newDraft.nameBn}
								onChange={(event) =>
									setNewDraft({ ...newDraft, nameBn: event.target.value })
								}
								placeholder="যেমন: কল্পবিজ্ঞান"
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs">{ts("categoryDdc")}</Label>
							<Input
								value={newDraft.ddcRange}
								onChange={(event) =>
									setNewDraft({ ...newDraft, ddcRange: event.target.value })
								}
								placeholder="500-599"
							/>
						</div>
						<div className="flex items-end gap-1.5">
							<Button onClick={add} disabled={isSaving}>
								{isSaving ? ft("saveLoading") : ft("save")}
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setIsAdding(false);
									setNewDraft(EMPTY);
								}}
							>
								{ft("cancel")}
							</Button>
						</div>
					</div>
				)}

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, index) => (
							<Skeleton key={index} className="h-12 rounded-md" />
						))}
					</div>
				) : (
					<div className="divide-border/70 divide-y rounded-md border">
						{categories.length === 0 && (
							<p className="text-muted-foreground p-6 text-center text-sm">
								{ts("noCategories")}
							</p>
						)}

						{categories.map((category: any) =>
							editingId === category.id ? (
								<div
									key={category.id}
									className="grid grid-cols-1 gap-2 p-3 @2xl/page:grid-cols-[1fr_1fr_120px_auto]"
								>
									<Input
										value={draft.name}
										onChange={(event) =>
											setDraft({ ...draft, name: event.target.value })
										}
									/>
									<Input
										value={draft.nameBn}
										onChange={(event) =>
											setDraft({ ...draft, nameBn: event.target.value })
										}
									/>
									<Input
										value={draft.ddcRange}
										onChange={(event) =>
											setDraft({ ...draft, ddcRange: event.target.value })
										}
									/>
									<div className="flex items-center gap-1">
										<Button
											size="icon-sm"
											variant="outline"
											onClick={() => save(category.id)}
											disabled={isSaving}
											title={ft("save")}
										>
											<Check className="h-4 w-4 text-emerald-600" />
										</Button>
										<Button
											size="icon-sm"
											variant="outline"
											onClick={() => setEditingId(null)}
											title={ft("cancel")}
										>
											<X className="text-muted-foreground hover:text-foreground h-4 w-4" />
										</Button>
									</div>
								</div>
							) : (
								<div
									key={category.id}
									className="flex flex-wrap items-center justify-between gap-3 p-3"
								>
									<div className="min-w-0 flex-1 space-y-0.5">
										<div className="flex flex-wrap items-center gap-2">
											<span className="truncate text-sm font-medium">
												{category.name}
											</span>
											{category.nameBn && (
												<span className="text-muted-foreground truncate text-sm">
													{category.nameBn}
												</span>
											)}
											{category.ddcRange && (
												<Badge
													variant="outline"
													className="font-mono text-[10px] font-normal"
												>
													{category.ddcRange}
												</Badge>
											)}
										</div>
										<p className="text-muted-foreground text-xs">
											{ts("categoryBookCount", { count: category.bookCount ?? 0 })}
										</p>
									</div>

									<div className="flex items-center gap-1">
										<PermissionGuard
											permissions={[
												CATALOG.EDIT,
												CATALOG.ALL,
												PERMISSIONS.LIBRARY.ALL,
											]}
										>
											<Button
												size="icon-sm"
												variant="outline"
												onClick={() => startEdit(category)}
												title={tc("edit")}
											>
												<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
											</Button>
										</PermissionGuard>
										<PermissionGuard
											permissions={[
												CATALOG.DELETE,
												CATALOG.ALL,
												PERMISSIONS.LIBRARY.ALL,
											]}
										>
											{/* The API refuses while titles still point at it, so a
											    shelf cannot be emptied by accident. */}
											<ConfirmationModal
												title={ts("deleteCategoryTitle")}
												description={ts("deleteCategoryDescription", {
													name: category.name,
												})}
												onConfirm={() => remove(category.id)}
											>
												<AlertDialogTrigger asChild>
													<Button
														size="icon-sm"
														variant="destructive"
														title={tc("delete")}
													>
														<Trash2 />
													</Button>
												</AlertDialogTrigger>
											</ConfirmationModal>
										</PermissionGuard>
									</div>
								</div>
							),
						)}
					</div>
				)}

				<p className="text-muted-foreground text-xs">{t("category")}: {categories.length}</p>
			</CardContent>
		</Card>
	);
}

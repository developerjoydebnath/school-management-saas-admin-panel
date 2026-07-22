export type ParentChild = {
	id: string;
	studentIdNo?: string | null;
	fullName?: string | null;
	rollNumber?: string | null;
	status?: string | null;
	classId?: string | null;
	className?: string | null;
	sectionId?: string | null;
	sectionName?: string | null;
	currentSessionId?: string | null;
};

export type ParentRecord = {
	id: string;
	username?: string | null;
	name?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	phone?: string | null;
	email?: string | null;
	isActive?: boolean;
	lastLogin?: string | null;
	createdAt?: string | null;
	childCount?: number;
	activeChildCount?: number;
	childrenPreview?: ParentChild[];
	children?: ParentChild[];
};

export function formatDateTime(value?: string | null) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export function formatNumber(value: unknown) {
	const amount = Number(value || 0);
	return Number.isFinite(amount) ? amount.toLocaleString() : "0";
}

export function getInitials(name?: string | null) {
	const parts = String(name || "Parent")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	return (parts[0]?.[0] || "P").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

export function portalBadgeClass(isActive?: boolean) {
	return isActive
		? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
		: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";
}

export function studentStatusClass(status?: string | null) {
	const normalized = String(status || "").toLowerCase();
	if (normalized === "active") return "bg-emerald-500/15 text-emerald-300";
	if (normalized === "suspended") return "bg-red-500/15 text-red-300";
	if (normalized === "inactive") return "bg-slate-500/15 text-slate-300";
	return "bg-muted text-muted-foreground";
}

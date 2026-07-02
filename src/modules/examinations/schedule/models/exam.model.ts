export class ExamModel {
	private _original: any;

	constructor(data: any = {}) {
		this._original = data;
	}

	get id(): string {
		return this._original.id || "";
	}

	get name(): string {
		return this._original.name || "";
	}

	get nameBn(): string {
		return this._original.nameBn || "";
	}

	get type(): string {
		return this._original.type || "HALF_YEARLY";
	}

	get status(): string {
		return this._original.status || "DRAFT";
	}

	get startDate(): string {
		return this._original.startDate || "";
	}

	get endDate(): string {
		return this._original.endDate || "";
	}

	get classes(): any[] {
		return this._original.classes || [];
	}

	get subjectsCount(): number {
		return this._original._count?.subjects || 0;
	}

	get syllabusesCount(): number {
		return this._original._count?.syllabuses || 0;
	}

	get original(): any {
		return this._original;
	}
}

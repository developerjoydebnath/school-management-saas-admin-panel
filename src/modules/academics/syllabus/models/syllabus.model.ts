export class SyllabusModel {
	private _original: any;

	constructor(data: any = {}) {
		this._original = data;
	}

	get id(): string {
		return this._original.id || "";
	}

	get title(): string {
		return this._original.title || "";
	}

	get status(): string {
		return this._original.status || "DRAFT";
	}

	get mode(): string {
		return this._original.mode || "STRUCTURED";
	}

	get isManual(): boolean {
		return this.mode === "MANUAL";
	}

	get content(): string {
		return this._original.content || "";
	}

	get exam(): any {
		return this._original.exam;
	}

	get class(): any {
		return this._original.class;
	}

	get section(): any {
		return this._original.section;
	}

	get totalSubjects(): number {
		return this._original.totalSubjects || 0;
	}

	get totalChapters(): number {
		return this._original.totalChapters || 0;
	}

	get totalTopics(): number {
		return this._original.totalTopics || 0;
	}

	get completedTopics(): number {
		return this._original.completedTopics || 0;
	}

	get completionPercent(): number {
		return Number(this._original.completionPercent || 0);
	}

	get updatedAt(): string {
		return this._original.updatedAt || "";
	}

	get original(): any {
		return this._original;
	}
}

import { StatusEnum, SubjectMarkDivisionEnum, SubjectTypeEnum } from "../types/enums";

export class Subject {
	private _original: any;

	constructor(data: any = {}) {
		this._original = data;
	}

	get id(): string {
		return this._original.id || "";
	}

	get name(): { en: string; bn: string } {
		return {
			en: this._original.enName || this._original.name?.en || "",
			bn: this._original.bnName || this._original.name?.bn || "",
		};
	}

	get enName(): string {
		return this._original.enName || this.name.en;
	}

	get bnName(): string {
		return this._original.bnName || this.name.bn;
	}

	get code(): string {
		return this._original.code || "";
	}

	get boardCode(): string {
		return this._original.boardCode || "";
	}

	get type(): SubjectTypeEnum {
		return (this._original.type as SubjectTypeEnum) || SubjectTypeEnum.MANDATORY;
	}

	get group(): string {
		return this._original.group || "";
	}

	get paperCount(): number {
		return this._original.paperCount || 1;
	}

	get fullMarks(): number {
		return this._original.fullMarks || 100;
	}

	get passMarks(): number {
		return this._original.passMarks || 33;
	}

	get markDivision(): SubjectMarkDivisionEnum {
		return this._original.markDivision || SubjectMarkDivisionEnum.WRITTEN;
	}

	get writtenMarks(): number {
		return this._original.writtenMarks || this._original.theoryMarks || this.fullMarks;
	}

	get writtenPassMarks(): number {
		return this._original.writtenPassMarks || this.passMarks;
	}

	get mcqMarks(): number {
		return this._original.mcqMarks || 0;
	}

	get mcqPassMarks(): number {
		return this._original.mcqPassMarks || 0;
	}

	get practicalMarks(): number {
		return this._original.practicalMarks || 0;
	}

	get practicalPassMarks(): number {
		return this._original.practicalPassMarks || 0;
	}

	get theoryMarks(): number {
		return this._original.theoryMarks || 0;
	}

	get sortOrder(): number {
		return this._original.sortOrder || 0;
	}

	get status(): StatusEnum {
		return (this._original.status?.toUpperCase() as StatusEnum) || StatusEnum.ACTIVE;
	}

	get classIds(): string[] {
		return this._original.classIds || [];
	}

	get classes(): any[] {
		return this._original.classes || [];
	}

	get description(): string {
		return this._original.description || "";
	}

	get original(): any {
		return this._original;
	}
}

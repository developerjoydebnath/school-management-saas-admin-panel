import { StatusEnum } from "@/shared/types/enums";

export class ClassRoomModel {
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

	get roomNo(): string {
		return this._original.roomNo || "";
	}

	get capacity(): number {
		return this._original.capacity || 0;
	}

	get floor(): string | undefined {
		return this._original.floor;
	}

	get building(): string | undefined {
		return this._original.building;
	}

	get highBench(): number {
		return this._original.highBench || 0;
	}

	get lowBench(): number {
		return this._original.lowBench || 0;
	}

	get chair(): number {
		return this._original.chair || 0;
	}

	get table(): number {
		return this._original.table || 0;
	}

	get board(): number {
		return this._original.board || 0;
	}

	get projector(): number {
		return this._original.projector || 0;
	}

	get fan(): number {
		return this._original.fan || 0;
	}

	get light(): number {
		return this._original.light || 0;
	}

	get roomLength(): number | undefined {
		return this._original.roomLength === null || this._original.roomLength === undefined
			? undefined
			: Number(this._original.roomLength);
	}

	get roomWidth(): number | undefined {
		return this._original.roomWidth === null || this._original.roomWidth === undefined
			? undefined
			: Number(this._original.roomWidth);
	}

	get dimensionUnit(): "feet" | "meter" {
		return this._original.dimensionUnit || "feet";
	}

	get layoutConfig(): any {
		return this._original.layoutConfig || null;
	}

	get status(): StatusEnum {
		return (this._original.status?.toUpperCase() as StatusEnum) || StatusEnum.ACTIVE;
	}

	get original(): any {
		return this._original;
	}
}

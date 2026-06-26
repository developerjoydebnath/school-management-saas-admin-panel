import { SchoolModel } from "@/shared/models/school.model";
import { SubscriptionPlanModel } from "./subscription-plan.model";

export class SchoolSubscriptionModel {
	private _id: string;
	private _schoolId: string;
	private _planId: string;
	private _startsAt: string;
	private _expiresAt: string | null;
	private _trialEndsAt: string | null;
	private _status: string;
	private _priceBdt: number;
	private _billingCycle: string;
	private _setupFeeBdt: number;
	private _discountPct: number;
	private _discountNote: string;
	private _gracePeriodDays: number;
	private _maxStudents: number | null;
	private _maxTeachers: number | null;
	private _maxStaff: number | null;
	private _maxClasses: number | null;
	private _maxSubjects: number | null;
	private _maxBranches: number | null;
	private _storageGb: number | null;
	private _freeStudentLimit: number;
	private _hasSmsNotifications: boolean;
	private _hasEmailNotifications: boolean;
	private _hasParentPortal: boolean;
	private _hasOnlineAdmission: boolean;
	private _hasOnlineFeePayment: boolean;
	private _hasResultPublishing: boolean;
	private _hasCustomDomain: boolean;
	private _hasApiAccess: boolean;
	private _hasAdvancedReports: boolean;
	private _hasPrioritySupport: boolean;
	private _hasDedicatedAccountManager: boolean;
	private _notes: string;
	private _createdAt: string;
	private _updatedAt: string;
	private _school: SchoolModel | null;
	private _plan: SubscriptionPlanModel | null;
	private _original: any;

	constructor(data: any = {}) {
		this._id = data.id || "";
		this._schoolId = data.schoolId || "";
		this._planId = data.planId || "";
		this._startsAt = data.startsAt || data.startDate || "";
		this._expiresAt = data.expiresAt ?? data.endDate ?? null;
		this._trialEndsAt = data.trialEndsAt ?? null;
		this._status = data.status || "";
		this._priceBdt = Number(data.priceBdt ?? data.price ?? 0);
		this._billingCycle = data.billingCycle || "";
		this._setupFeeBdt = Number(data.setupFeeBdt ?? 0);
		this._discountPct = Number(data.discountPct ?? 0);
		this._discountNote = data.discountNote || "";
		this._gracePeriodDays = data.gracePeriodDays ?? 0;
		this._maxStudents = data.maxStudents ?? null;
		this._maxTeachers = data.maxTeachers ?? null;
		this._maxStaff = data.maxStaff ?? null;
		this._maxClasses = data.maxClasses ?? null;
		this._maxSubjects = data.maxSubjects ?? null;
		this._maxBranches = data.maxBranches ?? null;
		this._storageGb = data.storageGb ?? null;
		this._freeStudentLimit = data.freeStudentLimit ?? 0;
		this._hasSmsNotifications = data.hasSmsNotifications ?? false;
		this._hasEmailNotifications = data.hasEmailNotifications ?? false;
		this._hasParentPortal = data.hasParentPortal ?? false;
		this._hasOnlineAdmission = data.hasOnlineAdmission ?? false;
		this._hasOnlineFeePayment = data.hasOnlineFeePayment ?? false;
		this._hasResultPublishing = data.hasResultPublishing ?? false;
		this._hasCustomDomain = data.hasCustomDomain ?? false;
		this._hasApiAccess = data.hasApiAccess ?? false;
		this._hasAdvancedReports = data.hasAdvancedReports ?? false;
		this._hasPrioritySupport = data.hasPrioritySupport ?? false;
		this._hasDedicatedAccountManager = data.hasDedicatedAccountManager ?? false;
		this._notes = data.notes || "";
		this._createdAt = data.createdAt || "";
		this._updatedAt = data.updatedAt || "";
		this._school = data.school ? new SchoolModel(data.school) : null;
		this._plan = data.plan ? new SubscriptionPlanModel(data.plan) : null;
		this._original = data.original || data;
	}

	get id(): string {
		return this._id;
	}

	get schoolId(): string {
		return this._schoolId;
	}

	get planId(): string {
		return this._planId;
	}

	get startsAt(): string {
		return this._startsAt;
	}

	get expiresAt(): string | null {
		return this._expiresAt;
	}

	get trialEndsAt(): string | null {
		return this._trialEndsAt;
	}

	get status(): string {
		return this._status;
	}

	get priceBdt(): number {
		return this._priceBdt;
	}

	get billingCycle(): string {
		return this._billingCycle;
	}

	get setupFeeBdt(): number {
		return this._setupFeeBdt;
	}

	get discountPct(): number {
		return this._discountPct;
	}

	get discountNote(): string {
		return this._discountNote;
	}

	get gracePeriodDays(): number {
		return this._gracePeriodDays;
	}

	get maxStudents(): number | null {
		return this._maxStudents;
	}

	get maxTeachers(): number | null {
		return this._maxTeachers;
	}

	get maxStaff(): number | null {
		return this._maxStaff;
	}

	get maxClasses(): number | null {
		return this._maxClasses;
	}

	get maxSubjects(): number | null {
		return this._maxSubjects;
	}

	get maxBranches(): number | null {
		return this._maxBranches;
	}

	get storageGb(): number | null {
		return this._storageGb;
	}

	get freeStudentLimit(): number {
		return this._freeStudentLimit;
	}

	get hasSmsNotifications(): boolean {
		return this._hasSmsNotifications;
	}

	get hasEmailNotifications(): boolean {
		return this._hasEmailNotifications;
	}

	get hasParentPortal(): boolean {
		return this._hasParentPortal;
	}

	get hasOnlineAdmission(): boolean {
		return this._hasOnlineAdmission;
	}

	get hasOnlineFeePayment(): boolean {
		return this._hasOnlineFeePayment;
	}

	get hasResultPublishing(): boolean {
		return this._hasResultPublishing;
	}

	get hasCustomDomain(): boolean {
		return this._hasCustomDomain;
	}

	get hasApiAccess(): boolean {
		return this._hasApiAccess;
	}

	get hasAdvancedReports(): boolean {
		return this._hasAdvancedReports;
	}

	get hasPrioritySupport(): boolean {
		return this._hasPrioritySupport;
	}

	get hasDedicatedAccountManager(): boolean {
		return this._hasDedicatedAccountManager;
	}

	get notes(): string {
		return this._notes;
	}

	get createdAt(): string {
		return this._createdAt;
	}

	get updatedAt(): string {
		return this._updatedAt;
	}

	get school(): SchoolModel | null {
		return this._school;
	}

	get plan(): SubscriptionPlanModel | null {
		return this._plan;
	}

	get original(): any {
		return this._original;
	}
}

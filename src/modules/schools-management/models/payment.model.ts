export class PaymentModel {
	private readonly _id: string;
	private readonly _schoolId: string;
	private readonly _subscriptionId: string | null;
	private readonly _transactionId: string | null;
	private readonly _invoiceId: string | null;
	private readonly _amount: number;
	private readonly _currency: string;
	private readonly _status: string;
	private readonly _method: string;
	private readonly _paidAt: string | null;
	private readonly _notes: string | null;
	private readonly _createdAt: string;
	private readonly _updatedAt: string;
	private readonly _school: any;
	private readonly _subscription: any;
	private readonly _original: any;

	constructor(data: any) {
		this._id = data?.id ?? "";
		this._schoolId = data?.schoolId ?? "";
		this._subscriptionId = data?.subscriptionId ?? null;
		this._transactionId = data?.transactionId ?? null;
		this._invoiceId = data?.invoiceId ?? null;
		this._amount = Number(data?.amount ?? 0);
		this._currency = data?.currency ?? "BDT";
		this._status = data?.status ?? "pending";
		this._method = data?.method ?? "";
		this._paidAt = data?.paidAt ?? null;
		this._notes = data?.notes ?? null;
		this._createdAt = data?.createdAt ?? "";
		this._updatedAt = data?.updatedAt ?? "";
		this._school = data?.school ?? null;
		this._subscription = data?.subscription ?? null;
		this._original = data ?? {};
	}

	get id() { return this._id; }
	get schoolId() { return this._schoolId; }
	get subscriptionId() { return this._subscriptionId; }
	get transactionId() { return this._transactionId; }
	get invoiceId() { return this._invoiceId; }
	get amount() { return this._amount; }
	get currency() { return this._currency; }
	get status() { return this._status; }
	get method() { return this._method; }
	get paidAt() { return this._paidAt; }
	get notes() { return this._notes; }
	get createdAt() { return this._createdAt; }
	get updatedAt() { return this._updatedAt; }
	get school() { return this._school; }
	get subscription() { return this._subscription; }
	get original() { return this._original; }
}

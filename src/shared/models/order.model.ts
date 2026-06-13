

export class Order {
  private id: number;
  private orderId: string;
  private subtotal: number;
  private totalCharge: number;
  private discount?: number;
  private currency?: string;
  private deliveryCharge?: number;
  private deliveryAddress?: string;
  private deliveryManId?: number;
  private total: number;
  private grandTotal: number;
  private customerId: number;
  private note?: string;
  private trxId?: string;
  private createdAt: string;
  private updatedAt: string;
  private deletedAt?: string;

  private original: Record<string, any>;

  constructor(data: Record<string, any>) {
    this.original = data;
    this.id = data.id;
    this.orderId = data.orderId;
    this.subtotal = data.subtotal;
    this.totalCharge = data.totalCharge ?? 0.0;
    this.currency = data.currency ?? "USD";
    this.discount = data.discount ?? 0.0;
    this.deliveryCharge = data.deliveryCharge ?? 0.0;
    this.deliveryAddress = data.deliveryAddress ?? "";
    this.deliveryManId = data.deliveryManId;
    this.total = data.total;
    this.grandTotal = data.grandTotal ?? 0.0;
    this.customerId = data.customerId;
    this.note = data.note ?? "";
    this.trxId = data.trxId ?? "";
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt ?? null;
  }

  // Getter methods
  getId(): number {
    return this.id;
  }

  getOrderId(): string {
    return this.orderId;
  }

  getSubtotal(): number {
    return this.subtotal;
  }

  getCurrency(): string | undefined {
    return this.currency;
  }

  getTotalCharge(): number {
    return this.totalCharge;
  }

  getDiscount(): number | undefined {
    return this.discount;
  }

  getDeliveryCharge(): number | undefined {
    return this.deliveryCharge;
  }

  getDeliveryAddress(): string | undefined {
    return this.deliveryAddress;
  }

  getDeliveryManId() {
    return this.deliveryManId;
  }

  getTotal(): number {
    return this.total;
  }

  getGrandTotal(): number {
    return this.grandTotal;
  }

  getCustomerId(): number {
    return this.customerId;
  }

  getNote(): string | undefined {
    return this.note;
  }

  getTrxId(): string | undefined {
    return this.trxId;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }

  getUpdatedAt(): string {
    return this.updatedAt;
  }

  getDeletedAt(): string | undefined {
    return this.deletedAt;
  }

  getOriginal() {
    return this.original;
  }
}

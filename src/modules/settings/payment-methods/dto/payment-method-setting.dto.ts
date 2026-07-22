export type PaymentMethodStatus = "ACTIVE" | "INACTIVE";
export type PaymentMethodMode = "manual" | "sandbox" | "live";

export type PaymentMethodCredentialField = {
	key: string;
	label: string;
	type: "text" | "password" | "url" | "textarea";
	required?: boolean;
	placeholder?: string;
	helperText?: string;
};

export type PaymentMethodProviderTemplate = {
	provider: string;
	label: string;
	category: "manual" | "bank" | "mobile_banking" | "gateway" | "custom";
	defaultMode: PaymentMethodMode;
	description: string;
	credentialFields: PaymentMethodCredentialField[];
};

export type PaymentMethodSetting = {
	id: string;
	provider: string;
	providerLabel: string;
	displayName: string;
	description?: string | null;
	mode: PaymentMethodMode;
	status: PaymentMethodStatus;
	adminEnabled: boolean;
	publicEnabled: boolean;
	isDefault: boolean;
	sortOrder: number;
	currency: string;
	instructions?: string | null;
	credentialData: Record<string, any>;
	publicConfig: Record<string, any>;
	createdAt?: string;
	updatedAt?: string;
};

export type PaymentMethodPayload = {
	provider: string;
	displayName: string;
	description?: string;
	mode: PaymentMethodMode;
	status: PaymentMethodStatus;
	adminEnabled: boolean;
	publicEnabled: boolean;
	isDefault: boolean;
	sortOrder: number;
	currency: string;
	instructions?: string;
	credentialData: Record<string, any>;
	publicConfig: Record<string, any>;
};

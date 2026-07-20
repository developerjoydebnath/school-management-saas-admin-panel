export type MailConfig = {
	id: string | null;
	provider: string;
	mode?: "system" | "own";
	isActive: boolean;
	smtpHost: string;
	smtpPort: number;
	smtpSecure: boolean;
	smtpUser: string;
	hasPassword: boolean;
	fromName: string;
	fromEmail: string;
	replyToEmail: string;
	isVerified: boolean;
	lastVerifiedAt: string | null;
	lastTestStatus: string | null;
	lastTestError: string | null;
	lastTestedAt: string | null;
	lastFailedAt: string | null;
	consecutiveFailures: number;
	source: string | null;
	updatedAt: string | null;
};

export type MailConfigPayload = {
	provider?: string;
	mode?: "system" | "own";
	isActive?: boolean;
	smtpHost?: string;
	smtpPort?: number;
	smtpSecure?: boolean;
	smtpUser?: string;
	smtpPassword?: string;
	fromName?: string;
	fromEmail?: string;
	replyToEmail?: string;
};

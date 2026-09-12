import { EventParticipantTypeEnum } from "@/modules/events/participants/dto/participant.dto";
import { z } from "zod";

export type CompetitionJudge = {
	name: string;
	designation?: string;
	organization?: string;
};

export type CompetitionEntry = {
	id: string;
	competitionId: string;
	participantType?: EventParticipantTypeEnum | null;
	participantId?: string | null;
	teamName?: string | null;
	position?: number | null;
	score?: number | string | null;
	points?: number | null;
	timeResult?: string | null;
	judgeRemarks?: string | null;
};

export type EventCompetition = {
	id: string;
	eventId: string;
	name: string;
	nameBn?: string | null;
	competitionType?: string | null;
	category?: string | null;
	classId?: string | null;
	gender?: string | null;
	maxParticipants?: number | null;
	rules?: string | null;
	judges: CompetitionJudge[];
	sortOrder: number;
	class?: { id: string; enName: string; bnName?: string | null } | null;
	entries?: CompetitionEntry[];
	_count?: { entries: number };
};

export type EventAward = {
	id: string;
	eventId: string;
	competitionId?: string | null;
	awardName: string;
	awardCategory?: string | null;
	position?: number | null;
	winnerType?: EventParticipantTypeEnum | null;
	winnerId?: string | null;
	winnerName?: string | null;
	prizeDescription?: string | null;
	certificateIssued: boolean;
	medalIssued: boolean;
	trophyIssued: boolean;
	remarks?: string | null;
	competition?: { id: string; name: string } | null;
};

const emptyToUndefined = (value: unknown) =>
	typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalNumber = z.preprocess(
	(v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
	z.number().optional()
);

export const competitionSchema = z.object({
	eventId: z.string().min(1),
	name: z.string().min(1, "Name is required").max(255),
	nameBn: z.string().optional(),
	competitionType: z.string().optional(),
	category: z.string().optional(),
	classId: z.preprocess(emptyToUndefined, z.string().optional()),
	gender: z.preprocess(emptyToUndefined, z.string().optional()),
	maxParticipants: optionalNumber,
	rules: z.string().optional(),
	judges: z
		.array(
			z.object({
				name: z.string().min(1, "Judge name is required"),
				designation: z.string().optional(),
				organization: z.string().optional(),
			})
		)
		.optional(),
	sortOrder: optionalNumber,
});

export type CompetitionFormValues = z.infer<typeof competitionSchema>;

export const entrySchema = z.object({
	participantType: z.preprocess(
		emptyToUndefined,
		z.nativeEnum(EventParticipantTypeEnum).optional()
	),
	participantId: z.preprocess(emptyToUndefined, z.string().optional()),
	teamName: z.string().optional(),
	position: optionalNumber,
	score: optionalNumber,
	points: optionalNumber,
	timeResult: z.string().optional(),
	judgeRemarks: z.string().optional(),
});

export type EntryFormValues = z.infer<typeof entrySchema>;

export const awardSchema = z.object({
	eventId: z.string().min(1),
	competitionId: z.preprocess(emptyToUndefined, z.string().optional()),
	awardName: z.string().min(1, "Award name is required").max(255),
	awardCategory: z.string().optional(),
	position: optionalNumber,
	winnerType: z.preprocess(
		emptyToUndefined,
		z.nativeEnum(EventParticipantTypeEnum).optional()
	),
	winnerId: z.preprocess(emptyToUndefined, z.string().optional()),
	winnerName: z.string().optional(),
	prizeDescription: z.string().optional(),
	certificateIssued: z.boolean(),
	medalIssued: z.boolean(),
	trophyIssued: z.boolean(),
	remarks: z.string().optional(),
});

export type AwardFormValues = z.infer<typeof awardSchema>;

export const genderOptions = [
	{ label: "Mixed / Any", value: "" },
	{ label: "Male", value: "male" },
	{ label: "Female", value: "female" },
];

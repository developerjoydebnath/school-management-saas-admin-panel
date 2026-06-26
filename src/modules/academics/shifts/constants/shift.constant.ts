export const SHIFT_FORM_FIELDS = [
	{
		name: "name",
		label: "Shift Name",
		placeholder: "e.g. Morning Shift",
		type: "text",
		required: true,
	},
	{
		name: "startTime",
		label: "Start Time",
		placeholder: "e.g. 08:00",
		type: "time",
		required: true,
	},
	{
		name: "endTime",
		label: "End Time",
		placeholder: "e.g. 14:00",
		type: "time",
		required: true,
	},
	{
		name: "status",
		label: "Status",
		type: "select",
		options: [
			{ label: "Active", value: "ACTIVE" },
			{ label: "Inactive", value: "INACTIVE" },
		],
		required: true,
	},
] as const;

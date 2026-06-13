export const SESSION_FORM_FIELDS = [
	{
		name: "name",
		label: "Session Name",
		placeholder: "e.g. 2024-25",
		type: "text",
		required: true,
	},
	{
		name: "year",
		label: "Session Year",
		placeholder: "e.g. 2024",
		type: "number",
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
];


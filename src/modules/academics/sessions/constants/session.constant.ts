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
		placeholder: "Select Year",
		type: "select",
		options: Array.from({ length: 11 }, (_, i) => {
			const year = 2020 + i;
			return { label: year.toString(), value: year.toString() };
		}),
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


export const SHIFT_FORM_FIELDS = [
	{
		name: "name",
		label: "Shift Name",
		placeholder: "Select Shift Name",
		type: "select",
		options: [
			{ label: "Morning", value: "MORNING" },
			{ label: "Day", value: "DAY" },
			{ label: "Evening", value: "EVENING" },
			{ label: "Night", value: "NIGHT" },
			{ label: "Early Morning", value: "EARLY_MORNING" },
			{ label: "Late Morning", value: "LATE_MORNING" },
			{ label: "Late Evening", value: "LATE_EVENING" },
			{ label: "Late Night", value: "LATE_NIGHT" },
			{ label: "Full Day", value: "FULL_DAY" },
		],
	},
	{
		name: "startTime",
		label: "Start Time",
		placeholder: "e.g. 08:00 AM",
		type: "time",
	},
	{
		name: "endTime",
		label: "End Time",
		placeholder: "e.g. 01:00 PM",
		type: "time",
	},
	{
		name: "status",
		label: "Status",
		placeholder: "Select Status",
		type: "select",
		options: [
			{ label: "Active", value: "ACTIVE" },
			{ label: "Inactive", value: "INACTIVE" },
		],
	},
];

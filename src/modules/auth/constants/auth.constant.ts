export const LOGIN_FORM_FIELDS = [
	{
		name: "identifier",
		type: "text",
		label: "Username",
		placeholder: "Student ID, Phone, or Email",
		required: true,
	},
	{
		name: "password",
		label: "Password",
		type: "password",
		placeholder: "••••••••",
		required: true,
	},
];

export const FORGOT_PASSWORD_FORM_FIELDS = [
	{
		name: "email",
		type: "email",
		label: "Email Address",
		placeholder: "admin@educore.com",
		required: true,
	},
];

export const CLASS_FORM_FIELDS = [
  {
    name: "name",
    label: "Class Name",
    placeholder: "e.g. Class 1",
    type: "text",
  },
  {
    name: "sections",
    label: "Sections (Optional)",
    placeholder: "Type and press Enter (e.g. A, B)",
    type: "tags",
    helperText: "Press Enter or Comma to add a section.",
  },
  {
    name: "capacity",
    label: "Capacity",
    placeholder: "e.g. 30",
    type: "number",
  },
  {
    name: "roomNumber",
    label: "Room Number",
    placeholder: "e.g. 101",
    type: "text",
  },
  {
    name: "shift",
    label: "Shift",
    placeholder: "Select Shift",
    type: "select",
    options: [], // Will be populated dynamically
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

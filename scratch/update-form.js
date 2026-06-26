const fs = require('fs');
const file = 'c:/Workspace/Stackrover/school-management/admin-panel/src/modules/schools-management/schools/components/SchoolForm.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useTranslations')) {
    content = content.replace('import { useForm } from "react-hook-form";', 'import { useForm } from "react-hook-form";\nimport { useTranslations } from "next-intl";');
}

if (!content.includes('const tForm = useTranslations')) {
    content = content.replace('const isEdit = !!initialData;', 'const isEdit = !!initialData;\n\tconst tForm = useTranslations("SchoolForm");');
}

const replacements = [
    {
        title: 'Basic Information',
        desc: 'Core details about the school identity.',
        key: 'basicInfo'
    },
    {
        title: 'Location & Contact',
        desc: 'Address and communication details.',
        key: 'locationContact'
    },
    {
        title: 'Official Information',
        desc: 'Government and regulatory identifiers.',
        key: 'officialInfo'
    },
    {
        title: 'Academic Structure',
        desc: 'Mediums, shifts, and capacities.',
        key: 'academicStructure'
    },
    {
        title: 'Branding & Digital',
        desc: 'Links, domains, and social presence.',
        key: 'brandingDigital'
    }
];

replacements.forEach(r => {
    content = content.replace(
        new RegExp('<CardTitle>' + r.title + '</CardTitle>', 'g'),
        '<CardTitle>{tForm("sections.' + r.key + '.title")}</CardTitle>'
    );
    content = content.replace(
        new RegExp('<CardDescription>' + r.desc + '</CardDescription>', 'g'),
        '<CardDescription>{tForm("sections.' + r.key + '.description")}</CardDescription>'
    );
});

const inputFieldRegex = /<InputField[\s\S]*?\/>/g;
content = content.replace(inputFieldRegex, (match) => {
    if (match.includes('type="checkbox"') || match.includes('type="radio"') || match.includes('type="select"')) {
        return match;
    }
    const labelMatch = match.match(/label="([^"]+)"/);
    if (!labelMatch) return match;
    const label = labelMatch[1];
    
    const placeholderMatch = match.match(/placeholder="([^"]+)"/);
    if (placeholderMatch) {
        return match.replace(/placeholder="[^"]+"/, 'placeholder={`Enter ${"' + label + '"}`.replace(" (Bengali)", "").replace(" (Optional)", "")}');
    } else {
        return match.replace('/>', ' placeholder={`Enter ${"' + label + '"}`.replace(" (Optional)", "")}\n\t\t\t\t\t/>');
    }
});

fs.writeFileSync(file, content);
console.log('Done');

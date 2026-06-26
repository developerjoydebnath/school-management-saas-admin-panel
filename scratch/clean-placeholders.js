const fs = require('fs');
const file = 'c:/Workspace/Stackrover/school-management/admin-panel/src/modules/schools-management/schools/components/SchoolForm.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/placeholder=\{\`Enter \$\{\\\"([^\\\"]+)\\\"\}\\`\.replace\(\\\" \(Bengali\)\\\", \\\"\\\"\)\.replace\(\\\" \(Optional\)\\\", \\\"\\\"\)\}/g, (match, p1) => {
    let clean = p1.replace(' (Bengali)', '').replace(' (Optional)', '');
    return 'placeholder=\"Enter ' + clean + '\"';
});

content = content.replace(/placeholder=\{\`Enter \$\{\\\"([^\\\"]+)\\\"\}\\`\.replace\(\\\" \(Optional\)\\\", \\\"\\\"\)\}/g, (match, p1) => {
    let clean = p1.replace(' (Optional)', '');
    return 'placeholder=\"Enter ' + clean + '\"';
});

content = content.replace(/required\n\t\t\t\t\t placeholder=/g, 'required\n\t\t\t\t\t\tplaceholder=');
content = content.replace(/label=\"Alternate Phone\"\n\t\t\t\t\t placeholder=/g, 'label=\"Alternate Phone\"\n\t\t\t\t\t\tplaceholder=');
content = content.replace(/label=\"Upazila ID\"\n\t\t\t\t\t placeholder=/g, 'label=\"Upazila ID\"\n\t\t\t\t\t\tplaceholder=');
content = content.replace(/type=\"textarea\"\n\t\t\t\t\t\t placeholder=/g, 'type=\"textarea\"\n\t\t\t\t\t\t\tplaceholder=');
content = content.replace(/label=\"Post Code\"  placeholder=/g, 'label=\"Post Code\"\n\t\t\t\t\t\tplaceholder=');
content = content.replace(/label=\"EIIN\"  placeholder=/g, 'label=\"EIIN\"\n\t\t\t\t\t\tplaceholder=');
content = content.replace(/label=\"BANBEIS Code\"  placeholder=/g, 'label=\"BANBEIS Code\"\n\t\t\t\t\t\tplaceholder=');
content = content.replace(/label=\"Registration Number\"\n\t\t\t\t\t placeholder=/g, 'label=\"Registration Number\"\n\t\t\t\t\t\tplaceholder=');
content = content.replace(/type=\"number\"\n\t\t\t\t\t placeholder=/g, 'type=\"number\"\n\t\t\t\t\t\tplaceholder=');
content = content.replace(/type=\"url\"\n\t\t\t\t\t placeholder=/g, 'type=\"url\"\n\t\t\t\t\t\tplaceholder=');

fs.writeFileSync(file, content);
console.log('Cleaned up placeholders');

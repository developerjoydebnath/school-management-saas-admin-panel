const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');
const dbRaw = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(dbRaw);

if (!db.admissions) {
    db.admissions = [];
}

const existingAdmissionIds = new Set(db.admissions.map(a => a.id));

let addedCount = 0;

db.students.forEach(student => {
    if (!existingAdmissionIds.has(student.admissionId)) {
        // Create an admission record for this student
        const admission = {
            fullName: student.fullName,
            dob: student.dob,
            gender: student.gender,
            class: student.class,
            section: student.section,
            session: student.session,
            fatherName: student.fatherName,
            mobile: student.mobile,
            admissionType: student.admissionType || "new",
            admissionFee: student.admissionFee || 5000,
            motherName: student.motherName || "",
            guardianDetails: student.guardianDetails || "",
            motherNid: student.motherNid || "",
            fatherNid: student.fatherNid || "",
            presentAddress: student.presentAddress || "",
            permanentAddress: student.permanentAddress || "",
            bloodGroup: student.bloodGroup || "",
            religion: student.religion || "",
            nationality: student.nationality || "Bangladeshi",
            emergencyContact: student.emergencyContact || "",
            previousSchool: student.previousSchool || "",
            tcNumber: student.tcNumber || "",
            lastResult: student.lastResult || "",
            marksheet: student.marksheet || "",
            tcScan: student.tcScan || "",
            allergies: student.allergies || "",
            conditions: student.conditions || "",
            customData: student.customData || "{}",
            status: "Approved",
            date: student.date || new Date().toISOString(),
            id: student.admissionId
        };
        db.admissions.push(admission);
        existingAdmissionIds.add(admission.id);
        addedCount++;
    }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`Successfully added ${addedCount} missing admissions to db.json`);

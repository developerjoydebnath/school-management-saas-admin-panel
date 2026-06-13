const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');
const dbRaw = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(dbRaw);

const firstNamesMale = ["Rahim", "Karim", "Arif", "Hasan", "Kamal", "Jamal", "Rafiq", "Shafiq", "Tariq", "Zahid", "Nabil", "Sami", "Imran", "Farhan", "Riyad"];
const firstNamesFemale = ["Fatima", "Ayesha", "Khadija", "Sumaiya", "Nusrat", "Sadia", "Tania", "Mithila", "Tasnia", "Ruma", "Nadia", "Tanjina", "Samira"];
const lastNames = ["Rahman", "Islam", "Hossain", "Ahmed", "Chowdhury", "Khan", "Sikder", "Miah", "Haque", "Uddin", "Ali"];

const classes = ["class-1", "class-2", "class-3", "class-4", "class-5", "class-6", "class-7", "class-8", "class-9", "class-10"];
const sections = ["A", "B"];
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const religions = ["Islam", "Hinduism", "Christianity", "Buddhism"];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomMobile = () => "01" + ["7", "8", "9", "6", "3"][randomNumber(0, 4)] + randomNumber(10000000, 99999999);
const randomNid = () => randomNumber(1000000000, 9999999999).toString();
const randomId = () => Math.random().toString(36).substring(2, 11);

const generateStudents = (count) => {
    const newStudents = [];
    for (let i = 0; i < count; i++) {
        const isMale = Math.random() > 0.5;
        const firstName = randomItem(isMale ? firstNamesMale : firstNamesFemale);
        const lastName = randomItem(lastNames);
        const fullName = `${firstName} ${lastName}`;
        const gender = isMale ? "male" : "female";
        const studentClass = randomItem(classes);
        const section = randomItem(sections);
        const roll = randomNumber(1, 100).toString().padStart(3, '0');
        const studentId = `STU-2025-${randomNumber(100, 999)}`;
        
        newStudents.push({
            id: randomId(),
            fullName: fullName,
            dob: `201${randomNumber(0, 9)}-0${randomNumber(1, 9)}-1${randomNumber(0, 9)}`,
            gender: gender,
            class: studentClass,
            section: section,
            session: "session-2025",
            fatherName: `${randomItem(firstNamesMale)} ${lastName}`,
            motherName: `${randomItem(firstNamesFemale)} ${lastName}`,
            mobile: randomMobile(),
            guardianDetails: "Local Guardian",
            motherNid: randomNid(),
            fatherNid: randomNid(),
            presentAddress: `House ${randomNumber(1, 100)}, Road ${randomNumber(1, 20)}, Dhaka`,
            permanentAddress: `Village XYZ, Thana ABC, District DEF`,
            bloodGroup: randomItem(bloodGroups),
            religion: randomItem(religions),
            nationality: "Bangladeshi",
            emergencyContact: randomMobile(),
            previousSchool: "Kindergarten " + randomNumber(1, 10),
            tcNumber: `TC-${randomNumber(1000, 9999)}`,
            lastResult: `${randomNumber(3, 5)}.00`,
            marksheet: "",
            tcScan: "",
            allergies: Math.random() > 0.8 ? "Dust" : "None",
            conditions: "Healthy",
            customData: "{}",
            status: "ACTIVE",
            date: new Date().toISOString(),
            studentId: studentId,
            admissionId: randomId(),
            roll: roll,
            joinedDate: new Date().toISOString(),
            admissionType: "new",
            admissionFee: 5000
        });
    }
    return newStudents;
};

// Add 50 new students
const studentsToAdd = generateStudents(50);
if (!db.students) db.students = [];
db.students = [...db.students, ...studentsToAdd];

// Write back to db.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`Successfully added ${studentsToAdd.length} students to db.json`);

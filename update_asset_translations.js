const fs = require('fs');

// 1. Update bn.json
const bnPath = 'src/messages/bn.json';
const bnData = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

Object.assign(bnData['Inventory'], {
  "item": "আইটেম",
  "addAsset": "অ্যাসেট যোগ করুন",
  "inStoreAssets": "স্টোরে রয়েছে",
  "inUseAssets": "ব্যবহারে রয়েছে",
  "damagedLostAssets": "ক্ষতিগ্রস্ত/হারানো"
});

fs.writeFileSync(bnPath, JSON.stringify(bnData, null, 2), 'utf8');
console.log('Successfully updated bn.json');

// 2. Update AssetList.tsx
const assetListPath = 'src/modules/inventory/assets/components/AssetList.tsx';
let assetListContent = fs.readFileSync(assetListPath, 'utf8');

// Remove assetTrendConfig from top level
assetListContent = assetListContent.replace(/const assetTrendConfig = \{\n\tcount: \{ label: \"Records\", color: \"var\(--muted-foreground\)\" \},\n\} satisfies ChartConfig;\n\n/g, '');

// Add assetTrendConfig inside AssetTrendChart
assetListContent = assetListContent.replace(
  /const chartData = trend\?\.length \? trend : \[\];/g,
  `const chartData = trend?.length ? trend : [];\n\n\tconst assetTrendConfig = {\n\t\tcount: { label: t("totalRecords"), color: "var(--muted-foreground)" },\n\t} satisfies ChartConfig;`
);

fs.writeFileSync(assetListPath, assetListContent, 'utf8');
console.log('Successfully updated AssetList.tsx');

import fs from 'fs';
import path from 'path';

console.log("=".repeat(60));
console.log("🔍 SMART PROJECT TRACKING ASSISTANT - FRONTEND VERIFICATION");
console.log("=".repeat(60));

const srcDir = './src';

// Check key directories
console.log("\n1️⃣  CHECKING DIRECTORY STRUCTURE...");
const dirs = [
  'components',
  'context',
  'hooks',
  'lib',
  'pages',
  'services',
  'types',
  'assets'
];

dirs.forEach(dir => {
  const fullPath = path.join(srcDir, dir);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
});

// Check key files
console.log("\n2️⃣  CHECKING KEY FILES...");
const files = [
  'App.tsx',
  'main.tsx',
  'routes.tsx',
];

files.forEach(file => {
  const fullPath = path.join(srcDir, file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Check config files
console.log("\n3️⃣  CHECKING CONFIG FILES...");
const configs = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'eslint.config.js',
  'components.json',
];

configs.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Check build output
console.log("\n4️⃣  CHECKING BUILD OUTPUT...");
const distExists = fs.existsSync('./dist');
if (distExists) {
  const files = fs.readdirSync('./dist').length;
  console.log(`   ✅ dist/ (${files} files)`);
} else {
  console.log(`   ❌ dist/ NOT FOUND - run 'npm run build'`);
}

console.log("\n" + "=".repeat(60));
console.log("✨ FRONTEND VERIFICATION COMPLETE!");
console.log("=".repeat(60));

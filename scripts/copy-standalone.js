const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const standaloneBase = path.join(rootDir, '.next', 'standalone');

if (!fs.existsSync(standaloneBase)) {
  console.warn('⚠️  Folder .next/standalone tidak ditemukan. Pastikan output: "standalone" disetel di next.config.ts');
  process.exit(0);
}

// Menentukan lokasi target folder tempat server.js berada
let targetDir = standaloneBase;
if (fs.existsSync(path.join(standaloneBase, 'my-app', 'server.js'))) {
  targetDir = path.join(standaloneBase, 'my-app');
}

console.log('\n📦 Menyiapkan aset untuk standalone production build...');

// 1. Copy folder public/
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(targetDir, 'public');
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
  console.log('✅ [1/3] Berhasil copy: public/ -> ' + path.relative(rootDir, publicDest));
} else {
  console.log('ℹ️  Folder public/ tidak ditemukan, dilewati.');
}

// 2. Copy folder .next/static/
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(targetDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
  console.log('✅ [2/3] Berhasil copy: .next/static/ -> ' + path.relative(rootDir, staticDest));
} else {
  console.warn('⚠️  Folder .next/static/ tidak ditemukan.');
}

// 3. Copy file .env.local dan/atau .env
const envFiles = ['.env.local', '.env'];
let copiedEnv = 0;
for (const envFile of envFiles) {
  const envSrc = path.join(rootDir, envFile);
  const envDest = path.join(targetDir, envFile);
  if (fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, envDest);
    console.log(`✅ [3/3] Berhasil copy: ${envFile} -> ` + path.relative(rootDir, envDest));
    copiedEnv++;
  }
}
if (copiedEnv === 0) {
  console.warn('⚠️  Tidak ada file .env / .env.local yang ditemukan.');
}

// 4. Generate start.js helper with default custom port 6464
const startScriptContent = `// Auto-generated production launcher with default port 6464
process.env.PORT = process.env.PORT || '6464';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
console.log('🚀 Server berjalan di http://' + process.env.HOSTNAME + ':' + process.env.PORT);
require('./server.js');
`;
fs.writeFileSync(path.join(targetDir, 'start.js'), startScriptContent);
console.log('✅ [4/4] Dibuat launcher otomatis: start.js (Default Port: 6464)');

// 5. Update package.json di standalone (jika ada) agar npm start langsung pakai start.js
const standalonePkgPath = path.join(targetDir, 'package.json');
if (fs.existsSync(standalonePkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(standalonePkgPath, 'utf8'));
    pkg.scripts = {
      start: 'node start.js'
    };
    fs.writeFileSync(standalonePkgPath, JSON.stringify(pkg, null, 2));
  } catch (e) {}
}

console.log('\n🎉 Standalone build SIAP DIGUNAKAN!');
console.log(`📂 Folder siap copy ke server: ${path.relative(rootDir, targetDir)}/`);
console.log('👉 Di server cukup jalankan salah satu perintah berikut:');
console.log('   1. node start.js            (Otomatis Port 6464)');
console.log('   2. npm start                (Otomatis Port 6464)');
console.log('   3. pm2 start start.js --name "smartmap"\n');


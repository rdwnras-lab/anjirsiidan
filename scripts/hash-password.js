// Jalankan: node scripts/hash-password.js passwordkamu
// Lalu copy hasilnya ke ADMIN_PASSWORD_HASH di .env

const bcrypt = require('bcryptjs');
const password = process.argv[2];

if (!password) {
  console.log('\nCara pakai: node scripts/hash-password.js passwordkamu\n');
  console.log('Contoh:     node scripts/hash-password.js Vechnost@2025\n');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log('\n====================================');
console.log('Password:', password);
console.log('Hash:    ', hash);
console.log('====================================');
console.log('\nCopy baris HASH di atas ke file .env.local:');
console.log('ADMIN_PASSWORD_HASH=' + hash + '\n');

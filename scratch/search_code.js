const fs = require('fs');
const ar = JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));
console.log('t_1c7783e0 (ar):', ar['t_1c7783e0']);
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
console.log('t_1c7783e0 (en):', en['t_1c7783e0']);

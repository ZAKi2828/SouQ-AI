const fs = require('fs');

const ar = JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));

const keys = [
  't_80b5bbe8',
  't_377e5fdb',
  't_44123e4d',
  't_5f4f3a8',
  't_a76a7c7d',
  't_e6560005',
  't_67e61f41',
  't_410ee66',
  't_15187dfac',
  't_74dcec9f',
  't_217db6d41',
  't_2f180ca',
  't_5b4fc042',
  't_2f1ba81'
];

keys.forEach(k => {
  console.log(`${k}: ${ar[k]}`);
});

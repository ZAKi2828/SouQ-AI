const https = require('https');

function queryDoH(name, type) {
  return new Promise((resolve, reject) => {
    const url = `https://dns.google/resolve?name=${name}&type=${type}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    const ns = await queryDoH('souqai.net', 'NS');
    console.log('NS Records for souqai.net:');
    if (ns.Answer) {
      ns.Answer.forEach(ans => {
        console.log(`- ${ans.data}`);
      });
    } else {
      console.log('No NS answers returned yet.');
      console.log(JSON.stringify(ns, null, 2));
    }
  } catch (err) {
    console.error('DoH Error:', err.message);
  }
}

run();

const fs = require('fs')
const path = require('path')
const baseUrl = path.join(__dirname, './GXA_WORKS');
// console.log(baseUrl);
// const f = fs.readdirSync(baseUrl);

function _s(id, path) {
  return `
  server {
    listen       ${+id + 40000};
    server_name  localhost;
    location / {
      root   ${path}/website;
      index  index.html index.htm;
      try_files $uri $uri/ /index.html;
    }
  }
  `
}
const f = new Array(1000)
for (let i = 0; i < f.length; i ++ ) f[i] = i + 1;
const res = f.reduce((pre, cur) => pre + _s(cur, `${baseUrl}/${cur}`) + '\n', '')
// console.log(res);
fs.writeFileSync('./GXA_WORKS_40000-41000', res)



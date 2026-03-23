const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const buildHash = '12345';
html = html.replace(/href="css\/style\.css"/g, `href="css/style.css?v=${buildHash}"`);
html = html.replace(/src="js\/env\.js"/g, `src="js/env.js?v=${buildHash}"`);
console.log(html.includes(`src="js/env.js?v=${buildHash}"`));

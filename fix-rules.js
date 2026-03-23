const fs = require('fs');
let text = fs.readFileSync('database.rules.json', 'utf8');
text = text.replace(/\s*"vibex":\s*{\s*"\.read":\s*"auth\s*!=\s*null",\s*"\.write":\s*"auth\s*!=\s*null"\s*},/, '');
fs.writeFileSync('database.rules.json', text);

const fs = require('fs');

let code = fs.readFileSync('js/salah.js', 'utf8');

const newConsolidate = `
  function consolidateByDate(arr) {
    if (!arr || arr.length === 0) return [];
    
    // Group all entries by their exact date string. Map retains insertion order.
    const map = new Map();
    
    arr.forEach((entry, i) => {
      // Use purely the "YYYY-MM-DD" date component, ignoring the timestamp
      // Sometimes entries have just a timestamp. 
      // If there is no explicit date, try extracting a date from the timestamp if formatted correctly.
      let d = entry.date;
      if (!d && entry.timestamp) {
        // e.g. "04-03-2024 10:15:20" -> extract purely the date part
        d = entry.timestamp.split(' ')[0];
      }
      
      const key = d || \`Unknown-\${i}\`;
      map.set(key, entry); // This continuously overwrites, keeping only the 'last' entry of the day
    });

    return Array.from(map.values());
  }
`;

code = code.replace(/function consolidateByDate\(arr\) \{[\s\S]*?return consolidated;\n  \}/, newConsolidate.trim());

fs.writeFileSync('js/salah.js', code);

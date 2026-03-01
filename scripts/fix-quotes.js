const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/db/quotes.json', 'utf8'));
data.forEach(q => {
    const match = q.category.match(/^(.*\([0-9-]+\))(.*)$/);
    if (match && match[2].trim()) {
        const cat = match[1].trim();
        let indText = match[2].trim();
        
        if (indText.endsWith('*') || indText.endsWith('"') || indText.endsWith('.')) {
            indText = indText.replace(/[*".]+$/, '');
        }
        
        q.category = cat;
        q.text = indText + ' (' + q.text + ')';
    }
});
fs.writeFileSync('src/db/quotes.json', JSON.stringify(data, null, 2));
console.log('Quotes fixed!');

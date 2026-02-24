const fs = require('fs');
const path = require('path');

const text = fs.readFileSync(path.join(__dirname, '../inspirasi.text'), 'utf-8');

// Use a more robust regex or state machine approach because the text is basically one giant string or poorly formatted lines
// The structure is generally:
// [Arabic text] (Optional)
// "Indonesian quote"
// "English quote" (Optional)
// (Source)

// Let's use regex to extract everything that looks like a quote block.
// Each block usually ends with (Source).
const blockRegex = /(?:([^\(]+?))?\s*\(([^)]+)\)/g;

const quotes = [];
let currentCategory = "Umum";

// First, we need to split by "Bagian X:" to track categories
const parts = text.split(/(Bagian \d+: .+?(?=\[|\"|ر))/);

for (let i = 0; i < parts.length; i++) {
    let part = parts[i].trim();
    if (part.startsWith('Bagian')) {
        currentCategory = part.replace(/Bagian \d+:\s*/, '').trim();
        continue;
    }
    
    if (!part) continue;

    // Inside each part, split by the end-of-source parenthesis, looking for pattern: (Source)
    let match;
    while ((match = blockRegex.exec(part)) !== null) {
        let content = match[1];
        let source = match[2];

        if (!content || !source) continue;
        content = content.trim();
        source = source.trim();

        // If source is too long, it might be a false positive
        if (source.length > 50) continue;

        // Skip category headers matched by mistake
        if (content.includes("Mutiara Hikmah") || content.includes("Panduan Lengkap")) continue;

        // Extract Indonesian text. It's usually enclosed in double quotes.
        let textIdn = "";
        const idnMatches = content.match(/"([^"]+)"/g);
        
        if (idnMatches && idnMatches.length >= 1) {
            // Usually the first quote is Indonesian, the second is English
            textIdn = idnMatches[0].replace(/"/g, '').trim();
        } else {
            // If no quotes, just take the non-Arabic part
            const nonArabic = content.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/g, '').trim();
            if (nonArabic) {
               textIdn = nonArabic.replace(/^\*|\*$/g, '').trim();
            }
        }

        if (textIdn && source) {
            quotes.push({
                text: textIdn,
                source: source,
                category: currentCategory
            });
        }
    }
}

// Fallback if parsing failed somehow
if (quotes.length === 0) {
    quotes.push({ text: "Keluarga adalah anugerah terindah.", source: "Founder JannahFlow", category: "Keluarga" });
}

fs.writeFileSync(path.join(__dirname, '../src/db/quotes.json'), JSON.stringify(quotes, null, 2));
console.log(`Parsed ${quotes.length} quotes!`);

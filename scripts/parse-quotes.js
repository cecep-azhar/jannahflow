const fs = require('fs');
const path = require('path');

const text = fs.readFileSync(path.join(__dirname, '../inspirasi.text'), 'utf-8');
const lines = text.split('\n').map(l => l.trim()).filter(l => l);

const quotes = [];
let currentLines = [];
let currentCategory = "General";

for (const line of lines) {
    if (line.includes('Mutiara Hikmah JannahFlow') || line.includes('Panduan Lengkap') || line.includes('Koleksi 360 Kutipan')) {
        continue;
    }
    if (line.startsWith('Bagian')) {
        currentCategory = line.split(':')[1]?.split('(')[0]?.trim() || "General";
        continue;
    }
    
    if (line.startsWith('(') && line.endsWith(')')) {
        // This is the source line
        const source = line.slice(1, -1);
        
        // The Indonesian translation is typically the first line that starts with " or just the first non-Arabic line if no quotes.
        // Let's just find the first line in currentLines that is Indonesian (has " or does not have Arabic characters).
        // Actually, just join them all except if it's English. But to be clean, let's just pick the Indonesian text.
        // Looking at data, it's often:
        // [Arabic]
        // "Indonesian"
        // "English"
        // (Source)
        // OR
        // Indonesian (no quotes)
        // "English"
        // (Source)
        
        let textIdn = "";
        for (const cl of currentLines) {
            // Very simple heuristic: if it has basic latin, we consider it. If we find multiple, take the first latin one as IDN.
            if (/[a-zA-Z]/.test(cl)) {
                textIdn = cl.replace(/^"|"$/g, '').replace(/^\* "\* "/g, '').replace(/^\* "|"\*$/g, '');
                break; // Take the first one which is usually Indonesian
            }
        }
        
        if (!textIdn && currentLines.length > 0) {
           textIdn = currentLines[currentLines.length - 1].replace(/^"|"$/g, '');
        }

        if (textIdn && source) {
            quotes.push({
                text: textIdn,
                source: source,
                category: currentCategory
            });
        }
        
        currentLines = [];
    } else {
        currentLines.push(line);
    }
}

// Fallback if parsing failed somehow
if (quotes.length === 0) {
    quotes.push({ text: "Keluarga adalah anugerah terindah.", source: "JannahFlow", category: "Keluarga" });
}

fs.writeFileSync(path.join(__dirname, '../src/db/quotes.json'), JSON.stringify(quotes, null, 2));
console.log(`Parsed ${quotes.length} quotes!`);

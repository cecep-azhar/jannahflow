const fs = require('fs');
const path = require('path');

const textPath = path.join(process.cwd(), "inspirasi.text");
const text = fs.readFileSync(textPath, "utf-8");
const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);

const parsedQuotes = [];
let currentLines = [];
let currentCategory = "Keluarga";

for (const line of lines) {
    if (line.includes("Mutiara Hikmah JannahFlow") || line.includes("Panduan Lengkap") || line.includes("Koleksi 360 Kutipan") || line.includes("Semoga bermanfaat")) {
        continue;
    }
    if (line.startsWith("Bagian")) {
        currentCategory = line.split(":")[1]?.split("(")[0]?.trim() || "Keluarga";
        continue;
    }
    
    if (line.startsWith("(") && line.endsWith(")")) {
        const source = line.slice(1, -1);
        let textIdn = "";
        
        for (const cl of currentLines) {
             if (/[a-zA-Z]/.test(cl)) {
                 textIdn = cl.replace(/^[\*\"\s]+|[\*\"\s]+$/g, '');
                 break;
             }
        }

        if (textIdn && source) {
            parsedQuotes.push({
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

fs.writeFileSync(path.join(process.cwd(), "src/db/quotes.json"), JSON.stringify(parsedQuotes, null, 2));
console.log(parsedQuotes.length);

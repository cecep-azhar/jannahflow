const fs = require('fs');
const path = require('path');

const textPath = path.join(process.cwd(), "inspirasi.text");
const text = fs.readFileSync(textPath, "utf-8");
const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);

const parsedQuotes = [];
let currentLines = [];
let currentCategory = "Keluarga";

for (const line of lines) {
    if (
        line.includes("Mutiara Hikmah JannahFlow") || 
        line.includes("Panduan Lengkap") || 
        line.includes("Koleksi 360 Kutipan") || 
        line.includes("Semoga bermanfaat") ||
        line.includes("Hingga Nomor 288 tetap mengikuti format kalimat lengkap") ||
        line.includes("Kutipan 304-360 dilanjutkan dengan uraian kalimat yang sama panjangnya dan tidak disingkat")
    ) {
        continue;
    }
    
    if (line.startsWith("Bagian")) {
        currentCategory = line.split(":")[1]?.split("(")[0]?.trim() || "Keluarga";
        continue;
    }
    
    // Some lines have the source at the end without a separate line
    let source = "";
    let isSourceLine = false;

    if (line.startsWith("(") && line.endsWith(")")) {
        source = line.slice(1, -1);
        isSourceLine = true;
    } else if (line.match(/\([^)]+\)$/)) {
        // Some lines might end with the source like " (HR. Muslim)"
        // But inspirasi.text seems to have them on separate lines mostly. Let's just stick to the main logic and adjust if needed
    }

    if (isSourceLine) {
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

const fileContent = `export const seedQuotes = ${JSON.stringify(parsedQuotes, null, 2)};\n`;
fs.writeFileSync(path.join(process.cwd(), "src/db/seed-quotes.ts"), fileContent, 'utf-8');
console.log("Successfully wrote " + parsedQuotes.length + " quotes to src/db/seed-quotes.ts");

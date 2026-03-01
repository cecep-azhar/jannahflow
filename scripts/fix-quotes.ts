import fs from "fs";

const data = JSON.parse(fs.readFileSync("src/db/quotes.json", "utf-8"));
data.forEach((q: any) => {
    // If category has ")", the text after it is usually the real Indonesian translation,
    // and the "text" field might be English.
    const match = q.category.match(/^(.*\([0-9-]+\))(.*)$/);
    if (match && match[2].trim()) {
        const cat = match[1].trim();
        let indText = match[2].trim();
        
        // Remove trailing * if any
        if (indText.endsWith("*") || indText.endsWith("\"") || indText.endsWith(".")) {
            indText = indText.replace(/[*".]+$/, "");
        }
        
        q.category = cat;
        q.text = indText + " (" + q.text + ")";
    }
});
fs.writeFileSync("src/db/quotes.json", JSON.stringify(data, null, 2));
console.log("Quotes fixed!");

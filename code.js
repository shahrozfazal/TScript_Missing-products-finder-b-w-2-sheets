// npm install csv-parser
const fs = require("fs");
const csv = require("csv-parser");

const sheet1File = "sheet1.csv";
const sheet2File = "sheet2.csv";
const key = "Name";

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

async function findMissing() {
  try {
    const sheet1 = await readCSV(sheet1File);
    const sheet2 = await readCSV(sheet2File);

    // Convert sheet2 Names to Set (ignore blanks)
    const sheet2Names = new Set(
      sheet2
        .map((item) => (item[key] ? item[key].trim().toLowerCase() : null))
        .filter(Boolean)
    );

    // Filter valid rows from sheet1 not in sheet2
    const missing = sheet1.filter((item) => {
      if (!item[key]) return false; // skip if missing Name
      const name = item[key].trim().toLowerCase();
      return !sheet2Names.has(name);
    });

    console.log(`✅ Found ${missing.length} products missing in Sheet2.`);
    console.table(missing.map((m) => ({ Name: m[key] })));

    // Write missing to new CSV
    const output = "Name\n" + missing.map((m) => m[key]).join("\n");
    fs.writeFileSync("missing.csv", output);
    console.log("💾 Saved to missing.csv");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

findMissing();

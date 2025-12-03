const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// 1. Load service account key
const serviceAccount = require("./serviceKey.json");

// 2. Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 3. Baca file JSON
const dataPath = path.join(__dirname, "accounts.json");
const raw = fs.readFileSync(dataPath, "utf8");
const accounts = JSON.parse(raw);

async function seed() {
  console.log(`Seeding ${accounts.length} accounts...`);

  const batchSize = 400; // Firestore max 500 per batch

  for (let i = 0; i < accounts.length; i += batchSize) {
    const slice = accounts.slice(i, i + batchSize);
    const batch = db.batch();

    slice.forEach((acc) => {
      // Dokumen id: pakai field acc.id
      const docRef = db.collection("accounts").doc(acc.id);
      batch.set(docRef, acc, { merge: true });
    });

    await batch.commit();
    console.log(`Batch ${i / batchSize + 1} committed (${slice.length} docs)`);
  }

  console.log("Done seeding accounts ✅");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding:", err);
    process.exit(1);
  });

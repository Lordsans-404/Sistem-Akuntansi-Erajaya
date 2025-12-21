const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (assuming credentials are set up in environment or standard path)
// Note: This script assumes it's being run in an environment where firebase-admin is initialized 
// or available via the app's lib. Since I can't easily import from the app's lib in a standalone script 
// without ts-node and path mapping, I'll try to use a simplified approach or ask the user to run it.

// Actually, better to create a small Next.js API route that I can call, 
// or just modify the existing close-books action to log this info temporarily?
// No, I can write a script that imports from the project if I run it with `bun` or `ts-node`.
// The user is using 'bun'.

import { db } from "@/lib/firebaseAdmin"; // Adjust path as needed

async function checkSchema() {
    try {
        console.log("Checking 'accounts' categories...");
        const accountsSnap = await db.collection('accounts').limit(20).get();
        const accountCategories = new Set();
        accountsSnap.forEach(doc => {
            const data = doc.data();
            if (data.category) accountCategories.add(data.category);
        });
        console.log("Account Categories:", Array.from(accountCategories));

        console.log("\nChecking 'journal_accounts' categories...");
        const jaSnap = await db.collection('journal_accounts').limit(20).get();
        const jaCategories = new Set();
        jaSnap.forEach(doc => {
            const data = doc.data();
            if (data.category) jaCategories.add(data.category);
        });
        console.log("Journal Account Categories:", Array.from(jaCategories));

    } catch (error) {
        console.error("Error:", error);
    }
}

// checkSchema();

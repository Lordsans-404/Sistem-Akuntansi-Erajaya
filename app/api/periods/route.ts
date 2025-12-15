import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

/**
 * Handler GET untuk Mengambil Data Periode Akuntansi
 * 
 * Tujuan:
 * Mengambil daftar periode akuntansi yang tersedia dari koleksi "periods" di Firestore.
 * Data diurutkan berdasarkan tanggal akhir periode (`endDate`) secara descending (terbaru dulu).
 * 
 * Cara Kerja (Logika):
 * 1. Membuat referensi ke koleksi "periods" menggunakan SDK Admin (`db`).
 * 2. Mengurutkan hasil berdasarkan field `endDate` descending.
 * 3. Mengambil snapshot data (`get()`).
 * 4. Mapping dokumen hasil query ke array objek.
 * 5. Mengembalikan data dalam format JSON.
 */
export async function GET() {
	try {
		const snapshot = await db.collection('periods').orderBy('endDate', 'desc').get();
		const periods = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		return NextResponse.json(periods);
	}
	catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

}
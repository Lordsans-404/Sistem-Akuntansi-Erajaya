import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from 'firebase/firestore';

/**
 * Handler GET untuk Mengambil Data Akun Berdasarkan Kategori
 * 
 * Tujuan:
 * Mengambil daftar akun dari koleksi "accounts" di Firestore yang sesuai dengan kategori tertentu.
 * Endpoint ini bersifat dinamis berdasarkan parameter URL `[category]`.
 * 
 * Parameter URL (Dynamic Route):
 * - category: Nama kategori akun yang ingin diambil (contoh: "asset", "liability").
 * 
 * Cara Kerja (Logika):
 * 1. Mengakses parameter `category` dari `context.params`.
 * 2. Membuat referensi ke koleksi "accounts" di Firestore.
 * 3. Membuat query untuk memfilter dokumen dimana field `category` cocok dengan parameter URL.
 * 4. Eksekusi query (`getDocs`) untuk mendapatkan snapshot.
 * 5. Mapping hasil snapshot ke format JSON object.
 * 6. Mengembalikan response array akun.
 */
export async function GET(
	request: NextRequest,
	context: { params: Promise<{ category: string }> }
) {
	try {
		const { category } = await context.params;
		const accountRef = collection(db, 'accounts');
		const qAcc = query(accountRef, where('category', '==', category));

		const snapAcc = await getDocs(qAcc);
		const data = snapAcc.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		} as any));
		return NextResponse.json(data);
	}
	catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

}
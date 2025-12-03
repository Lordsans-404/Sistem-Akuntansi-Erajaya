import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET() {
	try {
		const snapshot = await db.collection('periods').orderBy('endDate', 'desc').get();
		const periods = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		return NextResponse.json(periods);
	}
	catch(error){
		console.error(error);
		return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
	}
   
}
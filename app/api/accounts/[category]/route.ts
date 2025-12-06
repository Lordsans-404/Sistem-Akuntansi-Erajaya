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

export async function GET(
	request : NextRequest,
	context : {params : Promise<{category : string}>}
) {
	try {
		const { category } = await context.params;
		const accountRef = collection(db,'accounts');
		const qAcc = query(accountRef,where('category', '==', category));

		const snapAcc = await getDocs(qAcc);
		const data = snapAcc.docs.map((doc) => ({
			id : doc.id,
			...doc.data()
		} as any));
		return NextResponse.json(data);
	}
	catch(error){
		console.error(error);
		return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
	}
   
}
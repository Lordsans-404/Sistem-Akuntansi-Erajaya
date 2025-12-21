import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

/**
 * Handler GET untuk Transaksi Jurnal
 * 
 * Tujuan:
 * Mengambil daftar transaksi jurnal dari koleksi "journals" di Firestore.
 * Mendukung filter rentang tanggal melalui query parameter.
 * 
 * Parameter Query:
 * - start_date (opsional): Filter jurnal dimulai dari tanggal ini (YYYY-MM-DD).
 * - end_date (opsional): Filter jurnal sampai tanggal ini (YYYY-MM-DD).
 * 
 * Cara Kerja (Logika):
 * 1. Mengambil parameter query (`start_date`, `end_date`) dari URL.
 * 2. Membuat query dasar ke Firestore koleksi "journals", diurutkan berdasarkan `date` (terbaru ke terlama).
 * 3. Jika `start_date` ada, tambahkan filter `where` untuk mengambil data >= tanggal tersebut.
 * 4. Jika `end_date` ada, tambahkan filter `where` untuk mengambil data <= tanggal tersebut.
 * 5. Eksekusi query (`query.get()`) untuk mendapatkan snapshot dokumen.
 * 6. Mapping hasil snapshot ke format JSON:
 *    - Mengubah `Timestamp` Firestore pada field `date` dan `created_at` menjadi string ISO agar mudah dibaca client.
 * 7. Mengembalikan response JSON berisi array jurnal.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = db.collection("journals").orderBy("created_at", "desc");

    if (startDate) {
      const start = Timestamp.fromDate(new Date(startDate));
      query = query.where("date", ">=", start);
    }

    if (endDate) {
      const end = Timestamp.fromDate(new Date(endDate));
      query = query.where("date", "<=", end);
    }

    const snapshot = await query.get();

    const journals = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: (data.date as Timestamp).toDate().toISOString(),
        created_at: (data.created_at as Timestamp)?.toDate().toISOString() || null,
      };
    });

    return NextResponse.json(journals);
  } catch (err) {
    console.error("Error fetching journals:", err);
    return NextResponse.json(
      { error: "Failed to fetch journals" },
      { status: 500 }
    );
  }
}

/**
 * Handler POST untuk Membuat Transaksi Jurnal Baru
 * 
 * Tujuan:
 * Membuat dokumen transaksi jurnal baru di Firestore.
 * Melakukan validasi untuk memastikan integritas data dan keseimbangan akuntansi (Jurnal Seimbang: Debit == Kredit).
 * 
 * Struktur Payload (Body Request):
 * - date (string): Tanggal transaksi.
 * - description (string): Keterangan/deskripsi transaksi.
 * - period (string): Identifier periode akuntansi (YYYY-MM).
 * - entries (array): Daftar akun yang terlibat (debit/kredit).
 * 
 * Cara Kerja (Logika):
 * 1. Menerima data JSON dari request body.
 * 2. **Validasi Dasar**: Memastikan kolom wajib (`date`, `description`, `entries`) terisi dan `entries` minimal ada 2 baris.
 * 3. Mengkonversi `date` string menjadi Firestore `Timestamp`.
 * 4. **Normalisasi & Hitung Total**:
 *    - Mengiterasi setiap item di `entries`.
 *    - Menjumlahkan total Debit dan Total Kredit.
 *    - (Opsional) Memastikan satu baris tidak memiliki Debit DAN Kredit sekaligus.
 * 5. **Cek Keseimbangan**: Memastikan `Total Debit == Total Kredit`. Jika selisih, kembalikan error 400.
 * 6. **Simpan**: Jika valid, simpan object jurnal ke Firestore koleksi "journals" dengan status "draft".
 * 7. Mengembalikan ID dokumen yang baru dibuat.
 */
export async function POST(request: NextRequest) {
  const password = process.env.PASSWORD_;

  try {
    const body = await request.json();
    const { date, description, entries, period, pass } = body;

    if (pass != password) {
      return NextResponse.json(
        { error: "Wrong Password" },
        { status: 401 }
      );
    }

    if (!date || !description || !Array.isArray(entries) || entries.length < 2) {
      return NextResponse.json(
        { error: "Invalid journal payload" },
        { status: 400 }
      );
    }

    const journalDate = Timestamp.fromDate(new Date(date));

    let totalDebit = 0;
    let totalCredit = 0;

    const normalizedEntries = entries.map((e: any) => {
      const debit = Number(e.debit) || 0;
      const credit = Number(e.credit) || 0;

      if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
        throw new Error("Invalid journal entry");
      }

      totalDebit += debit;
      totalCredit += credit;

      return {
        account: e.account,
        debit,
        credit
      };
    });

    if (totalDebit !== totalCredit) {
      return NextResponse.json(
        { error: "Journal not balanced" },
        { status: 400 }
      );
    }

    const journal = {
      date: journalDate,
      period, // HARUS YYYY-MM-DD
      description,
      entries: normalizedEntries,
      status: "draft",
      total_debit: totalDebit,
      total_credit: totalCredit,
      created_at: FieldValue.serverTimestamp(),
      posted_at: null
    };

    const ref = await db.collection("journals").add(journal);

    return NextResponse.json(
      { id: ref.id },
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create journal" },
      { status: 500 }
    );
  }
}

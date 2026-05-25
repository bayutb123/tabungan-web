# Tracker Tabungan

Aplikasi web untuk mencatat target tabungan pribadi secara manual (bukan fintech, bukan penyimpanan uang sungguhan, tanpa integrasi bank).

## Tech Stack
- Next.js App Router + TypeScript
- React
- Tailwind CSS
- Firebase Authentication (Google Sign-In)
- Cloud Firestore

## Setup Firebase
1. Buat project di Firebase Console.
2. Aktifkan **Authentication > Sign-in method > Google**.
3. Buat database **Cloud Firestore**.
4. Tambah **Web App** lalu salin konfigurasi env.
5. Copy `.env.local.example` menjadi `.env.local` lalu isi value.
6. Publish `firestore.rules` ke project Firebase.

## Jalankan Lokal
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Firestore Indexes
Untuk query `savingGoals` berdasarkan `status` + `updatedAt`, Firestore mungkin meminta composite index:
- Collection: `users/{uid}/savingGoals`
- Fields: `status` (Ascending), `updatedAt` (Descending)

## Catatan MVP
- Semua nominal disimpan sebagai integer IDR.
- 1 akun Google = 1 user.
- Semua data dipisahkan per `uid` pengguna.
- Aplikasi ini hanya pencatatan manual, bukan aplikasi transaksi uang nyata.

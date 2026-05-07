# Ringkasan Perbaikan Backend

## Issue Terkait

GitHub issue utama berada di repo mobile:

```text
https://github.com/mardinajalah/catatan-keuangan/issues/13
```

Backend ikut diperbarui karena login/register mobile membutuhkan endpoint `POST /api/auth/sync-profile` di backend Vercel.

## Masalah yang Diperbaiki

### 1. Error Sync Profile Sulit Dideteksi

Sebelumnya jika `sync-profile` gagal di backend, response hanya:

```json
{
  "message": "Terjadi kesalahan pada server"
}
```

Pesan ini terlalu umum dan tidak membantu membedakan apakah masalahnya berasal dari:

- token Firebase invalid
- Firebase Admin credential di Vercel belum benar
- Firestore write gagal

Perbaikan:

- Logging `sync-profile` dibuat lebih aman dan informatif.
- Response error sekarang memberi arah masalah:

```json
{
  "message": "Gagal sinkron profile ke backend. Periksa konfigurasi Firebase Admin di Vercel."
}
```

File terkait:

- `src/controllers/auth.controller.ts`

### 2. Firebase Auth Error Logging Lebih Aman

Sebelumnya error verify Firebase ID token dicetak langsung. Sekarang log hanya menyimpan informasi aman:

- pesan error
- apakah authorization header tersedia

Tidak ada full bearer token atau private key yang dicetak.

File terkait:

- `src/middlewares/auth.middleware.ts`

### 3. Debug Endpoint Firebase Admin Non-Secret

Ditambahkan endpoint:

```http
GET /api/debug/firebase
```

Response:

```json
{
  "projectIdConfigured": true,
  "clientEmailConfigured": true,
  "privateKeyConfigured": true,
  "usingApplicationDefault": false
}
```

Endpoint ini membantu mengecek apakah environment variable Firebase Admin terbaca di Vercel tanpa membocorkan secret.

File terkait:

- `src/app.ts`
- `src/utils/firebase.ts`

### 4. Warning Saat Credential Firebase Admin Tidak Lengkap

Jika `FIREBASE_CLIENT_EMAIL` atau `FIREBASE_PRIVATE_KEY` tidak tersedia, backend akan memberi warning dan fallback ke Application Default Credentials.

Ini membantu diagnosis saat deployment Vercel belum memiliki env Firebase Admin yang benar.

File terkait:

- `src/utils/firebase.ts`

## Verifikasi

Perintah yang sudah dijalankan:

```bash
npm.cmd run build
```

Hasil:

```text
berhasil
```

Smoke test lokal:

```bash
node -e "require('./dist/index.js'); setTimeout(() => process.exit(0), 1000)"
```

Hasil:

```text
Server is running on port 5000 at 0.0.0.0
```

## Catatan Deployment Vercel

Pastikan environment variable berikut ada di Vercel:

```env
FIREBASE_PROJECT_ID=catatan-keuangan-985ec
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

Setelah deploy, cek:

```text
https://api-catatan-keuangan.vercel.app/api/health
https://api-catatan-keuangan.vercel.app/api/debug/firebase
```

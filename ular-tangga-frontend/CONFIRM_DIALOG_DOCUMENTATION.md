# Dokumentasi ConfirmDialog

## Gambaran Umum
ConfirmDialog adalah komponen React yang menyediakan dialog konfirmasi yang dapat dikustomisasi untuk menggantikan `window.confirm()` bawaan browser. Komponen ini menggunakan animasi Framer Motion dan styling yang konsisten dengan desain sistem UI.

## Fitur Utama
- **Animasi Smooth**: Menggunakan Framer Motion untuk entrance/exit animations
- **Customizable**: Title, message, button text, dan type dapat dikustomisasi
- **Type Support**: success, warning, danger, info dengan warna yang sesuai
- **Responsive**: Tampilan yang baik di semua ukuran layar
- **Keyboard Support**: ESC key untuk cancel
- **Promise-based**: Menggunakan async/await pattern

## Struktur Komponen

### ConfirmDialog.jsx
```jsx
// Komponen utama dialog dengan styling dan animasi
// Props: isOpen, onConfirm, onCancel, title, message, confirmText, cancelText, type
```

### useConfirm Hook
```jsx
// Custom hook yang menyediakan confirm function dan ConfirmProvider
// Returns: { confirm, ConfirmProvider }
```

## Cara Penggunaan

### 1. Import dan Setup
```jsx
import { useConfirm } from '../../../components';

const MyComponent = () => {
  const { confirm, ConfirmProvider } = useConfirm();
  
  return (
    <ConfirmProvider>
      {/* Komponen Anda */}
    </ConfirmProvider>
  );
};
```

### 2. Menggunakan Confirm Dialog
```jsx
const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Hapus Item',
    message: 'Apakah Anda yakin ingin menghapus item ini?',
    confirmText: 'Ya, Hapus',
    cancelText: 'Batal',
    type: 'danger'
  });

  if (confirmed) {
    // Lakukan aksi delete
  }
};
```

## Konfigurasi Options

### title (string)
Judul dialog yang ditampilkan di header.

### message (string)
Pesan konfirmasi yang ditampilkan di body dialog.

### confirmText (string, default: 'Ya')
Text untuk tombol konfirmasi.

### cancelText (string, default: 'Batal')
Text untuk tombol cancel.

### type (string, default: 'info')
Tipe dialog yang menentukan warna:
- **success**: Hijau - untuk aksi positif
- **warning**: Kuning - untuk peringatan
- **danger**: Merah - untuk aksi berbahaya (delete, remove)
- **info**: Biru - untuk informasi umum

## Implementasi di UsersTab

### Before (Browser Confirm)
```jsx
const handleDeleteUser = async (id) => {
  if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
    return;
  }
  // ... delete logic
};
```

### After (Custom ConfirmDialog)
```jsx
const handleDeleteUser = async (user) => {
  const confirmed = await confirm({
    title: 'Hapus User',
    message: `Apakah Anda yakin ingin menghapus user "${user.name}"? Tindakan ini tidak dapat dibatalkan.`,
    confirmText: 'Ya, Hapus',
    cancelText: 'Batal',
    type: 'danger'
  });

  if (!confirmed) return;
  
  // ... delete logic
};
```

## Keuntungan vs window.confirm()

### ✅ Custom ConfirmDialog
- Styling yang konsisten dengan design system
- Animasi yang smooth dan modern
- Customizable text dan type
- Better UX dengan warna yang sesuai konteks
- Responsive design
- Dapat menampilkan informasi lebih detail

### ❌ window.confirm()
- Tampilan browser default yang tidak bisa dikustomisasi
- Tidak responsive
- Tidak ada animasi
- Terbatas pada text sederhana
- Tidak konsisten dengan design system

## Best Practices

1. **Gunakan type yang sesuai**: 
   - `danger` untuk delete/remove actions
   - `warning` untuk aksi yang tidak bisa dibatalkan
   - `success` untuk konfirmasi aksi positif
   - `info` untuk konfirmasi umum

2. **Berikan konteks yang jelas**:
   - Sertakan nama item yang akan dihapus
   - Jelaskan konsekuensi dari aksi tersebut

3. **Text yang jelas**:
   - Gunakan action words yang spesifik ("Ya, Hapus" vs "OK")
   - Avoid generic text seperti "Yes/No"

4. **Provider Placement**:
   - Letakkan ConfirmProvider di level yang tepat
   - Jangan nest terlalu dalam untuk performance

## File Structure
```
components/
  ui/
    ConfirmDialog.jsx       # Komponen dialog utama
    index.js               # Export ConfirmDialog dan useConfirm
pages/
  admin/
    tabs/
      UsersTab.jsx         # Implementasi confirm dialog
```

## Dependencies
- React 18+
- Framer Motion
- Tailwind CSS
- Lucide React (untuk icons)
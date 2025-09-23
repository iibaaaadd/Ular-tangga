# Dashboard Structure Documentation

## 📁 Struktur File Dashboard yang Telah Direfactor

Struktur dashboard telah dipecah menjadi komponen-komponen yang lebih terorganisir dan mudah dikelola:

### **Admin Dashboard**
```
src/pages/admin/
├── Dashboard.jsx                    # Main admin dashboard (simplified)
├── Dashboard.old.jsx               # Backup file lama
├── index.js                        # Export semua komponen
├── components/                     # Komponen reusable
│   ├── DashboardHeader.jsx         # Header dengan user info & logout
│   ├── TabNavigation.jsx           # Tab navigation component
│   └── TabContent.jsx              # Router untuk tab content
└── tabs/                          # Tab-specific components
    ├── OverviewTab.jsx            # Overview statistics
    ├── UsersTab.jsx               # User management (CRUD)
    ├── QuestionsTab.jsx           # Question bank wrapper
    └── AnalyticsTab.jsx           # Analytics charts
```

### **Teacher Dashboard**
```
src/pages/teacher/
└── Dashboard.jsx                   # Teacher dashboard
```

### **Student Dashboard**
```
src/pages/student/
└── Dashboard.jsx                   # Student dashboard
```

## 🎯 Keuntungan Struktur Baru

### 1. **Separation of Concerns**
- Setiap tab memiliki file sendiri
- Logic bisnis terpisah berdasarkan fungsi
- Komponen reusable untuk header dan navigasi

### 2. **Maintainability**
- Code lebih mudah dipahami dan dikelola
- Bug fixing lebih mudah karena scope terbatas
- Testing per komponen lebih focused

### 3. **Scalability**
- Mudah menambah tab baru
- Mudah menambah role dashboard baru
- Komponen dapat digunakan ulang

### 4. **Performance**
- Lazy loading bisa diterapkan per tab
- Bundle size lebih optimal
- Memory usage lebih efisien

## 📝 Cara Menggunakan

### **Menambah Tab Baru ke Admin Dashboard**

1. **Buat komponen tab baru:**
```jsx
// src/pages/admin/tabs/NewTab.jsx
import React from 'react';
import { motion } from 'motion/react';

const NewTab = () => {
  return (
    <motion.div
      key="new-tab"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Content goes here */}
    </motion.div>
  );
};

export default NewTab;
```

2. **Update TabContent.jsx:**
```jsx
// Import komponen baru
import NewTab from '../tabs/NewTab';

// Tambahkan case baru
case 'new-tab':
  return <NewTab />;
```

3. **Update Dashboard.jsx:**
```jsx
// Tambahkan tab baru ke array tabs
const tabs = [
  // ... existing tabs
  { id: 'new-tab', label: 'New Tab', icon: YourIcon }
];
```

### **Menambah Dashboard Role Baru**

1. **Buat folder baru:**
```
src/pages/new-role/
└── Dashboard.jsx
```

2. **Copy struktur dari dashboard yang sudah ada**
3. **Sesuaikan warna tema dan icon**
4. **Update routing di App.jsx**

## 🔧 Komponen Yang Tersedia

### **DashboardHeader**
Props:
- `user`: Object user yang sedang login
- `logout`: Function untuk logout

### **TabNavigation**
Props:
- `tabs`: Array tab configuration
- `activeTab`: Tab yang sedang aktif
- `onTabChange`: Function untuk ganti tab

### **TabContent**
Props:
- `activeTab`: Tab yang sedang aktif
- `totalUsers`: Total users untuk overview (optional)

## 🎨 Customization

### **Warna Tema Per Role:**
- **Admin**: Purple gradient (`from-purple-50 to-blue-50`)
- **Teacher**: Green gradient (`from-green-50 to-blue-50`)
- **Student**: Blue gradient (`from-blue-50 to-purple-50`)

### **Icon Mapping:**
- **Admin**: 👑
- **Teacher**: 👨‍🏫
- **Student**: 👨‍🎓

## 🚀 Next Steps

1. **Implementasi Teacher Dashboard** dengan fitur:
   - Kelola soal pribadi
   - Monitor siswa
   - Statistik kelas

2. **Implementasi Student Dashboard** dengan fitur:
   - Join game room
   - Lihat achievement
   - Statistik personal

3. **Lazy Loading** untuk optimasi performa

4. **State Management** dengan Context/Redux untuk sharing data

5. **Real-time Updates** dengan WebSocket

## 📊 File Size Comparison

| Sebelum Refactor | Setelah Refactor |
|------------------|------------------|
| Dashboard.jsx: ~550 lines | Dashboard.jsx: ~50 lines |
| 1 file monolitik | 7+ files terstruktur |
| Hard to maintain | Easy to maintain |

---

**Happy Coding! 🚀**
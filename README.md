# 🐍 Ular Tangga Game - Full Stack Application

Aplikasi game Ular Tangga berbasis web dengan sistem role-based authentication dan manajemen soal yang komprehensif.

## 🚀 Tech Stack

### Backend (Laravel 11)
- **Framework**: Laravel 11
- **Database**: SQLite (default), bisa diganti ke MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **API**: RESTful API
- **PHP Version**: >= 8.2

### Frontend (React + Vite)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Motion (Framer Motion)
- **State Management**: Context API
- **HTTP Client**: Axios

## 📋 Features

### 🔐 Authentication System
- **Role-based Access Control** (Admin, Teacher, Student)
- **Secure Registration** (Students only for public registration)
- **JWT Token Authentication**
- **Protected Routes**

### 👑 Admin Dashboard
- **User Management** dengan pagination dan search
- **CRUD Operations** untuk semua user roles
- **System Analytics** dan statistics
- **Bank Soal Management** dengan tipe soal berbeda:
  - Multiple Choice
  - Essay (dengan kata kunci dan sample jawaban)
  - True/False (dengan penjelasan)

### 👨‍🏫 Teacher Dashboard
- **Room Management** untuk kelas
- **Question Creation** dan management
- **Game History** dan monitoring
- **Student Progress** tracking

### 👨‍🎓 Student Dashboard
- **Join Game Room** dengan kode
- **Game History** dan achievements
- **Leaderboard** dan progress tracking
- **Profile Management**

### 🎯 Game Features
- **Interactive UI** dengan smooth animations
- **Responsive Design** untuk semua device
- **Real-time Updates**
- **Progressive Web App** ready

## 🛠️ Installation & Setup

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- XAMPP/WAMP/LAMP (untuk development)

### Backend Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/iibaaaadd/Ular-tangga.git
   cd Ular-tangga/ular-tangga-backend
   ```

2. **Install Dependencies**
   ```bash
   composer install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database Setup**
   ```bash
   php artisan migrate:fresh --seed
   ```

5. **Start Server**
   ```bash
   php artisan serve
   ```
   Server will run at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd ../ular-tangga-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Frontend will run at `http://localhost:5173`

## 🔑 Default Login Credentials

Setelah running seeder, gunakan kredensial berikut untuk testing:

### Admin Access
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Role**: Admin (full access)

### Teacher Access
- **Email**: `teacher@example.com`
- **Password**: `password123`
- **Role**: Teacher (classroom management)

### Student Access
- **Email**: `john@example.com`, `jane@example.com`, `bob@example.com`
- **Password**: `password123`
- **Role**: Student (game participation)

## 📁 Project Structure

```
Ular-tangga/
├── ular-tangga-backend/          # Laravel Backend API
│   ├── app/
│   │   ├── Http/Controllers/     # API Controllers
│   │   ├── Models/              # Eloquent Models
│   │   └── Providers/           # Service Providers
│   ├── database/
│   │   ├── migrations/          # Database Migrations
│   │   └── seeders/             # Database Seeders
│   ├── routes/
│   │   └── api.php              # API Routes
│   └── config/                  # Laravel Configuration
│
├── ular-tangga-frontend/         # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable Components
│   │   │   ├── ui/              # UI Components (Button, Modal, etc.)
│   │   │   └── QuestionBank.jsx # Question Management
│   │   ├── context/             # React Context (Auth)
│   │   ├── pages/               # Page Components
│   │   │   ├── admin/           # Admin Pages
│   │   │   ├── teacher/         # Teacher Pages
│   │   │   └── student/         # Student Pages
│   │   ├── services/            # API Services
│   │   └── main.jsx             # App Entry Point
│   ├── public/                  # Static Assets
│   └── package.json             # Dependencies
│
└── TEST_CREDENTIALS.md          # Login Credentials
```

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - Student registration
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Admin User Management
- `GET /api/admin/users` - Get all users (paginated)
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users/{id}` - Get specific user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

## 🎨 UI/UX Features

- **🎭 Smooth Animations** dengan Motion/Framer Motion
- **📱 Responsive Design** untuk mobile dan desktop
- **🎨 Modern UI** dengan Tailwind CSS
- **⚡ Fast Loading** dengan Vite build optimization
- **🔄 Loading States** dan error handling
- **🎯 Interactive Elements** dengan hover effects

## 🛡️ Security Features

- **🔐 JWT Authentication** dengan Laravel Sanctum
- **🛡️ Role-based Authorization**
- **🔒 Password Hashing** dengan bcrypt
- **🚫 CORS Protection**
- **✅ Input Validation** di backend dan frontend

## 🚀 Deployment

### Backend (Laravel)
1. Set up production server (Apache/Nginx)
2. Configure database (MySQL/PostgreSQL)
3. Update `.env` untuk production
4. Run `composer install --optimize-autoloader --no-dev`
5. Run `php artisan migrate --force`

### Frontend (React)
1. Build for production: `npm run build`
2. Deploy dist folder ke web server
3. Configure server untuk SPA routing

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

Dikembangkan dengan ❤️ oleh [iibaaaadd](https://github.com/iibaaaadd)

---

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat [GitHub Issue](https://github.com/iibaaaadd/Ular-tangga/issues) atau hubungi developer.

**Happy Gaming! 🎮🐍**
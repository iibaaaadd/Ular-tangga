# Test User Credentials

## Admin User
- Email: admin@example.com
- Password: password123
- Role: admin

## Teacher User
- Email: teacher@example.com  
- Password: password123
- Role: teacher

## Student Users
- Email: john@example.com
- Password: password123
- Role: student

- Email: jane@example.com
- Password: password123
- Role: student

- Email: bob@example.com
- Password: password123
- Role: student

## Random Users
Terdapat 10 user tambahan yang dibuat secara random dengan password default dari factory.

## Testing
1. Start backend: `cd ular-tangga-backend && php artisan serve`
2. Start frontend: `cd ular-tangga-frontend && npm run dev`
3. Open browser: http://localhost:5174
4. Login dengan salah satu kredensial di atas
5. Test CRUD functionality untuk user management (admin only)

## Features
- Role-based dashboard (Admin, Teacher, Student)
- Dynamic user table with real Laravel API
- CRUD operations for user management
- Smooth scrolling and responsive design
- Loading states and error handling
- Motion/Framer animations
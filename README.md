Hotel Booking Backend

A scalable and production-ready REST API for a hotel booking system built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM**.

---

## 🚀 Features

- 🔐 Authentication & Authorization (JWT + Cookies)
- 👥 Role-based access (ADMIN / CUSTOMER)
- 🏨 Room management system
- 📅 Booking system
- 💳 Payment integration (Stripe)
- ☁️ Cloudinary image upload
- 📊 Dashboard statistics
- 📧 Email system (Nodemailer + EJS)
- ✅ Request validation (Zod)
- ⚡ Optimized query system (filter, search, pagination)

---

## 🧰 Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Zod**
- **JWT**
- **Stripe**
- **Cloudinary**
- **Nodemailer**

---

## 📁 Project Structure


├── app/
│ ├── config/ # Environment & DB configuration
│ ├── middlewares/ # Auth, Error handling, Validation
│ ├── modules/ # Business logic (Routes, Controllers, Services)
│ ├── routes/ # Centralized routing
│ └── utils/ # Helpers (sendResponse, catchAsync)
├── prisma/ # Database schema & migrations
└── server.ts # Entry point


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/hotel-booking-backend.git
cd hotel-booking-backend
2️⃣ Install dependencies
pnpm install

or

npm install
3️⃣ Environment Setup

Create a .env file in the root directory:

PORT=5000
DATABASE_URL=your_postgresql_url

ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret

ACCESS_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d

STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_key

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

FRONTEND_URL=http://localhost:3000
4️⃣ Database Migration
npx prisma generate
npx prisma migrate dev
5️⃣ Run the server
pnpm dev
🔗 API Endpoints (Quick View)
Category	Endpoint	Method	Description
Auth	/api/v1/auth/login	POST	User login
Auth	/api/v1/auth/register	POST	User registration
Rooms	/api/v1/rooms	GET	Get all rooms
Rooms	/api/v1/rooms/:id	GET	Get single room
Rooms	/api/v1/rooms/create-room	POST	Add new room (Admin)
Bookings	/api/v1/bookings	POST	Book a room
Bookings	/api/v1/bookings/my-bookings	GET	Get user bookings
Admin	/api/v1/bookings	GET	View all bookings
🔐 Authentication System
JWT + Cookie-based authentication
Access Token & Refresh Token
Role-based authorization
Roles
ADMIN
CUSTOMER
🗄️ Database
PostgreSQL database
Prisma ORM
Core Models
User
Customer
Room
Booking
Payment
Amenity
BedType
RoomCategory
ExtraService
📊 Features Overview
👤 Customer
Register & login
Browse rooms
Book rooms
View bookings
Payment flow
🛠️ Admin
Manage rooms
Manage bookings
Manage users
View dashboard stats
📌 Available Scripts
pnpm dev              # Start development server (hot reload)
pnpm build            # Build for production
pnpm start            # Run production build
pnpm prisma:migrate   # Run database migration
⚠️ Error Handling
Centralized error handler
Zod validation errors
Prisma errors
Authentication errors
🚧 Future Improvements
⭐ Reviews & ratings system
❤️ Wishlist / favorites
🎟️ Coupon system
🔄 Booking cancellation
📄 PDF invoice generation
📧 Email automation
📊 Advanced analytics
👨‍💻 Author

Osman Goni
Full Stack Developer

🌍 Live Demo

Frontend: https://hotel-booking-frontend-copy.vercel.app/

Backend: https://14-hotel-booking-backend.vercel.app/

# 🎬 Cinema Booking System (Go + Redis)

A simple high-concurrency cinema seat booking system built with **Go** and **Redis**, designed to demonstrate **race condition handling** and **atomic seat reservation**.

---

## 🚀 Features

- 🎟️ Book cinema seats (concurrent-safe)
- ⚡ Handles high concurrency (100k+ requests simulation)
- 🔒 Prevents double booking using Redis (`SET NX`)
- ⏳ Temporary seat hold with TTL
- 🌐 Simple HTTP server (Go standard library)
- 📦 Docker support (Redis + Redis Commander)

---

## 🧱 Tech Stack

- **Go (Golang)**
- **Redis**
- **Docker / Docker Compose**
- **net/http**

---

## 📂 Project Structure

├── cmd/ # entrypoint (main.go)
├── internal/
│ ├── booking/ # domain logic
│ └── adapters/
│ └── redis/ # Redis implementation
├── static/ # frontend files
├── docker-compose.yml
└── README.md

---

## ⚙️ How It Works

### 🧠 Seat Booking Logic

When a user tries to book a seat:

1. Generate unique booking ID
2. Try to reserve seat in Redis:

3. Result:
   - ✅ Success → seat is reserved
   - ❌ Fail → seat already taken

---

## 🔐 Why It Works

- `NX` = only set if key does NOT exist
- Redis guarantees atomic operation
- Prevents race conditions even with high concurrency

---

## 🧪 Concurrency Test

Run: go test ./… -v -race

Expected result:

- ✅ 1 success
- ❌ 99,999 failures

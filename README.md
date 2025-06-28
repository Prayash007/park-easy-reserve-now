# 🚗 Smart Parking Lot System

A real-time, full-stack parking reservation web application that enables users to view, book, and manage parking spots efficiently using **Supabase**, **React**, and **Tailwind CSS**. It offers live updates on availability and empowers authenticated users to make bookings, cancel reservations, and interact with a responsive UI.

---

## 📸 Preview

![App Preview](https://park-easy-reserve-now.vercel.app/)  

---

## ✨ Features

- 🔐 **Authentication** – Secure login/logout with Supabase Auth.
- 🗺️ **Location-Based Layouts** – Dynamically renders parking spots per location.
- ✅ **Real-Time Spot Updates** – Auto-refreshes UI via Supabase Realtime.
- 💳 **Spot Booking** – Reserve any available parking slot with a single click.
- ❌ **Booking Cancellation** – Cancel your own reservation anytime.
- 🧠 **Responsive UI** – Tailwind CSS for seamless cross-device experience.
- 🌈 **Status Visualization**:
  - 🟢 Available
  - 🔴 Occupied
  - 🔵 Booked by You
  - 🟡 Currently Selected

---

## 📦 Tech Stack

| Frontend      | Backend / DB     | Realtime | Styling        |
| ------------- | ---------------- | -------- | -------------- |
| React + Vite  | Supabase (PostgreSQL) | Supabase Channels | Tailwind CSS |

---

## 🧠 How It Works

1. **Users log in** using secure Supabase Auth.
2. On selecting a location, parking layout is dynamically generated.
3. Clicking a spot:
   - ✅ Available → Select for booking.
   - 🔵 Booked by you → Option to cancel.
   - 🔴 Occupied → Not clickable.
4. All actions are synced in real-time with other users via Supabase Realtime channels.

---

## 🏗️ Project Structure (Highlights)

```

src/
│
├── components/
│   └── ui/               # Reusable Tailwind + ShadCN UI components
├── contexts/
│   └── AuthContext.tsx   # User auth context
├── hooks/
│   └── use-toast.ts      # Toast for success/error feedback
├── integrations/
│   └── supabase/client.ts# Supabase initialization
├── pages/
│   └── ParkingLot.tsx    # Main parking logic & rendering

````

---

## 🔧 Local Setup

1. **Clone this repo**
   ```bash
   git clone https://github.com/your-username/smart-parking.git
   cd smart-parking
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Supabase**

   * Create a project on [Supabase](https://supabase.com)
   * Copy your credentials to `.env`:

     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Start development server**

   ```bash
   npm run dev
   ```

---

## 🧪 Database Schema (Supabase)

### `parking_locations`

| Column           | Type    |
| ---------------- | ------- |
| id               | UUID    |
| name             | Text    |
| price\_per\_hour | Numeric |
| rows             | Integer |
| spots\_per\_row  | Integer |
| total\_spots     | Integer |

### `parking_spots`

| Column         | Type           |
| -------------- | -------------- |
| id             | UUID           |
| location\_id   | UUID (FK)      |
| spot\_number   | Integer        |
| is\_occupied   | Boolean        |
| booked\_by     | UUID (User ID) |
| booking\_start | Timestamp      |
| updated\_at    | Timestamp      |

---

## 🔒 Authentication & Access

* Only **logged-in users** can:

  * Book or cancel spots.
  * View their bookings.
* Unauthorized users are **redirected to login** (handled via `AuthContext`).

---

## 🎯 Future Enhancements

* 📅 Add start/end time slot selection.
* 🧾 Generate booking receipts.
* 📊 Admin dashboard for managing locations.
* 🔔 Notifications for session expiry.


## 💬 Feedback or Contributions?

Raise an issue or PR on [GitHub](https://github.com/your-username/smart-parking)!

```

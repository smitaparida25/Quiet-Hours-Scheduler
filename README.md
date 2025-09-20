# Quiet-Hours-Scheduler
A web app where authenticated users can schedule silent study blocks. Each user receives an email notification 10 minutes before their block begins.

🚀 Tech Stack

Next.js (frontend + API routes)

Supabase Auth (user authentication)

MongoDB Atlas (data persistence)

Supabase Functions / Vercel CRON Jobs (scheduled tasks)

Email: Supabase SMTP or Nodemailer

✨ Features

🔑 Authentication – Secure login via Supabase.

📅 Quiet Block Scheduling – Users create time blocks for silent study.

🚫 No Overlaps – Validation prevents multiple overlapping blocks per user.

⏰ Email Reminder – Sent 10 minutes before a block starts.

⚡ CRON Automation – Scheduled function checks upcoming blocks and sends reminders.

🌐 Deployment Ready – Next.js on Vercel + MongoDB Atlas.

🗄️ Database Models

MongoDB Collections:

users:

{
  "_id": "ObjectId",
  "supabaseId": "uuid",
  "email": "string"
}


quiet_blocks:

{
  "_id": "ObjectId",
  "userId": "uuid",
  "startTime": "Date",
  "endTime": "Date",
  "createdAt": "Date",
  "notified": "boolean"
}

⚙️ System Flow

User logs in with Supabase.

User schedules a quiet block → saved in MongoDB.

CRON job runs every minute:

Finds blocks starting in 10 minutes.

Checks notified: false.

Sends email → updates block with notified: true.

🔧 Setup

Clone repo & install dependencies:

git clone <repo-url>
cd quiet-hours-scheduler
npm install


Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MONGODB_URI=your_mongodb_uri
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_pass


Run locally:

npm run dev


Deploy:

Frontend/API → Vercel.

DB → MongoDB Atlas.

CRON → Vercel Scheduled Function or Supabase Edge Function.

📬 Email Notification Example
Subject: Quiet Hours Reminder
Body: Your quiet block starts in 10 minutes. Time to get focused!

✅ Roadmap (2 Days)

Day 1: Auth, MongoDB schema, API routes, block creation/listing.

Day 2: CRON job, email notifications, polish UI, deploy.

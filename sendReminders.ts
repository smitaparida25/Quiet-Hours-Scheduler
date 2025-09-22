import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTestEmail() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "smita.22scse1420030@galgotiasuniversity.edu.in", // Change to your recipient
      subject: "Hello from Quiet Hours Scheduler!",
      text: "This is a test email sent from your Node.js script.",
    });
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Example usage
sendTestEmail();

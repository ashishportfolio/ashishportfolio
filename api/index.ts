import express from "express";
import path from "path";
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// API Routes
app.post("/api/send-email", async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("DEBUG: RESEND_API_KEY is missing from environment variables");
    return res.status(500).json({ error: "Email service not configured (Missing API Key)" });
  }

  const resendClient = new Resend(apiKey);
  const { type, data } = req.body;
  const recipient = process.env.NOTIFICATION_EMAIL || "imguptashish@gmail.com";

  console.log(`DEBUG: Attempting to send ${type} email to ${recipient}`);

  try {
    let subject = "";
    let html = "";

    if (type === "contact") {
      subject = `New Contact Inquiry: ${data.subject}`;
      html = `
        <h1>New Contact Inquiry</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Project Type:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `;
    } else if (type === "booking") {
      subject = `New Booking Request: ${data.name}`;
      html = `
        <h1>New Booking Request</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time_slot} IST</p>
        <p><strong>Message:</strong> ${data.message || "No message provided"}</p>
      `;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';
    
    const result = await resendClient.emails.send({
      from: fromEmail,
      to: recipient,
      subject: subject,
      html: html,
    });

    if (result.error) {
      console.error("DEBUG: Resend API returned an error:", result.error);
      return res.status(500).json({ error: result.error.message });
    }

    console.log(`DEBUG: Email sent successfully! ID: ${result.data?.id}`);
    res.json({ success: true, id: result.data?.id });
  } catch (error: any) {
    console.error("DEBUG: Internal Server Error sending email:", error);
    res.status(500).json({ error: error.message || "Failed to send email" });
  }
});

// For Vercel environment, we don't handle the static file serving here
// as vercel.json handles the routing to index.html for non-API routes.

export default app;

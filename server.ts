import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const app = express();
app.use(express.json());

// API Routes
app.post("/api/send-email", async (req, res) => {
  if (!resend) {
    console.error("RESEND_API_KEY is not configured");
    return res.status(500).json({ error: "Email service not configured" });
  }

  const { type, data } = req.body;
  const recipient = process.env.NOTIFICATION_EMAIL || "imguptashish@gmail.com";

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

    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: recipient,
      subject: subject,
      html: html,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // For local production testing or Cloud Run
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Start if not imported (common for Cloud Run/Local)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  setupApp().then(() => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

// Export for Vercel
export default app;

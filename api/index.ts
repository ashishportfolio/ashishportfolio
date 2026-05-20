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
      const name = data?.name || "Anonymous";
      const senderEmail = data?.email || "no-reply@example.com";
      const inputSubject = data?.subject || "General Inquiry";
      const message = data?.message || "No message provided";

      subject = `New Contact Inquiry: ${inputSubject}`;
      html = `
        <h1>New Contact Inquiry</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${senderEmail}</p>
        <p><strong>Project Type:</strong> ${inputSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `;
    } else if (type === "booking") {
      const name = data?.name || "Anonymous";
      const senderEmail = data?.email || "no-reply@example.com";
      const phone = data?.phone || "N/A";
      const date = data?.date || "N/A";
      const time_slot = data?.time_slot || "N/A";
      const message = data?.message || "No message provided";

      subject = `New Booking Request: ${name}`;
      html = `
        <h1>New Booking Request</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${senderEmail}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time_slot} IST</p>
        <p><strong>Message:</strong> ${message}</p>
      `;
    } else {
      console.warn(`DEBUG: Invalid or unsupported email type: ${type}`);
      return res.status(400).json({ error: `Unsupported email type: ${type}` });
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
      
      // Provide a helpful developer configuration guide for validation_errors (typical for sandbox/domain issues)
      if (result.error.name === "validation_error") {
        console.warn("\n========================================================================\n" +
                     "💡 DIAGNOSTIC INFO FOR RESEND VALIDATION ERROR:\n" +
                     "------------------------------------------------------------------------\n" +
                     `1. Your From Email is currently: "${fromEmail}"\n` +
                     `2. Your Recipient Email is currently: "${recipient}"\n\n` +
                     "WHY THIS ERROR OCCURS:\n" +
                     "• Sandbox Mode Limits: In Resend free/sandbox mode (using 'onboarding@resend.dev'),\n" +
                     "  you can ONLY send emails to the email address used to register your Resend account.\n" +
                     "  Sending to any other recipient (e.g. 'imguptashish@gmail.com') will reject with a validation_error.\n" +
                     "• Custom Domain Key: If you are using a production Resend API Key, you cannot use\n" +
                     "  'onboarding@resend.dev' as the from address. You must use your verified domain.\n\n" +
                     "HOW TO FIX THIS:\n" +
                     "• Set NOTIFICATION_EMAIL in your environment variables to match your verified Resend account email.\n" +
                     "• Verify your custom domain in Resend and set RESEND_FROM_EMAIL to use your verified domain.\n" +
                     "========================================================================\n");
      }
      return res.status(400).json({ 
        error: result.error.message,
        name: result.error.name,
        suggestion: "Please configure NOTIFICATION_EMAIL and RESEND_FROM_EMAIL environment variables to match your verified Resend domain and account email."
      });
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

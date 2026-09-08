export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { name, email, company, service, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required.' }), { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ 
        error: "Server configuration missing: RESEND_API_KEY not found in Vercel." 
      }), { status: 500 });
    }

    // Construct the email content
    const htmlContent = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Service Requested:</strong> ${service || 'Not specified'}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
      </div>
    `;

    // Call Resend API natively
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: 'python.asmath1290@gmail.com',
        subject: `New Portfolio Message from ${name}`,
        html: htmlContent,
        reply_to: email
      })
    });

    if (resendResponse.ok) {
      return new Response(JSON.stringify({ success: true, message: "Email sent successfully!" }), { status: 200 });
    } else {
      const errorData = await resendResponse.json();
      return new Response(JSON.stringify({ error: "Failed to send email via Resend.", details: errorData }), { status: 500 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

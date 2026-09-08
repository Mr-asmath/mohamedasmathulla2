export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
    }

    // Must be set in Vercel Environment Variables
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ 
        reply: "Setup required: Please configure GEMINI_API_KEY in Vercel environment variables." 
      }), { status: 200 }); // Returning 200 so the UI handles it gracefully
    }

    const systemPrompt = `You are a helpful AI assistant on the portfolio website of Mohamed Asmathulla G. 
Mohamed is a Computer Science developer from Karur, India, specializing in AI, backend engineering, Python, Android apps, and data analytics. 
His key experience includes InGen Dynamics (Android & Python Dev), Brillaris Global (Backend), IBM (Data Analytics), and Upskill Campus (Data Science).
Keep your answers very short, friendly, and professional. 
Encourage visitors to check out his projects or contact him via email at python.asmath1290@gmail.com if they want to collaborate.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\nVisitor says: " + message }] }
        ]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content.parts[0].text;
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ reply: "Sorry, I couldn't generate a response right now." }), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ reply: "Server error occurred while connecting to the AI." }), { status: 200 });
  }
}

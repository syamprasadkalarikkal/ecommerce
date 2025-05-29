import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Narrow and validate body
    const { name, email, message } = body as {
      name: string;
      email: string;
      message: string;
    };

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const response = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // Must be a verified sender
      to: 's74001336@gmail.com',
      subject: 'New Contact Message',
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    if (response.error) {
      console.error('❌ Resend error:', response.error);
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    // Proper type checking
    if (err instanceof Error) {
      console.error('❌ Unexpected error:', err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    console.error('❌ Unknown error:', err);
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}

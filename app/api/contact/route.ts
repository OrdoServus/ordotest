
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
    }

    // In a real application, you would use a service like Nodemailer, Resend, or SendGrid
    // to send the email. For this simulation, we'll just log the data to the console.
    console.log('--- New Contact Form Submission ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('-----------------------------------');

    // Simulate a successful email sending process
    return NextResponse.json({ message: 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.' }, { status: 200 });

  } catch (error) {
    console.error('Error processing contact request:', error);
    return NextResponse.json({ error: 'Beim Senden der Nachricht ist ein Fehler aufgetreten.' }, { status: 500 });
  }
}

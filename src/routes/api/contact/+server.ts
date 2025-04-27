import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// POST handler for the contact form
export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Basic validation (can be more sophisticated)
        if (!name || !email || !subject || !message) {
            return json({ success: false, message: 'Missing required fields.' }, { status: 400 });
        }

        console.log('Received contact form submission:', { name, email, subject });

        // --- Placeholder for Email Sending Logic ---
        // Here you would integrate with an email service API
        // Example (conceptual):
        // const emailSent = await sendEmail({ 
        //    to: 'your-email@example.com', 
        //    from: 'website-contact@your-domain.com',
        //    subject: `Contact Form: ${subject}`,
        //    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        // });
        
        // Simulate success/failure for now
        const emailSent = Math.random() > 0.1; // Simulate 90% success rate

        if (emailSent) {
            console.log('Simulated email sending successful.');
            return json({ success: true, message: 'Message sent successfully! (Simulation)' });
        } else {
            console.error('Simulated email sending failed.');
            return json({ success: false, message: 'Failed to send message. Please try again later. (Simulation)' }, { status: 500 });
        }
        // --- End Placeholder ---

    } catch (error) {
        console.error('Error processing contact form:', error);
        return json({ success: false, message: 'An unexpected error occurred.' }, { status: 500 });
    }
}; 
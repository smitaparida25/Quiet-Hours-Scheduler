import clientPromise from "./mongodb.ts";
import nodemailer from 'nodemailer';

export async function sendReminderEmails() {
    const client = await clientPromise;
    const db = client.db('quiet-hours-scheduler');
    const blocks = db.collection('blocks');

    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60000);

    const upcomingBlocks = await blocks.find({
        startTime: { $gte: now, $lt: tenMinutesLater },
        notified: false
    }).toArray();

    for (const block of upcomingBlocks) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: block.userEmail,
            subject: 'Your Quiet Block is Starting Soon',
            text: `Hey! Your quiet block "${block.title}" starts at ${block.startTime.toLocaleTimeString()}.`
        });

        console.log(`Reminder sent to ${block.userEmail}`);
        await blocks.updateOne(
                { _id: block._id },
                { $set: { notified: true } }
            );
    }
}

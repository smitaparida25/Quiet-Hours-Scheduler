import clientPromise from "./mongodb";
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

    const result = { found: upcomingBlocks.length, sent: 0, errors: [] as string[] };

    if (upcomingBlocks.length === 0) {
        return result;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    for (const block of upcomingBlocks) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: block.userEmail,
                subject: 'Your Quiet Block is Starting Soon',
                text: `Hey! Your quiet block starts at ${new Date(block.startTime).toLocaleTimeString()}.`
            });

            await blocks.updateOne(
                { _id: block._id },
                { $set: { notified: true } }
            );
            result.sent += 1;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            result.errors.push(`Failed for ${block.userEmail}: ${message}`);
        }
    }

    return result;
}

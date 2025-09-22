import clientPromise from "./mongodb";
import nodemailer from 'nodemailer';
import type { NextApiRequest, NextApiResponse } from 'next';

const SECRET_TOKEN = process.env.CRON_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = req.query.token;
    if (token !== SECRET_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const result = await sendReminderEmails();
        console.log("Cron ran at", new Date().toISOString(), result);
        return res.status(200).json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Cron error:", message);
        return res.status(500).json({ error: message });
    }
}

function formatInZone(date: Date, zone?: string) {
    const options: Intl.DateTimeFormatOptions = {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: zone,
    };
    return new Intl.DateTimeFormat(undefined, options).format(date);
}

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
            const when = formatInZone(new Date(block.startTime), (block as any).timeZone);
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: (block as any).userEmail,
                subject: 'Your Quiet Block is Starting Soon',
                text: `Hey! Your quiet block starts at ${when}.`
            });

            await blocks.updateOne(
                { _id: block._id },
                { $set: { notified: true } }
            );
            result.sent += 1;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            result.errors.push(`Failed for ${(block as any).userEmail}: ${message}`);
        }
    }

    return result;
}

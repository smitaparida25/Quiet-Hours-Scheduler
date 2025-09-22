import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import cron from 'node-cron';
import { sendReminderEmails } from "./sendReminders.ts";


cron.schedule('* * * * *', async () => {
    console.log('Checking for upcoming blocks...');
    await sendReminderEmails();
});

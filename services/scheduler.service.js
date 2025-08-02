import cron from 'node-cron';
import { getDB } from '../config/db.js';

// Store all scheduled jobs in-memory (optional: can use Redis for distributed systems)
const scheduledJobs = {};

export const scheduleMessageInsert = async ({ message, day, time }) => {
  // Example: day = 'Monday', time = '14:30'
  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const [hour, minute] = time.split(':').map(Number);
  const dayOfWeek = dayMap[day];

  if (dayOfWeek === undefined || isNaN(hour) || isNaN(minute)) {
    throw new Error('Invalid day or time format.');
  }

  // Convert to cron format: 'minute hour * * day-of-week'
  const cronTime = `${minute} ${hour} * * ${dayOfWeek}`;

  const jobId = `${message}-${day}-${time}`;

  // Prevent duplicates
  if (scheduledJobs[jobId]) {
    return { message: 'Job already scheduled' };
  }

  const db = getDB();
  const job = cron.schedule(cronTime, async () => {
    try {
      await db.collection('scheduled_messages').insertOne({
        message,
        createdAt: new Date(),
        executedAt: new Date(),
        scheduledDay: day,
        scheduledTime: time,
      });
      console.log(`✅ Inserted scheduled message: "${message}"`);
    } catch (error) {
      console.error('❌ Failed to insert scheduled message:', error.message);
    }
  });

  job.start();
  scheduledJobs[jobId] = job;

  return { message: 'Job scheduled successfully', cronTime };
};

import { scheduleMessageInsert } from '../services/scheduler.service.js';

export const scheduleMessage = async (req, res) => {
  try {
    const { message, day, time } = req.body;

    if (!message || !day || !time) {
      return res.status(400).json({ success: false, message: 'message, day, and time are required' });
    }

    const result = await scheduleMessageInsert({ message, day, time });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Failed to schedule message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

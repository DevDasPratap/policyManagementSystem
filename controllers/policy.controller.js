import { getDB } from '../config/db.js';

export const searchPolicyByUsername = async (req, res) => {
  try {
    const { name } = req.params;
    const db = getDB();

    const user = await db.collection('users').findOne({ firstName: { $regex: new RegExp(name, 'i') } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const policies = await db.collection('policies').find({ user_id: user._id }).toArray();

    res.json({ success: true, user, policies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error retrieving policies' });
  }
};

export const getPolicyAggregateByUser = async (req, res) => {
  try {
    const db = getDB();

    const aggregation = await db.collection('policies').aggregate([
      {
        $group: {
          _id: '$userEmail',
          totalPolicies: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'email',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          user: '$user.firstName',
          totalPolicies: 1,
        },
      },
    ]).toArray();


    res.json({ success: true, data: aggregation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error aggregating policies' });
  }
};

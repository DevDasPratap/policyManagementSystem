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
      // First stage: Filter out documents without userId
      {
        $match: {
          userId: { $exists: true, $ne: null }
        }
      },
      // Group by userId
      {
        $group: {
          _id: '$userId',
          totalPolicies: { $sum: 1 },
          samplePolicies: { $push: '$policyNumber' }
        }
      },
      // Lookup user details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id', // Now matching ObjectID to ObjectID
          as: 'userInfo'
        }
      },
      // Unwind userInfo
      {
        $unwind: {
          path: '$userInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      // Project the final output
      {
        $project: {
          _id: 0,
          userEmail: '$userInfo.email', // Get email from user document
          user: {
            $ifNull: [
              '$userInfo.firstName',
              'Unknown User'
            ]
          },
          totalPolicies: 1,
          samplePolicyNumbers: { $slice: ['$samplePolicies', 3] }
        }
      },
      // Sort by policy count (descending)
      {
        $sort: { totalPolicies: -1 }
      }
    ]).toArray();

    // Get statistics about policies without users
    const policiesWithoutUser = await db.collection('policies').countDocuments({
      userId: { $exists: false }
    });

    res.json({
      success: true,
      data: aggregation,
      metadata: {
        totalMatchedPolicies: aggregation.reduce((sum, item) => sum + item.totalPolicies, 0),
        policiesWithoutUser: policiesWithoutUser,
        uniqueUsersWithPolicies: aggregation.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error aggregating policies',
      error: err.message
    });
  }
};
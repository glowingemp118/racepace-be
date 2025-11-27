const { types } = require("../middleware/accessMiddleware");
const countStatus = () => {
  return [
    {
      $match: {user_type: { $ne: types.admin } }, // Exclude admin users from the count
    },
    {
    $group: {
      _id: "$status",
      active: {
        $sum: {
          $cond: [{ $eq: ["$status", "active"] }, 1, 0],
        },
      },
      inactive: {
        $sum: {
          $cond: [{ $eq: ["$status", "inactive"] }, 1, 0],
        },
      },
      blocked: {
        $sum: {
          $cond: [{ $eq: ["$status", "blocked"] }, 1, 0],
        },
      },
    },
  },{
    $project: {
      _id: 0,
      active: 1,
      inactive: 1,
      blocked: 1,
    },
  }
];
};
const paginationPipeline = ({
  pageno = 1,
  limit = parseInt(process.env.ITEMPERPAGE),
}) => {
  const skip = (Number(pageno) - 1) * Number(limit);
  return {
    $facet: {
      metadata: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
          },
        },
      ],
      data: [
        {
          $skip: skip,
        },
        {
          $limit: Number(limit),
        },
      ],
    },
  };
};

const sort = () => {
  return { $sort: { createdAt: -1 } };
};

const finalRes = ({ pageno, limit, data }) => {
  const { total } = (pageno && limit && data[0]?.metadata[0]) || {};
  return {
    total_pages:
      pageno && limit ? Math.ceil(total / limit) || 0 : data?.length ? 1 : 0,
    total_length: pageno && limit ? total || 0 : data?.length || 0,
    data: pageno && limit ? data[0]?.data || [] : data,
  };
};

const userPipeline = (search) => {
  let cond = {
    ...(search
      ? {
          $or: [
            { name: { $regex: `.*${search}.*`, $options: "i" } }, // Search by username (case-insensitive)
            { email: { $regex: `.*${search}.*`, $options: "i" } }, // Search by email (case-insensitive)
            { phone: { $regex: `.*${search}.*`, $options: "i" } }, // Search by university (case-insensitive)
          ],
        }
      : {}),
  };
  let pipeline = [
    ...(search ? [{ $match: cond }] : []),
    {
      $addFields: {
        image: { $concat: [process.env.IMAGEBASEURLLOCAL, "$image"] },
      },
    },
    {
      $project: {
        password: 0,
        "--v": 0,
      },
    },
  ];
  return pipeline;
};

const logsPipeline = (search) => {
  let cond = {
    ...(search
      ? {
          $or: [
            { eventName: { $regex: `.*${search}.*`, $options: "i" } }, // Search by username (case-insensitive)
            { raceDistance: { $regex: `.*${search}.*`, $options: "i" } }, // Search by username (case-insensitive)
            { "athlete.name": { $regex: `.*${search}.*`, $options: "i" } }, // Search by email (case-insensitive)
            { "athlete.team": { $regex: `.*${search}.*`, $options: "i" } }, // Search by email (case-insensitive)
          ],
        }
      : {}),
  };
  let pipeline = [
    {
      $lookup: {
          from: 'athletes',
          localField: 'athlete',
          foreignField: '_id',
          as: 'athlete',
      },
  },

  { $unwind: { path: "$athlete", preserveNullAndEmptyArrays: true } },
  {
      $project: {
          _id: 1,
          eventName: 1,
          raceDistance: 1,
          splitInterval: 1,
          finishTime: 1,
          raceStrategy: 1,
          laps: 1,
          createdAt: 1,
          updatedAt: 1,
          user: 1,
          'athlete._id': 1,
          'athlete.name': 1,
          'athlete.team': 1,
      }
  },
  ...(search ? [{ $match: cond }] : []),
  
  ];
  return pipeline;
}

module.exports = {
  paginationPipeline,
  sort,
  userPipeline,
  finalRes,
  countStatus,
  logsPipeline,
};

const { types } = require("../middleware/accessMiddleware");
const Athlete = require("../schemas/Athlete");
const Log = require("../schemas/logs");
const User = require("../schemas/User");
const {
  sort,
  paginationPipeline,
  userPipeline,
  finalRes,
  countStatus,
  logsPipeline,
} = require("./commonHelper");

const getUsers = async ({ pageno, limit, search,filter}) => {
  const pipeline = [{$match:filter}];
  pipeline.push(...userPipeline(search));
  pipeline.push(sort());
  pageno && limit && pipeline.push(paginationPipeline({ pageno, limit }));
  const data = await User.aggregate(pipeline);
  const result = finalRes({ pageno, limit, data });
  const statusCounts = await User.aggregate(countStatus());
  return {...result,...statusCounts[0]||{}};
};

const getAthletes = async ({ pageno, limit, search,filter }) => {
  let obj={...filter}
  if (search) {
    obj["$or"] = [
      { name: { $regex: search, $options: "i" } },
      { age: { $regex: search, $options: "i" } },
      { team: { $regex: search, $options: "i" } },
    ];
  }
  const pipeline = [{$match:obj}];
  pipeline.push(sort());
  pageno && limit && pipeline.push(paginationPipeline({ pageno, limit }));
  const data = await Athlete.aggregate(pipeline);
  const result = finalRes({ pageno, limit, data });
  return result;
};

const getLogs = async ({ pageno, limit, search, filter ,tab}) => {
  let obj={...filter}

  if(tab){
    obj["$or"] = [
      { createdAt: { $gte: tab} },
    ];
  }
  const pipeline = [{$match:obj}];
  pipeline.push(...logsPipeline(search))
  pipeline.push(sort());
  pageno && limit && pipeline.push(paginationPipeline({ pageno, limit }));
  const data = await Log.aggregate(pipeline);
  let tabs = [
    { title: 'All Time', value: 'all' },
    { title: 'Last 3 Days', value: '3days' },
    { title: 'Last Week', value: '1week' },
    { title: 'Last Month', value: '1month' },
]

  const result = finalRes({ pageno, limit,data  });
  return {...result,tabs};
};

module.exports = {
  getUsers,
  getAthletes,
  getLogs,
};

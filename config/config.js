import dotenv from 'dotenv';
dotenv.config();

const env = Object.freeze({
  DBURL: process.env.MONGO_URI,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  CPU_CHECK_INTERVAL: process.env.CPU_CHECK_INTERVAL,
});

export default env;
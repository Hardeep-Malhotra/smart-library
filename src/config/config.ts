import { config as conf } from 'dotenv';

conf();
const _config = Object.freeze({
  port: process.env.PORT || 3000,
  dataBaseUrl: process.env.MONGO_URI,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
});

export default _config;

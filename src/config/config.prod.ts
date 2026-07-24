/**
 * 生产环境配置
 * @description NODE_ENV=production 时生效
 */
import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    port: 7001,
  },
  // 生产环境跨域需配置具体域名
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  // 生产环境日志级别调高
  midwayLogger: {
    default: {
      level: 'warn',
      consoleLevel: 'warn',
    },
  },
} as MidwayConfig;

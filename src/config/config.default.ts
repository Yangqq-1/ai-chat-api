/**
 * 默认配置（所有环境共享）
 * @description 应用基础配置，所有环境通用
 */
import { MidwayConfig } from '@midwayjs/core';

export default {
  keys: 'ai-chat-api_2024',
  koa: {
    port: 7001,
  },
  // 跨域配置
  cors: {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    allowHeaders: 'Content-Type,Authorization,Accept,X-Requested-With',
    credentials: false,
  },
  // 参数校验配置
  validate: {
    validationOptions: {
      allowUnknown: true,
    },
  },
  // 日志配置
  midwayLogger: {
    default: {
      level: 'info',
      consoleLevel: 'info',
    },
  },
} as MidwayConfig;

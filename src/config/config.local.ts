/**
 * 本地开发环境配置
 * @description NODE_ENV=local 时生效
 */
import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    port: 7001,
  },
  // 本地开发开启详细日志
  midwayLogger: {
    default: {
      level: 'debug',
      consoleLevel: 'debug',
    },
  },
} as MidwayConfig;

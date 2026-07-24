/**
 * 健康检查控制器
 * @description 提供应用健康检查和基础信息接口
 */
import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { successResponse } from '../interface/response';

@Controller('/api')
export class HealthController {
  @Inject()
  ctx: Context;

  /**
   * 健康检查接口
   * @summary 用于负载均衡器、监控系统探测应用存活状态
   */
  @Get('/health')
  async health() {
    return successResponse({
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
    });
  }

  /**
   * 应用信息接口
   * @summary 返回应用版本、环境等基础信息
   */
  @Get('/info')
  async info() {
    return successResponse({
      name: 'ai-chat-api',
      version: '1.0.0',
      env: process.env.NODE_ENV || 'development',
      protocol: 'AG-UI',
    });
  }
}

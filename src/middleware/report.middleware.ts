/**
 * 请求日志中间件
 * @description 记录每个 HTTP 请求的方法、路径、状态码、耗时，便于问题排查和性能监控
 */
import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();

      // 执行后续中间件和控制器
      await next();

      // 计算耗时
      const cost = Date.now() - startTime;

      // 记录请求日志（SSE 流式接口不记录响应体大小）
      const isStream = ctx.response.get('Content-Type')?.includes('text/event-stream');

      ctx.logger.info(
        '[HTTP] %s %s %s %dms%s',
        ctx.method,
        ctx.url,
        ctx.status,
        cost,
        isStream ? ' [SSE]' : ''
      );
    };
  }

  /**
   * 忽略健康检查接口（避免日志刷屏）
   */
  ignore(ctx: Context): boolean {
    return ctx.path === '/api/health';
  }

  static getName(): string {
    return 'report';
  }
}

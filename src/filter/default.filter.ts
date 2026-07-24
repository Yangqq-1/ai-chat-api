/**
 * 全局异常过滤器
 * @description 统一捕获并处理应用异常，返回标准错误响应格式
 */
import { Catch, MidwayHttpError, httpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { errorResponse } from '../interface/response';

/**
 * 全局 HTTP 异常过滤器
 * 捕获所有 MidwayHttpError 及其子类异常
 */
@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    // 记录错误日志
    ctx.logger.error('[DefaultErrorFilter] %s', err.message);

    // Midway 内置 HTTP 错误
    if (err instanceof MidwayHttpError) {
      ctx.status = err.status;
      return errorResponse(
        String(err.status),
        err.message
      );
    }

    // 参数校验错误（@midwayjs/validate 抛出）
    if (err.name === 'MidwayValidationError') {
      ctx.status = 422;
      return errorResponse('VALIDATION_ERROR', err.message);
    }

    // 未知错误，返回 500
    ctx.status = 500;
    return errorResponse(
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'production'
        ? '服务器内部错误'
        : err.message
    );
  }
}

/**
 * 404 异常过滤器
 */
@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: Error, ctx: Context) {
    ctx.status = 404;
    return errorResponse('NOT_FOUND', `接口 ${ctx.path} 不存在`);
  }
}

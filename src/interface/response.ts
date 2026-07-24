/**
 * 统一响应结构接口
 * @description 所有 API 接口统一使用此响应格式，便于前端统一处理
 */

/**
 * 统一响应结构
 */
export interface IResponse<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data: T | null;
  /** 错误码（失败时返回） */
  errorCode?: string;
  /** 错误信息（失败时返回） */
  errorMessage?: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 分页请求参数
 */
export interface IPaginationParams {
  /** 当前页码，从 1 开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 分页响应结构
 */
export interface IPaginationResult<T = any> {
  /** 数据列表 */
  list: T[];
  /** 总条数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 成功响应构造
 */
export function successResponse<T>(data: T): IResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
  };
}

/**
 * 失败响应构造
 */
export function errorResponse(
  errorCode: string,
  errorMessage: string
): IResponse<null> {
  return {
    success: false,
    data: null,
    errorCode,
    errorMessage,
    timestamp: Date.now(),
  };
}

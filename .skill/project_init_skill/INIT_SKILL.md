# MidwayJS + AG-UI 协议服务端项目初始化 Skill

当用户要求创建一个新的 AI 服务端项目时，按照以下步骤执行。

## 项目定位

这是一个基于 AG-UI 协议的 AI 聊天服务端通用模板，遵循阿里开发规范，技术栈固定：

- **框架**: MidwayJS 3.x（阿里 Node.js 企业级框架）
- **HTTP 层**: Koa（MidwayJS 内置）
- **协议**: AG-UI Protocol（SSE 流式事件通信）
- **语言**: TypeScript 5.5+
- **参数校验**: @midwayjs/validate（基于 Joi）
- **跨域**: @midwayjs/cross-domain
- **日志**: @midwayjs/logger
- **运行时**: Node.js >= 18
- **端口**: 7001（默认）
- **分层架构**: Controller → Service → Interface/DTO

## 核心规范

1. **分层架构**：Controller 只做参数接收和响应返回，业务逻辑全部在 Service 层
2. **统一响应格式**：所有非流式接口必须使用 `successResponse()` / `errorResponse()` 包装
3. **参数校验**：所有 POST 接口必须通过 DTO 类进行参数校验
4. **异常处理**：全局 Filter 统一捕获，禁止在 Controller 中 try-catch 后手动返回错误
5. **命名规范**：文件名 `xxx.controller.ts` / `xxx.service.ts` / `xxx.dto.ts`，类名 PascalCase
6. **注释规范**：每个文件顶部必须有 `@description` 注释，公共方法必须有 JSDoc
7. **AG-UI 协议**：流式接口必须遵循 `RUN_STARTED → TEXT_MESSAGE_START → TEXT_MESSAGE_CONTENT(n次) → TEXT_MESSAGE_END → RUN_FINISHED` 事件生命周期

## 执行步骤

### 1. 创建项目目录

```bash
mkdir my-server-app
cd my-server-app
```

### 2. 创建 package.json

```json
{
  "name": "my-server-app",
  "version": "1.0.0",
  "description": "AI Server based on AG-UI Protocol",
  "private": true,
  "scripts": {
    "dev": "cross-env NODE_ENV=local midway-bin dev --ts",
    "build": "midway-bin build -c",
    "start": "node bootstrap.js",
    "lint": "eslint --ext .ts src/",
    "lint:fix": "eslint --ext .ts src/ --fix"
  },
  "dependencies": {
    "@midwayjs/bootstrap": "^3.19.0",
    "@midwayjs/core": "^3.19.0",
    "@midwayjs/koa": "^3.19.0",
    "@midwayjs/cross-domain": "^3.19.0",
    "@midwayjs/validate": "^3.19.0",
    "@midwayjs/info": "^3.19.0",
    "@midwayjs/logger": "^3.4.0",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@midwayjs/cli": "^2.1.0",
    "@midwayjs/mock": "^3.19.0",
    "@types/node": "^20.17.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "cross-env": "^7.0.3",
    "eslint": "^8.57.0",
    "typescript": "~5.5.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

> ⚠️ 注意：`@midwayjs/cli` 必须用 `^2.1.0`（不是 1.x），`typescript` 用 `~5.5.0` 锁定小版本。

### 3. 创建 tsconfig.json

```json
{
  "compileOnSave": true,
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "inlineSourceMap": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "stripInternal": true,
    "skipLibCheck": true,
    "pretty": true,
    "declaration": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "test"]
}
```

> ⚠️ 必须开启 `experimentalDecorators` 和 `emitDecoratorMetadata`，否则 MidwayJS 依赖注入无法工作。

### 4. 创建 bootstrap.js（生产启动入口）

```js
/**
 * 生产环境启动入口
 * @description 用于生产环境部署启动
 */
const { Bootstrap } = require('@midwayjs/bootstrap');

Bootstrap.run();
```

### 5. 创建 .gitignore

```
node_modules/
dist/
logs/
run/
*.log
.DS_Store
.idea/
.vscode/
```

### 6. 创建 src/configuration.ts（应用入口配置）

```ts
/**
 * 应用启动配置
 * @description MidwayJS 应用入口配置，注册组件和全局功能
 */
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as crossDomain from '@midwayjs/cross-domain';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import { DefaultErrorFilter, NotFoundFilter } from './filter/default.filter';
import { ReportMiddleware } from './middleware/report.middleware';

@Configuration({
  imports: [
    koa,
    crossDomain,
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // 注册全局中间件
    this.app.useMiddleware([ReportMiddleware]);
    // 注册全局异常过滤器
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
```

> ⚠️ 关键点：
> - 使用 `@midwayjs/cross-domain` 组件处理跨域，**禁止**手动引入 `@koa/cors`
> - `@midwayjs/info` 仅在 local 环境启用
> - 全局 Middleware 和 Filter 在 `onReady` 中注册，**中间件先于过滤器**

### 7. 创建配置文件

**src/config/config.default.ts**（所有环境共享）：
```ts
/**
 * 默认配置（所有环境共享）
 * @description 应用基础配置，所有环境通用
 */
import { MidwayConfig } from '@midwayjs/core';

export default {
  keys: 'my-server-app_2024',
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
```

**src/config/config.local.ts**（本地开发）：
```ts
/**
 * 本地开发环境配置
 * @description NODE_ENV=local 时生效
 */
import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    port: 7001,
  },
  midwayLogger: {
    default: {
      level: 'debug',
      consoleLevel: 'debug',
    },
  },
} as MidwayConfig;
```

**src/config/config.prod.ts**（生产环境）：
```ts
/**
 * 生产环境配置
 * @description NODE_ENV=production 时生效
 */
import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    port: 7001,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  midwayLogger: {
    default: {
      level: 'warn',
      consoleLevel: 'warn',
    },
  },
} as MidwayConfig;
```

### 8. 创建 src/interface/response.ts（统一响应结构）

```ts
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
```

### 9. 创建 src/interface/agui.ts（AG-UI 协议事件类型）

```ts
/**
 * AG-UI 协议事件类型定义
 * @description 基于 AG-UI Protocol 规范定义的事件类型
 * @see https://docs.ag-ui.com/concepts/events
 */

// ==================== 事件类型枚举 ====================

export enum EventType {
  // 生命周期事件
  RUN_STARTED = 'RUN_STARTED',
  RUN_FINISHED = 'RUN_FINISHED',
  RUN_ERROR = 'RUN_ERROR',
  STEP_STARTED = 'STEP_STARTED',
  STEP_FINISHED = 'STEP_FINISHED',

  // 文本消息事件
  TEXT_MESSAGE_START = 'TEXT_MESSAGE_START',
  TEXT_MESSAGE_CONTENT = 'TEXT_MESSAGE_CONTENT',
  TEXT_MESSAGE_END = 'TEXT_MESSAGE_END',

  // 工具调用事件
  TOOL_CALL_START = 'TOOL_CALL_START',
  TOOL_CALL_ARGS = 'TOOL_CALL_ARGS',
  TOOL_CALL_END = 'TOOL_CALL_END',
  TOOL_CALL_RESULT = 'TOOL_CALL_RESULT',

  // 状态管理事件
  STATE_SNAPSHOT = 'STATE_SNAPSHOT',
  STATE_DELTA = 'STATE_DELTA',
  MESSAGES_SNAPSHOT = 'MESSAGES_SNAPSHOT',

  // 推理事件
  REASONING_START = 'REASONING_START',
  REASONING_MESSAGE_START = 'REASONING_MESSAGE_START',
  REASONING_MESSAGE_CONTENT = 'REASONING_MESSAGE_CONTENT',
  REASONING_MESSAGE_END = 'REASONING_MESSAGE_END',
  REASONING_END = 'REASONING_END',

  // 特殊事件
  RAW = 'RAW',
  CUSTOM = 'CUSTOM',
}

// ==================== 基础类型定义 ====================

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool' | 'developer';

export interface IBaseEvent {
  type: EventType;
  timestamp?: number;
}

// ==================== 请求类型定义 ====================

export interface IAguiMessage {
  id: string;
  role: MessageRole;
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface IAguiTool {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
}

export interface IAguiRunInput {
  threadId?: string;
  runId?: string;
  messages: IAguiMessage[];
  tools?: IAguiTool[];
  context?: Array<{ name: string; value: any }>;
  forwardedProps?: Record<string, any>;
}

// ==================== 生命周期事件 ====================

export interface IRunStartedEvent extends IBaseEvent {
  type: EventType.RUN_STARTED;
  threadId: string;
  runId: string;
}

export interface IRunFinishedEvent extends IBaseEvent {
  type: EventType.RUN_FINISHED;
  threadId: string;
  runId: string;
  result?: any;
}

export interface IRunErrorEvent extends IBaseEvent {
  type: EventType.RUN_ERROR;
  message: string;
  code?: string;
}

export interface IStepStartedEvent extends IBaseEvent {
  type: EventType.STEP_STARTED;
  stepName: string;
}

export interface IStepFinishedEvent extends IBaseEvent {
  type: EventType.STEP_FINISHED;
  stepName: string;
}

// ==================== 文本消息事件 ====================

export interface ITextMessageStartEvent extends IBaseEvent {
  type: EventType.TEXT_MESSAGE_START;
  messageId: string;
  role: MessageRole;
}

export interface ITextMessageContentEvent extends IBaseEvent {
  type: EventType.TEXT_MESSAGE_CONTENT;
  messageId: string;
  delta: string;
}

export interface ITextMessageEndEvent extends IBaseEvent {
  type: EventType.TEXT_MESSAGE_END;
  messageId: string;
}

// ==================== 工具调用事件 ====================

export interface IToolCallStartEvent extends IBaseEvent {
  type: EventType.TOOL_CALL_START;
  toolCallId: string;
  toolCallName: string;
  parentMessageId?: string;
}

export interface IToolCallArgsEvent extends IBaseEvent {
  type: EventType.TOOL_CALL_ARGS;
  toolCallId: string;
  delta: string;
}

export interface IToolCallEndEvent extends IBaseEvent {
  type: EventType.TOOL_CALL_END;
  toolCallId: string;
}

export interface IToolCallResultEvent extends IBaseEvent {
  type: EventType.TOOL_CALL_RESULT;
  messageId: string;
  toolCallId: string;
  content: string;
  role?: string;
}

// ==================== 状态管理事件 ====================

export interface IStateSnapshotEvent extends IBaseEvent {
  type: EventType.STATE_SNAPSHOT;
  snapshot: Record<string, any>;
}

export interface IStateDeltaEvent extends IBaseEvent {
  type: EventType.STATE_DELTA;
  delta: Array<{
    op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
    path: string;
    value?: any;
    from?: string;
  }>;
}

export interface IMessagesSnapshotEvent extends IBaseEvent {
  type: EventType.MESSAGES_SNAPSHOT;
  messages: IAguiMessage[];
}

// ==================== 特殊事件 ====================

export interface ICustomEvent extends IBaseEvent {
  type: EventType.CUSTOM;
  name: string;
  value: any;
}

// ==================== 事件联合类型 ====================

export type AguiEvent =
  | IRunStartedEvent
  | IRunFinishedEvent
  | IRunErrorEvent
  | IStepStartedEvent
  | IStepFinishedEvent
  | ITextMessageStartEvent
  | ITextMessageContentEvent
  | ITextMessageEndEvent
  | IToolCallStartEvent
  | IToolCallArgsEvent
  | IToolCallEndEvent
  | IToolCallResultEvent
  | IStateSnapshotEvent
  | IStateDeltaEvent
  | IMessagesSnapshotEvent
  | ICustomEvent;
```

### 10. 创建 src/dto/chat.dto.ts（请求参数校验）

```ts
/**
 * 聊天相关 DTO
 * @description 用于请求参数校验的数据传输对象
 */
import { Rule, RuleType } from '@midwayjs/validate';
import { MessageRole } from '../interface/agui';

/**
 * 聊天消息 DTO
 */
export class ChatMessageDTO {
  @Rule(RuleType.string().required())
  id: string;

  @Rule(RuleType.string().valid('user', 'assistant', 'system', 'tool', 'developer').required())
  role: MessageRole;

  @Rule(RuleType.string().allow('').required())
  content: string;

  @Rule(RuleType.string().optional())
  name?: string;

  @Rule(RuleType.string().optional())
  toolCallId?: string;
}

/**
 * AG-UI 运行请求 DTO
 */
export class AguiRunDTO {
  @Rule(RuleType.string().optional())
  threadId?: string;

  @Rule(RuleType.string().optional())
  runId?: string;

  @Rule(RuleType.array().items(RuleType.object({
    id: RuleType.string().required(),
    role: RuleType.string().valid('user', 'assistant', 'system', 'tool', 'developer').required(),
    content: RuleType.string().allow('').required(),
    name: RuleType.string().optional(),
    toolCallId: RuleType.string().optional(),
  })).min(1).required())
  messages: ChatMessageDTO[];

  @Rule(RuleType.array().optional())
  tools?: any[];

  @Rule(RuleType.array().optional())
  context?: Array<{ name: string; value: any }>;

  @Rule(RuleType.object().optional())
  forwardedProps?: Record<string, any>;
}

/**
 * 简单聊天请求 DTO（兼容简单场景）
 */
export class SimpleChatDTO {
  @Rule(RuleType.string().min(1).max(10000).required().messages({
    'string.empty': '消息内容不能为空',
    'string.max': '消息内容不能超过 10000 个字符',
  }))
  message: string;

  @Rule(RuleType.string().optional())
  sessionId?: string;
}
```

### 11. 创建 src/filter/default.filter.ts（全局异常过滤器）

```ts
/**
 * 全局异常过滤器
 * @description 统一捕获并处理应用异常，返回标准错误响应格式
 */
import { Catch, MidwayHttpError, httpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { errorResponse } from '../interface/response';

/**
 * 全局 HTTP 异常过滤器
 */
@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    ctx.logger.error('[DefaultErrorFilter] %s', err.message);

    if (err instanceof MidwayHttpError) {
      ctx.status = err.status;
      return errorResponse(String(err.status), err.message);
    }

    if (err.name === 'MidwayValidationError') {
      ctx.status = 422;
      return errorResponse('VALIDATION_ERROR', err.message);
    }

    ctx.status = 500;
    return errorResponse(
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
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
```

### 12. 创建 src/middleware/report.middleware.ts（请求日志中间件）

```ts
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
      await next();
      const cost = Date.now() - startTime;

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

  /** 忽略健康检查接口（避免日志刷屏） */
  ignore(ctx: Context): boolean {
    return ctx.path === '/api/health';
  }

  static getName(): string {
    return 'report';
  }
}
```

### 13. 创建 .eslintrc.json（代码规范检查）

```json
{
  "root": true,
  "env": {
    "node": true,
    "es2021": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"]
  },
  "ignorePatterns": ["dist/", "node_modules/", "bootstrap.js"]
}
```

> ⚠️ ESLint 用 8.x 版本（传统 `.eslintrc.json` 格式），不用 9.x 的 flat config。

### 14. 创建 src/service/chat.service.ts（业务逻辑层）

```ts
/**
 * 聊天服务
 * @description 处理 AG-UI 协议相关的业务逻辑，包括 SSE 流式响应
 */
import { Provide, Inject, Logger } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ILogger } from '@midwayjs/logger';
import { randomUUID } from 'crypto';
import { EventType, IAguiRunInput, AguiEvent } from '../interface/agui';

@Provide()
export class ChatService {
  @Inject()
  ctx: Context;

  @Logger()
  logger: ILogger;

  /**
   * 处理 AG-UI 协议的流式请求
   */
  async handleAguiStream(input: IAguiRunInput): Promise<void> {
    const { ctx } = this;
    const threadId = input.threadId || randomUUID();
    const runId = input.runId || randomUUID();
    const messageId = randomUUID();

    // 设置 SSE 响应头
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    ctx.status = 200;

    const lastMessage = input.messages[input.messages.length - 1];
    const userContent = lastMessage?.content || '';

    this.logger.info('[ChatService] AG-UI stream: threadId=%s, runId=%s', threadId, runId);

    try {
      // 1. RUN_STARTED
      this.sendEvent({ type: EventType.RUN_STARTED, threadId, runId, timestamp: Date.now() });

      // 2. TEXT_MESSAGE_START
      this.sendEvent({ type: EventType.TEXT_MESSAGE_START, messageId, role: 'assistant', timestamp: Date.now() });

      // 3. 流式输出（TODO: 替换为实际 AI 模型调用）
      const replyText = await this.generateReply(userContent);
      const chunks = this.splitIntoChunks(replyText, 4);
      for (const chunk of chunks) {
        this.sendEvent({ type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: chunk, timestamp: Date.now() });
        await this.sleep(50);
      }

      // 4. TEXT_MESSAGE_END
      this.sendEvent({ type: EventType.TEXT_MESSAGE_END, messageId, timestamp: Date.now() });

      // 5. RUN_FINISHED
      this.sendEvent({ type: EventType.RUN_FINISHED, threadId, runId, timestamp: Date.now() });
    } catch (error) {
      this.logger.error('[ChatService] Stream error: %s', error.message);
      this.sendEvent({ type: EventType.RUN_ERROR, message: error.message || '处理请求时发生错误', code: 'STREAM_ERROR', timestamp: Date.now() });
    } finally {
      ctx.res.end();
    }
  }

  /**
   * 简单聊天处理（非流式）
   */
  async simpleChat(message: string, sessionId?: string) {
    const reply = await this.generateReply(message);
    return { sessionId: sessionId || randomUUID(), reply, timestamp: Date.now() };
  }

  /**
   * 生成回复（TODO: 替换为实际 AI 模型调用）
   */
  private async generateReply(userMessage: string): Promise<string> {
    return `[AI 回复] 收到你的消息："${userMessage}"。后续可在此处接入通义千问、OpenAI 等大模型服务。`;
  }

  /** 发送 SSE 事件 */
  private sendEvent(event: AguiEvent): void {
    this.ctx.res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  /** 文本分块 */
  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /** 延迟 */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 15. 创建 src/controller/health.controller.ts

```ts
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

  @Get('/health')
  async health() {
    return successResponse({
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
    });
  }

  @Get('/info')
  async info() {
    return successResponse({
      name: 'my-server-app',
      version: '1.0.0',
      env: process.env.NODE_ENV || 'development',
      protocol: 'AG-UI',
    });
  }
}
```

### 16. 创建 src/controller/chat.controller.ts

```ts
/**
 * 聊天控制器
 * @description 基于 AG-UI 协议的聊天接口，支持 SSE 流式响应
 */
import { Controller, Post, Inject, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ChatService } from '../service/chat.service';
import { AguiRunDTO, SimpleChatDTO } from '../dto/chat.dto';
import { successResponse } from '../interface/response';

@Controller('/api/chat')
export class ChatController {
  @Inject()
  ctx: Context;

  @Inject()
  chatService: ChatService;

  /**
   * AG-UI 协议流式接口（SSE）
   * POST /api/chat/agent
   */
  @Post('/agent')
  async agent(@Body() body: AguiRunDTO): Promise<void> {
    await this.chatService.handleAguiStream(body);
  }

  /**
   * 简单聊天接口（非流式）
   * POST /api/chat/send
   */
  @Post('/send')
  async sendMessage(@Body() body: SimpleChatDTO) {
    const result = await this.chatService.simpleChat(body.message, body.sessionId);
    return successResponse(result);
  }
}
```

### 17. 安装依赖

```bash
npm install
```

### 18. 初始化 Git 仓库

```bash
git init
git checkout -b master
```

## 验证启动

```bash
npm run dev
```

预期输出：
```
[ Midway ] Start Server at  http://127.0.0.1:7001
```

验证接口：
```bash
# 健康检查
curl http://127.0.0.1:7001/api/health

# 简单聊天
curl -X POST http://127.0.0.1:7001/api/chat/send -H "Content-Type: application/json" -d '{"message":"你好"}'

# AG-UI 流式接口
curl -X POST http://127.0.0.1:7001/api/chat/agent -H "Content-Type: application/json" -d '{"messages":[{"id":"msg-1","role":"user","content":"hello"}]}'
```

AG-UI 流式接口预期返回：
```
data: {"type":"RUN_STARTED","threadId":"xxx","runId":"xxx","timestamp":...}
data: {"type":"TEXT_MESSAGE_START","messageId":"xxx","role":"assistant","timestamp":...}
data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"xxx","delta":"...","timestamp":...}
data: {"type":"TEXT_MESSAGE_END","messageId":"xxx","timestamp":...}
data: {"type":"RUN_FINISHED","threadId":"xxx","runId":"xxx","timestamp":...}
```

## 最终目录结构

```
my-server-app/
├── bootstrap.js                    ← 生产环境启动入口
├── package.json
├── tsconfig.json
├── .eslintrc.json                  ← ESLint 代码规范配置
├── .gitignore
└── src/
    ├── configuration.ts            ← 应用入口配置（组件、中间件、Filter 注册）
    ├── config/
    │   ├── config.default.ts       ← 默认配置（端口、跨域、校验、日志）
    │   ├── config.local.ts         ← 本地开发配置
    │   └── config.prod.ts          ← 生产环境配置
    ├── controller/
    │   ├── health.controller.ts    ← 健康检查
    │   └── chat.controller.ts      ← 聊天接口（AG-UI 流式 + 简单模式）
    ├── service/
    │   └── chat.service.ts         ← 聊天业务逻辑（SSE 事件推送）
    ├── middleware/
    │   └── report.middleware.ts    ← 请求日志中间件
    ├── dto/
    │   └── chat.dto.ts             ← 请求参数校验
    ├── interface/
    │   ├── response.ts             ← 统一响应结构
    │   └── agui.ts                 ← AG-UI 协议事件类型定义
    └── filter/
        └── default.filter.ts       ← 全局异常过滤器
```

## 新增业务模块规则

新增一个业务模块（如 `user`）时，按以下顺序创建文件：

1. `src/dto/user.dto.ts` — 定义请求参数校验
2. `src/service/user.service.ts` — 编写业务逻辑
3. `src/controller/user.controller.ts` — 暴露 HTTP 接口

命名约定：
- Controller 路由前缀：`/api/模块名`（如 `/api/user`）
- Service 类名：`模块名 + Service`（如 `UserService`）
- DTO 类名：`功能 + DTO`（如 `CreateUserDTO`）

## AG-UI 协议 SSE 事件发送规范

在 Service 中发送 SSE 事件时，必须遵循以下规范：

```
RUN_STARTED                    ← 必须，第一个事件
│
├── TEXT_MESSAGE_START          ← 文本消息开始
│   ├── TEXT_MESSAGE_CONTENT    ← 文本增量（逐 token，可多次）
│   └── TEXT_MESSAGE_END        ← 文本消息结束
│
├── TOOL_CALL_START             ← 工具调用开始（可选）
│   ├── TOOL_CALL_ARGS          ← 工具参数（流式，可多次）
│   ├── TOOL_CALL_END           ← 工具调用结束
│   └── TOOL_CALL_RESULT        ← 工具执行结果
│
└── RUN_FINISHED               ← 必须，最后一个事件（或 RUN_ERROR）
```

SSE 数据格式：每条事件为 `data: <JSON>\n\n`（两个换行符分隔）。

## 常见坑

1. **跨域**：必须使用 `@midwayjs/cross-domain` 组件，**禁止**手动引入 `@koa/cors`。
2. **configuration.ts 语法**：`@Configuration` 装饰器中**没有** `koa: { port }` 属性，端口在 `config.default.ts` 中配置。
3. **SSE 响应**：流式接口必须设置 `Content-Type: text/event-stream`，且使用 `ctx.res.write()` 而非 `ctx.body`。
4. **DTO 校验**：`@midwayjs/validate` 基于 Joi（不是 class-validator 装饰器风格），用 `@Rule(RuleType.xxx())` 语法。
5. **依赖注入**：Service 必须加 `@Provide()` 装饰器，Controller 中用 `@Inject()` 注入。
6. **NestInterceptor**：MidwayJS 中**不存在**此类型，不要从 `@midwayjs/core` 导入任何 NestJS 相关类型。
7. **构建命令**：用 `midway-bin build -c`（不是 `tsc`），它会复制配置文件到 dist。
8. **环境区分**：通过 `cross-env NODE_ENV=local` 区分环境，配置文件自动按 `config.{env}.ts` 加载。
9. **日志**：使用 `@Logger()` 装饰器注入 `ILogger`，禁止 `console.log`。
10. **错误处理**：Controller 中不要 try-catch，全部交给全局 Filter 处理。

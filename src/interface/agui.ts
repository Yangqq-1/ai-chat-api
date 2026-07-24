/**
 * AG-UI 协议事件类型定义
 * @description 基于 AG-UI Protocol 规范定义的事件类型
 * @see https://docs.ag-ui.com/concepts/events
 */

// ==================== 事件类型枚举 ====================

/**
 * AG-UI 事件类型枚举
 */
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

/**
 * 消息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool' | 'developer';

/**
 * 基础事件接口
 */
export interface IBaseEvent {
  /** 事件类型 */
  type: EventType;
  /** 事件时间戳（可选） */
  timestamp?: number;
}

// ==================== 请求类型定义 ====================

/**
 * AG-UI 协议消息结构
 */
export interface IAguiMessage {
  /** 消息 ID */
  id: string;
  /** 消息角色 */
  role: MessageRole;
  /** 消息内容 */
  content: string;
  /** 工具名称（role 为 tool 时） */
  name?: string;
  /** 工具调用 ID（role 为 tool 时） */
  toolCallId?: string;
}

/**
 * AG-UI 协议工具定义
 */
export interface IAguiTool {
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description?: string;
  /** 工具参数 JSON Schema */
  parameters?: Record<string, any>;
}

/**
 * AG-UI 协议请求体
 */
export interface IAguiRunInput {
  /** 会话 ID，用于多轮对话 */
  threadId?: string;
  /** 本次运行 ID */
  runId?: string;
  /** 消息列表 */
  messages: IAguiMessage[];
  /** 前端工具定义 */
  tools?: IAguiTool[];
  /** 上下文信息 */
  context?: Array<{ name: string; value: any }>;
  /** 透传参数 */
  forwardedProps?: Record<string, any>;
}

// ==================== 生命周期事件 ====================

/**
 * 运行开始事件
 */
export interface IRunStartedEvent extends IBaseEvent {
  type: EventType.RUN_STARTED;
  /** 会话 ID */
  threadId: string;
  /** 运行 ID */
  runId: string;
}

/**
 * 运行结束事件
 */
export interface IRunFinishedEvent extends IBaseEvent {
  type: EventType.RUN_FINISHED;
  /** 会话 ID */
  threadId: string;
  /** 运行 ID */
  runId: string;
  /** 运行结果（可选） */
  result?: any;
}

/**
 * 运行错误事件
 */
export interface IRunErrorEvent extends IBaseEvent {
  type: EventType.RUN_ERROR;
  /** 错误信息 */
  message: string;
  /** 错误码（可选） */
  code?: string;
}

/**
 * 步骤开始事件
 */
export interface IStepStartedEvent extends IBaseEvent {
  type: EventType.STEP_STARTED;
  /** 步骤名称 */
  stepName: string;
}

/**
 * 步骤结束事件
 */
export interface IStepFinishedEvent extends IBaseEvent {
  type: EventType.STEP_FINISHED;
  /** 步骤名称 */
  stepName: string;
}

// ==================== 文本消息事件 ====================

/**
 * 文本消息开始事件
 */
export interface ITextMessageStartEvent extends IBaseEvent {
  type: EventType.TEXT_MESSAGE_START;
  /** 消息 ID */
  messageId: string;
  /** 消息角色 */
  role: MessageRole;
}

/**
 * 文本消息内容事件（流式增量）
 */
export interface ITextMessageContentEvent extends IBaseEvent {
  type: EventType.TEXT_MESSAGE_CONTENT;
  /** 消息 ID */
  messageId: string;
  /** 文本增量内容 */
  delta: string;
}

/**
 * 文本消息结束事件
 */
export interface ITextMessageEndEvent extends IBaseEvent {
  type: EventType.TEXT_MESSAGE_END;
  /** 消息 ID */
  messageId: string;
}

// ==================== 工具调用事件 ====================

/**
 * 工具调用开始事件
 */
export interface IToolCallStartEvent extends IBaseEvent {
  type: EventType.TOOL_CALL_START;
  /** 工具调用 ID */
  toolCallId: string;
  /** 工具名称 */
  toolCallName: string;
  /** 父消息 ID（可选） */
  parentMessageId?: string;
}

/**
 * 工具调用参数事件（流式增量）
 */
export interface IToolCallArgsEvent extends IBaseEvent {
  type: EventType.TOOL_CALL_ARGS;
  /** 工具调用 ID */
  toolCallId: string;
  /** 参数增量（JSON 片段） */
  delta: string;
}

/**
 * 工具调用结束事件
 */
export interface IToolCallEndEvent extends IBaseEvent {
  type: EventType.TOOL_CALL_END;
  /** 工具调用 ID */
  toolCallId: string;
}

/**
 * 工具调用结果事件
 */
export interface IToolCallResultEvent extends IBaseEvent {
  type: EventType.TOOL_CALL_RESULT;
  /** 消息 ID */
  messageId: string;
  /** 工具调用 ID */
  toolCallId: string;
  /** 工具执行结果 */
  content: string;
  /** 角色 */
  role?: string;
}

// ==================== 状态管理事件 ====================

/**
 * 状态快照事件
 */
export interface IStateSnapshotEvent extends IBaseEvent {
  type: EventType.STATE_SNAPSHOT;
  /** 完整状态快照 */
  snapshot: Record<string, any>;
}

/**
 * 状态增量事件（JSON Patch RFC 6902）
 */
export interface IStateDeltaEvent extends IBaseEvent {
  type: EventType.STATE_DELTA;
  /** JSON Patch 操作数组 */
  delta: Array<{
    op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
    path: string;
    value?: any;
    from?: string;
  }>;
}

/**
 * 消息快照事件
 */
export interface IMessagesSnapshotEvent extends IBaseEvent {
  type: EventType.MESSAGES_SNAPSHOT;
  /** 消息数组 */
  messages: IAguiMessage[];
}

// ==================== 特殊事件 ====================

/**
 * 自定义事件
 */
export interface ICustomEvent extends IBaseEvent {
  type: EventType.CUSTOM;
  /** 自定义事件名称 */
  name: string;
  /** 自定义事件值 */
  value: any;
}

// ==================== 事件联合类型 ====================

/**
 * 所有 AG-UI 事件的联合类型
 */
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

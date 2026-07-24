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
  /** 消息 ID */
  @Rule(RuleType.string().required())
  id: string;

  /** 消息角色 */
  @Rule(RuleType.string().valid('user', 'assistant', 'system', 'tool', 'developer').required())
  role: MessageRole;

  /** 消息内容 */
  @Rule(RuleType.string().allow('').required())
  content: string;

  /** 工具名称（可选） */
  @Rule(RuleType.string().optional())
  name?: string;

  /** 工具调用 ID（可选） */
  @Rule(RuleType.string().optional())
  toolCallId?: string;
}

/**
 * AG-UI 运行请求 DTO
 */
export class AguiRunDTO {
  /** 会话 ID */
  @Rule(RuleType.string().optional())
  threadId?: string;

  /** 运行 ID */
  @Rule(RuleType.string().optional())
  runId?: string;

  /** 消息列表 */
  @Rule(RuleType.array().items(RuleType.object({
    id: RuleType.string().required(),
    role: RuleType.string().valid('user', 'assistant', 'system', 'tool', 'developer').required(),
    content: RuleType.string().allow('').required(),
    name: RuleType.string().optional(),
    toolCallId: RuleType.string().optional(),
  })).min(1).required())
  messages: ChatMessageDTO[];

  /** 前端工具定义 */
  @Rule(RuleType.array().optional())
  tools?: any[];

  /** 上下文信息 */
  @Rule(RuleType.array().optional())
  context?: Array<{ name: string; value: any }>;

  /** 透传参数 */
  @Rule(RuleType.object().optional())
  forwardedProps?: Record<string, any>;
}

/**
 * 简单聊天请求 DTO（兼容简单场景）
 */
export class SimpleChatDTO {
  /** 消息内容 */
  @Rule(RuleType.string().min(1).max(10000).required().messages({
    'string.empty': '消息内容不能为空',
    'string.max': '消息内容不能超过 10000 个字符',
  }))
  message: string;

  /** 会话 ID */
  @Rule(RuleType.string().optional())
  sessionId?: string;
}

/**
 * 聊天服务
 * @description 处理 AG-UI 协议相关的业务逻辑，包括 SSE 流式响应
 */
import { Provide, Inject, Logger } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ILogger } from '@midwayjs/logger';
import { randomUUID } from 'crypto';
import {
  EventType,
  IAguiRunInput,
  AguiEvent,
} from '../interface/agui';

@Provide()
export class ChatService {
  @Inject()
  ctx: Context;

  @Logger()
  logger: ILogger;

  /**
   * 处理 AG-UI 协议的流式请求
   * @param input AG-UI 运行输入
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

    // 获取用户最后一条消息
    const lastMessage = input.messages[input.messages.length - 1];
    const userContent = lastMessage?.content || '';

    this.logger.info(
      '[ChatService] AG-UI stream started: threadId=%s, runId=%s, message=%s',
      threadId,
      runId,
      userContent.substring(0, 50)
    );

    try {
      // 1. 发送 RUN_STARTED 事件
      this.sendEvent({
        type: EventType.RUN_STARTED,
        threadId,
        runId,
        timestamp: Date.now(),
      });

      // 2. 发送 TEXT_MESSAGE_START 事件
      this.sendEvent({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: 'assistant',
        timestamp: Date.now(),
      });

      // 3. 模拟流式输出（TODO: 替换为实际 AI 服务调用）
      const replyText = await this.generateReply(userContent);
      const chunks = this.splitIntoChunks(replyText, 4);

      for (const chunk of chunks) {
        this.sendEvent({
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta: chunk,
          timestamp: Date.now(),
        });
        // 模拟流式延迟
        await this.sleep(50);
      }

      // 4. 发送 TEXT_MESSAGE_END 事件
      this.sendEvent({
        type: EventType.TEXT_MESSAGE_END,
        messageId,
        timestamp: Date.now(),
      });

      // 5. 发送 RUN_FINISHED 事件
      this.sendEvent({
        type: EventType.RUN_FINISHED,
        threadId,
        runId,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error('[ChatService] Stream error: %s', error.message);
      // 发送 RUN_ERROR 事件
      this.sendEvent({
        type: EventType.RUN_ERROR,
        message: error.message || '处理请求时发生错误',
        code: 'STREAM_ERROR',
        timestamp: Date.now(),
      });
    } finally {
      // 结束响应
      ctx.res.end();
    }
  }

  /**
   * 简单聊天处理（非流式）
   * @param message 用户消息
   * @param sessionId 会话 ID
   */
  async simpleChat(message: string, sessionId?: string) {
    const reply = await this.generateReply(message);
    return {
      sessionId: sessionId || randomUUID(),
      reply,
      timestamp: Date.now(),
    };
  }

  /**
   * 生成回复
   * TODO: 后续替换为实际的 AI 模型调用（如通义千问、OpenAI 等）
   * @param userMessage 用户消息
   */
  private async generateReply(userMessage: string): Promise<string> {
    // 占位实现：后续接入实际 AI 服务
    return `[AI 回复] 收到你的消息："${userMessage}"。这是一个基于 AG-UI 协议的流式响应示例。后续可在此处接入通义千问、OpenAI 等大模型服务。`;
  }

  /**
   * 发送 SSE 事件
   * @param event AG-UI 事件
   */
  private sendEvent(event: AguiEvent): void {
    const data = JSON.stringify(event);
    this.ctx.res.write(`data: ${data}\n\n`);
  }

  /**
   * 将文本分割为小块（模拟流式输出）
   * @param text 原始文本
   * @param chunkSize 每块字符数
   */
  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 延迟工具方法
   * @param ms 毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

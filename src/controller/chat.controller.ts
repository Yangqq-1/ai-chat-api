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
   * AG-UI 协议流式接口
   * @summary 符合 AG-UI 协议的 SSE 流式聊天接口
   * @description
   * 请求格式：POST /api/chat/agent
   * Content-Type: application/json
   * Accept: text/event-stream
   *
   * 响应格式：SSE 事件流
   * data: {"type":"RUN_STARTED","threadId":"xxx","runId":"xxx"}
   * data: {"type":"TEXT_MESSAGE_START","messageId":"xxx","role":"assistant"}
   * data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"xxx","delta":"你好"}
   * data: {"type":"TEXT_MESSAGE_END","messageId":"xxx"}
   * data: {"type":"RUN_FINISHED","threadId":"xxx","runId":"xxx"}
   */
  @Post('/agent')
  async agent(@Body() body: AguiRunDTO): Promise<void> {
    await this.chatService.handleAguiStream(body);
  }

  /**
   * 简单聊天接口（非流式）
   * @summary 简单的请求-响应式聊天接口，适用于不需要流式的场景
   */
  @Post('/send')
  async sendMessage(@Body() body: SimpleChatDTO) {
    const result = await this.chatService.simpleChat(
      body.message,
      body.sessionId
    );
    return successResponse(result);
  }
}

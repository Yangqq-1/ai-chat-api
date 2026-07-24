# AI Chat API

基于 Midway + Koa 的后端服务，提供 AI 聊天对话的 API 接口。

## 技术栈

- **框架**: Midway 3 + Koa
- **语言**: TypeScript
- **CORS**: @koa/cors

## 快速开始

```bash
# 安装依赖
npm i

# 启动开发服务器
npm start

# 构建
npm run build
```

启动后 API 服务运行在 `http://localhost:7001`。

## 项目结构

```
src/
├── controller/     ← 控制器（路由处理）
├── config/         ← 配置文件
├── configuration.ts ← 应用配置
```

## 接口说明

| 方法   | 路径             | 说明         |
| ------ | ---------------- | ------------ |
| GET    | /api/health      | 健康检查     |
| POST   | /api/chat/send   | 发送聊天消息 |

## 跨域配置

开发环境下已配置 CORS，允许前端 `http://localhost:5173` 跨域访问。

生产环境请根据实际需求调整 CORS 配置。

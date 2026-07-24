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
    // 注册全局异常过滤器
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}

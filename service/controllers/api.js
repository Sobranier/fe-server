const request = require('request');
const apiController = require('../app/index.js');

// 对经过这边的api进行分发
const defaultController =  async (ctx, next) => {
  if (apiController[ctx.params.controller]) {
    ctx.body = apiController[ctx.params.controller](ctx);
  } else {
    ctx.body= {
      data: {
        info: ctx,
        title: '未找到对应自定义服务'
      },
      ret: 0
    }
  }
}

const apiBaseController = async (ctx, next) => {
  ctx.body = {
    data: 'api base'
  }
}

const getController = async (ctx, next) => {
  ctx.body = {
    data: 'api只能通过post方式调用',
    ret: 0
  }
}

module.exports = {
  defaultController,
  apiBaseController,
  getController
}

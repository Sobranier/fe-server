const Koa = require('koa');
const path = require('path');
const http = require('http');
const views = require('koa-views');
const onError = require('koa-onerror');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Raven = require('raven');
const config = require('config');
const log4js = require('log4js');

log4js.configure({
  appenders: {
    out: {
      type: 'console',
    }
  },
  categories: {
    default: {
      appenders: ['out'], level: 'trace', 'replaceConsole': true
    }
  },
  disableClustering: true,
  pm2: true,
  // pm2InstanceVar: 'fe-server'
});
const log4 = log4js.getLogger('default');

const currentPath = process.cwd();

const MCServer = function(options) {
  if(!(this instanceof MCServer)){
    return new MCServer(options);
  }
  this.options = options || config;
  this.app = new Koa();
};

MCServer.logger = log4;

MCServer.Controller = function() {
  return this;
};

MCServer.Controller.prototype.send = function(body) {
  this.ctx.body = body;
};

MCServer.prototype.loadDefault = function(tool) {
  Raven.config(config.sentry.DSN).install();

  // Logger 放置位置需要靠前一些
  this.app.use(logger((str, args) => {
    log4.trace(str);
  }));

  // 模版资源
  this.app.use(views(path.join(currentPath, 'views'), {
    extension: 'hbs',
    map: { hbs: 'handlebars' },
  }));

  // body处理
  this.app.use(bodyParser());

  // 错误模版 怎样生效待check
  onError(this.app, {
    template: 'service/views/500.hbs'
  });

  // 错误处理
  // sentry 注册
  this.app.on('error', error => {
    error.extraName = 'appError';
    Raven.captureException(error, function (error, eventId) {
      log4.trace('Reported app error: ' + eventId);   // eventId也可以记录到log当中方便追溯
    });
  })

  process.on('uncaughtException', function(error) {
    err.name = "UncaughtExceptionError";
    Raven.captureException(error, function (error, eventId) {
      log4.fatal('Reported uncaughtException error: ' + eventId);
      process.exit(1);
    });
  });
  return this;
}

MCServer.prototype.load = function(tool) {
  if(typeof tool === 'string') {
    log4.trace("Load Middlewares: " + tool);
    try {
      tool = require(path.join(this.options.path.middlewares, tool));
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
      tool = require(path.join(tool));
    }
  }

  /*
  if (tool.constructor.name === 'GeneratorFunction') {
    middleware = tool;
  } else {
    middleware = tool(this.app, this.options);
  }
  */

  if (tool) {
    this.app.use(tool);
  }

  return this;
};

MCServer.prototype.start = function(callback) {
  const server = http.createServer(this.app.callback());
  const port = this.options.port;
  server.listen(port);

  // 启动错误
  server.on('error', error => {
    error.extraName = 'startError';
    Raven.captureException(error, function (error, eventId) {
      log4.error('Reported start error: ' + eventId);
    });
    // 下面的代码根本没有生效
    if (error.syscall !== 'listen') {
      throw error
    }

    switch(error.code) {
      case 'EACCES':
        log4.error(`${port} requires elevated privileges`)
        process.exit(1)
        break
      case 'EADDRINUSE':
       log4.error(`${port} is already in use`)
       process.exit(1)
       break
      default:
        throw error
    }
  })

  // 启动监听
  server.on('listening', () => {
    let err = new Error('Start');
    err.name = '项目启动'
    Raven.captureException(err, {
      level: 'info',
      extra: this.options,
      tags: {
        port
      }
    }, function (error, eventId) {
      log4.trace('Reported start: ' + eventId + ' on port: ' + port);
    });
    callback && callback();
  })

  return this;
};

module.exports = MCServer;

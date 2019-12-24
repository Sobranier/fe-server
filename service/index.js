const Koa = require('koa');
const path = require('path');
const http = require('http');
const views = require('koa-views');
const onError = require('koa-onerror');
const bodyParser = require('koa-bodyparser');
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
  pm2: true
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
  this.app.on('error', error => {
    log4.error('MCServer -- App error: ', error);
  })

  process.on('uncaughtException', function(error) {
    log4.fatal(`MCServer -- UncaughtException error: ${process.pid}`, error);
    process.exit(1);
  });

  return this;
}

MCServer.prototype.load = function(tool) {
  if(typeof tool === 'string') {
    log4.trace(`MCServer -- Load Middlewares: ${tool}`);
    try {
      tool = require(path.join(this.options.path.middlewares, tool));
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
      tool = require(path.join(tool));
    }
  }

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
    log4.error('MCServer -- Start error');
    // 下面的代码根本没有生效
    if (error.syscall !== 'listen') {
      throw error
    }

    switch(error.code) {
      case 'EACCES':
        log4.error(`MCServer -- ${port} requires elevated privileges`)
        process.exit(1)
        break
      case 'EADDRINUSE':
        log4.error(`MCServer -- ${port} is already in use`)
        process.exit(1)
        break
      default:
        throw error
    }
  })

  // 启动监听
  server.on('listening', () => {
    callback && callback();
  })

  return this;
};

module.exports = MCServer;

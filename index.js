const http = require('http'),express=require('express'),app=express(),fs= require('fs'),
cookieParser = require('cookie-parser'),bodyParser = require('body-parser'),mongoose=require('mongoose')
/** Configs */
appConfig=require('./app/config/appConfig'),
/** Libs */
logger= require('./app/libs/loggerLib'),routeLoggerMiddleware = require('./app/middlewares/routeLogger.js'),
globalErrorMiddleware = require('./app/middlewares/appErrorHandler');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(routeLoggerMiddleware.logIp);
app.use(globalErrorMiddleware.globalErrorHandler);
app.set('view engine', 'ejs');
app.use( express.static( "assets" ) );

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    next();
});

fs.readdirSync('./app/models').forEach(file=>{
    if(~file.indexOf('.js'))
    require(`./app/models/${file}`)
})
fs.readdirSync('./app/routes').forEach(file=>{
    if(~file.indexOf('.js'))
    require(`./app/routes/${file}`).setRouter(app)
})

app.use(globalErrorMiddleware.globalNotFoundHandler);

const server = http.createServer(app).listen(appConfig.port)
server.on('listening',()=>{
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    ('Listening on ' + bind);
    logger.info('server listening on port' + addr.port, 'serverOnListeningHandler', 10);
    let db = mongoose.connect(appConfig.db.uri);
})
server.on('error',(error)=>{
    if (error.syscall !== 'listen') {
        logger.error(error.code + ' not equal listen', 'serverOnErrorHandler', 10)
        throw error;
      } 
    
      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          logger.error(error.code + ':elavated privileges required', 'serverOnErrorHandler', 10);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(error.code + ':port is already in use.', 'serverOnErrorHandler', 10);
          process.exit(1);
          break;
        default:
          logger.error(error.code + ':some unknown error occured', 'serverOnErrorHandler', 10);
          throw error;
      }
})
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
/**
 * database connection settings
 */
mongoose.connection.on('error', function (err) {
    console.log('database connection error');
    console.log(err)
    logger.error(err,
      'mongoose connection on error handler', 10)
    //process.exit(1)
  }); // end mongoose connection error
  
  mongoose.connection.on('open', function (err) {
    if (err) {
      console.log("database error");
      console.log(err);
      logger.error(err, 'mongoose connection open handler', 10)
    } else {
      console.log("database connection open success");
      logger.info("database connection open",
        'database connection open handler', 10)
    }
    //process.exit(1)
  }); // enr mongoose connection open handler
  

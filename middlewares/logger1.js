import { transports as _transports, createLogger, format as _format } from 'winston'
const remoteLog = new _transports.Http({
    host: "localhost",
    port: 3001,
    path: "/errors"
})

const consoleLog = new _transports.Console()

export const requestLogger = createRequestLogger([consoleLog])
export const errorLogger = createErrorLogger([remoteLog, consoleLog])
export const responseLogger=createResponseLogger([consoleLog])
function createRequestLogger(transports) {
    const requestLogger = createLogger({
        format: getRequestLogFormatter(),
        transports: transports
    })

    return function logRequest(req, res, next) {
        requestLogger.info({req, res})
        next()
    }
}

function createResponseLogger(transports) {
    const responseLogger = createLogger({
        format: getResponseLogFormatter(),
        transports: transports,
        level:'info'
    })

    return function logResponse(req, res, next) {
        responseLogger.info({req, res})
        
    }
}

function createErrorLogger(transports) {
    const errLogger = createLogger({
        level: 'error',
        transports: transports
    })

    return function logError(err, req, res, next) {
        errLogger.error({err, req, res})
        next()
    }
}

function getRequestLogFormatter() {
    const {combine, timestamp, printf} = _format;

    return combine(
        timestamp(),
        printf(info => {
            const {req, res} = info.message;
            return `${info.timestamp} HTTP/${req.httpVersion}/${req.method} ${info.level}: ${req.hostname}${req.port || ''}${req.originalUrl}`;
        })
    );
}

function getResponseLogFormatter() {
    const {combine, timestamp, printf} = _format;

    return combine(
        timestamp(),
        printf(info => {
            const {req, res} = info.message;
            return `${info.timestamp} ${info.level}: ${req.hostname}${req.port || ''}${req.originalUrl}`;
        })
    );
}
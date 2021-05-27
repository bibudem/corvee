import path from 'path'
import fs from 'fs'

import {
    addColors,
    createLogger,
    format,
    transports
} from 'winston';
import tracer from 'tracer';
import colors from 'colors/safe';

import {
    hookStdout
} from './hook-stdout'

const PROJECT_ROOT = path.join(__dirname, '..')

const {
    // colorize,
    combine,
    timestamp,
    // label,
    printf
} = format

// const colorizer = colorize()

const winstonLevels = {
    verbose: 7,
    debug: 6,
    info: 5,
    //log: 4,
    warn: 3,
    error: 2,
    me: 1,
    z: 0
}
const winstonLevelColors = {
    verbose: 'gray',
    debug: 'cyan',
    info: 'green',
    log: 'white',
    warn: 'yellow',
    error: 'red',
    me: 'red whiteBG',
    z: 'white redBG'
}

const tracerLevels = ['verbose', 'debug', 'info', 'log', 'warn', 'error', 'me', 'z'];
const tracerLevelColors = {
    verbose: colors.gray,
    debug: colors.cyan,
    info: colors.green,
    log: colors.white,
    warn: colors.yellow,
    error: colors.red,
    me: [colors.red, colors.bgWhite],
    z: [colors.white, colors.bgRed]
}

const defaultLevel = 'debug'

//addColors(winstonLevelColors)

try {
    fs.unlinkSync(path.join(process.mainModule.path, 'console.log'))
} catch (e) {}

const fileLogger = createLogger({
    level: defaultLevel,
    levels: winstonLevels,
    format: combine(timestamp({
        format: 'HH:mm:ss.SSS'
    }), printf((info) => {
        const stackInfo = getStackInfo(12);

        // returns:
        // method: sp[1],
        // relativePath: path.relative(PROJECT_ROOT, sp[2]),
        // line: sp[3],
        // pos: sp[4],
        // file: path.basename(sp[2]),
        // stack: stacklist.join('\n')

        return `${info.timestamp} <${info.level.toUpperCase()}> ${stackInfo.relativePath}:${stackInfo.line} ${stackInfo.method} ${info.message}`
    })),
    // defaultMeta: {
    //     service: 'user-service'
    // },
    //transports: Object.values(customTransports)
    transports: [
        new transports.File({
            filename: path.join(process.mainModule.path, 'console.log'),
        })
    ]
});

fileLogger.setLevel = (level) => {
    Object.keys(transports).forEach(key => {
        transports[key].level = level;
    })
}

hookStdout((string) => {
    fileLogger.log(string)
})

const consoleLogger = tracer.colorConsole({
    methods: tracerLevels,
    level: defaultLevel,
    filters: tracerLevelColors,
    format: '{{timestamp}} <{{title}}> {{file}}:{{line}} {{method}} {{message}}',
    preprocess: data => {
        // console.log((new Error()).stack.split('\n').slice(3))
        // process.exit()
        const stackInfo = getStackInfo(5)
        Object.assign(data, stackInfo)
        data.title = data.title.toUpperCase()
    },
    dateformat: "HH:MM:ss.l"
})

consoleLogger.setLevel = tracer.setLevel;

const logger = {
    setLevel(level) {
        fileLogger.setLevel(level);
        consoleLogger.setLevel(level)
    },
    group() {
        console.group.apply(console, arguments)
    },
    groupEnd() {
        console.groupEnd.apply(console, arguments)
    }
}

tracerLevels.forEach(level => {
    logger[level] = function() {
        [fileLogger, consoleLogger].forEach(logger => logger[level].apply(logger, arguments));
    }
})

logger.log = logger.info

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments(args) {
    args = Array.prototype.slice.call(args)

    var stackInfo = getStackInfo(1)

    if (stackInfo) {
        // get file path relative to project root
        var calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'

        if (typeof(args[0]) === 'string') {
            args[0] = calleeStr + ' ' + args[0]
        } else {
            args.unshift(calleeStr)
        }
    }

    return args
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo(stackIndex) {
    // get call stack, and analyze it
    // get all file, method, and line numbers
    var stacklist = (new Error()).stack.split('\n').slice(3)

    // stack trace format:
    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
    var stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

    var s = stacklist[stackIndex] || stacklist[0]
    var sp = stackReg.exec(s) || stackReg2.exec(s)

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(PROJECT_ROOT, sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join('\n')
        }
    }
}

export {
    logger as console,
    tracerLevels as levels
}
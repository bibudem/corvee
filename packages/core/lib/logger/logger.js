import { join, basename, relative } from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { createLogger, format, transports } from 'winston'
import tracer from 'tracer'
import colors from 'colors/safe.js'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { hookStdout } from './hook-stdout.js'

const PROJECT_ROOT = process.cwd()

const today = new Date()
const year = today.getFullYear()
const month = `${today.getMonth() + 1}`.padStart(2, '0')
const day = `${today.getDate()}`.padStart(2, '0')

const defaultTodayDashedPrefix = `${year}-${month}-${day}`

const argv = yargs(hideBin(process.argv))
    .options({
        j: {
            alias: 'job',
            default: defaultTodayDashedPrefix,
            describe: `Job id. Defaults to today\'s date.`,
            type: 'string'
        },
        r: {
            alias: 'resume',
            default: false,
            type: 'boolean',
            describe: 'Resumes a previously stoped job. Requires --job options.',
            implies: 'j'
        }
    })
    .help()
    .argv

// @ts-ignore
const job = argv.job

const { combine, timestamp, printf } = format

const winstonLevels = {
    verbose: 6,
    debug: 5,
    info: 4,
    //log: 3,
    warn: 2,
    error: 1,
    todo: 0
}

const tracerLevels = ['verbose', 'debug', 'info', 'log', 'warn', 'error', 'todo']
const tracerLevelColors = {
    verbose: colors.gray,
    debug: colors.cyan,
    info: colors.white,
    log: colors.white,
    warn: colors.yellow,
    error: colors.red,
    todo: [colors.white, colors.bgRed]
}

const DEFAULT_LEVEL = 'debug'

const basePath = process.cwd()
// @ts-ignore
const logFilePath = join(basePath, 'logs', `${job}-${argv.$0.split('.')[0]}.log`)

Error.stackTraceLimit = 20

try {
    fs.unlinkSync(logFilePath)
} catch (e) { }

const fileLogger = createLogger({
    level: DEFAULT_LEVEL,
    levels: winstonLevels,
    format: combine(timestamp({
        format: 'HH:mm:ss.SSS'
    }), printf((info) => {

        const stackInfo = getStackInfo(12)

        return `${info.timestamp} <${info.level.toUpperCase()}> ${stackInfo.relativePath}:${stackInfo.line} ${stackInfo.method} ${info.message}`.replace(/\x1B\[\d+m/g, '') // strip colors
    })),

    transports: [
        new transports.File({
            filename: logFilePath,
        })
    ]
})

fileLogger.setLevel = (level) => {
    Object.keys(transports).forEach(key => {
        transports[key].level = level
    })
}

hookStdout((string) => {
    fileLogger.log(string)
})

const consoleLogger = tracer.colorConsole({
    methods: tracerLevels,
    level: DEFAULT_LEVEL,
    filters: tracerLevelColors,
    format: '{{timestamp}} <{{title}}> {{file}}:{{line}} {{method}} {{message}}',
    preprocess: data => {
        const stackInfo = getStackInfo(5)
        Object.assign(data, stackInfo)
        data.title = data.title.toUpperCase()
    },
    dateformat: "HH:MM:ss.l"
})

consoleLogger.setLevel = tracer.setLevel

/**
 * @typedef {Object<string, any>} LoggerType
 */

/**
 * @type LoggerType
 */
const logger = {
    /**
     * @param {any} level
     */
    setLevel(level) {
        fileLogger.setLevel(level)
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
    logger[level] = function () {
        [fileLogger, consoleLogger].forEach(logger => logger[level].apply(logger, arguments))
    }
})

logger.log = logger.info

/**
 * Parses and returns info about the call stack at the given index.
 * @param {number} stackIndex
 */
function getStackInfo(stackIndex) {
    // get call stack, and analyze it
    // get all file, method, and line numbers
    var stacklist = (new Error()).stack.split('\n').slice(3)

    // stack trace format:
    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
    var stackReg2 = /at(.*)(file:\/\/\/.+):(\d*):(\d*)/gi

    var s = stacklist[stackIndex] || stacklist[0]
    var sp = stackReg.exec(s) || stackReg2.exec(s)

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: relative(PROJECT_ROOT, fileURLToPath(sp[2])),
            line: sp[3],
            pos: sp[4],
            file: basename(sp[2]),
            stack: stacklist.join('\n')
        }
    }
}

export {
    logger as console,
    tracerLevels as levels
}
import tracer from 'tracer';
import colors from 'colors/safe';

const levels = ['verbose', 'debug', 'info', 'log', 'warn', 'error', 'me', 'z'];
const levelColors = {
    verbose: colors.gray,
    debug: colors.cyan,
    info: colors.green,
    warn: colors.yellow,
    error: colors.red,
    z: [colors.bgWhite, colors.red]
}

const console = tracer.colorConsole({
    methods: levels,
    level: 'z',
    filters: levelColors,
    //format: "<{{title}}> {{message}} (in {{file}}:{{line}})"
    dateformat: "HH:MM:ss.L"
    // transport: [
    //     function (data) {
    //         fs.appendFile(config.payment.logFile, data.output + '\n', (err) => {
    //             if (err) throw err;

    //         })
    //     }
    // ]
})

console.setLevel = tracer.setLevel;

export {
    console,
    levels
}
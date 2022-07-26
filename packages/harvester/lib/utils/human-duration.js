import moment from 'moment'

export function humanDuration(ms) {

    const duration = moment.duration(ms)._data;
    const d = [];

    if (duration.days > 0) {
        d.push(`${duration.days} days`)
    }

    if (duration.hours > 0) {
        d.push(`${duration.hours} hours`)
    }

    if (duration.minutes > 0) {
        d.push(`${duration.minutes} minutes`)
    }

    d.push(`${duration.seconds}.${duration.milliseconds} seconds`)

    return d.join(' ');
}
export default function wait(timeToWait = 0) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, timeToWait);
    });
};
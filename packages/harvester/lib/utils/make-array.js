export function makeArray() {
    return Array.from(arguments).reduce((acc, item) => {
        Array.isArray(item) ? acc.push(...item) : acc.push(item)
        return acc;
    }, [])
}
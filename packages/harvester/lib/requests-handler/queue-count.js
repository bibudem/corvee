// Constants.
const EMPTY_LIST_RECORDS_AMOUNT = 0;
const DEFAULT_INCREMENT_AMOUNT = 1;
const DEFAULT_DECREMENT_AMOUNT = 1;

/**
 * Queue length.
 */
export class QueueCount {
    /**
     * Queue length constructor.
     */
    constructor() {
        // Init.
        this.length = EMPTY_LIST_RECORDS_AMOUNT;
    }

    /**
     * Increment.
     * @param {number} [amount] Records amount to increment.
     * @returns {number} Records amount after increment operation.
     */
    increment(amount = DEFAULT_INCREMENT_AMOUNT) {
        // Increment records amount and return changed value.
        this.length += amount;
        return this.length;
    }

    /**
     * Decrement.
     * @param {number} [amount] Records amount to decrement.
     * @returns {number} Records amount after decrement operation.
     */
    decrement(amount = DEFAULT_DECREMENT_AMOUNT) {
        // Decrement records amount and return changed value.
        this.length -= amount;
        if (this.length < 0) {
            this.length = 0;
        }
        return this.length;
    }
}
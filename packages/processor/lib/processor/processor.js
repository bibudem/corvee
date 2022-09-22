import EventEmitter from 'eventemitter3';
import isPlainObject from 'is-plain-object'
import ProgressBar from 'progress'
import { LEVELS } from './levels.js'

import { messageFactory } from '../messages.js'
import { console, inspect } from '@corvee/core'

class FilterPriorities extends Map {

    constructor() {
        super();
    }

    get(key) {
        return super.has(key) ? super.get(key) : -Infinity;
    }
}

export class CorveeProcessor extends EventEmitter {
    constructor({
        filters = [],
        errors = [],
        messages = {},
        ...config
    } = {}) {
        super()
        this.records = []
        this.unfilteredRecords = []
        this.filters = []
        this.messages = messages
        this.filterPriorities = new FilterPriorities()
        this._errors = []
        this.config = config
        this.config.errorLevel = this.config.errorLevel || LEVELS.WARNING
        this.filtersWithoutMessages = new Set()

        this.getMessage = messageFactory(this.messages)

        this.addFilters(filters)
        this.addErrors(errors)
    }

    isMuted(record) {

        return record.reports.every(report => LEVELS[report.level] < this.config.errorLevel)
    }

    addErrors(...errors) {

        this._errors = this._errors.concat(...errors.flat(Infinity).map(error => {
            error.matches = 0;
            error.test = error.test.bind(this);
            return error;
        }));

        return this;
    }

    addFilters(...filters) {

        this.filters = this.filters.concat(...filters.flat(Infinity).map(filter => {

            console.verbose(`Adding filter ${filter.code}`)

            filter.matches = 0;
            filter.test = filter.test.bind(this);
            filter.priority = filter.priority || 0;

            this.filterPriorities.set(filter.code, filter.priority);

            if (typeof this.messages[filter.code] === 'undefined') {
                this.filtersWithoutMessages.add(filter.code)
            }

            return filter;
        }));

        return this;
    }

    async process(records) {
        if (!Array.isArray(records)) {
            records = [records];
        }

        const reportType = {
            level: 'error'
        }

        const filteredRecords = new Set();

        // Normalizing records structure
        records = records.map(record => {
            record._filtered = false;
            record.reports = (record.reports || []).map(report => {

                return {
                    ...reportType,
                    ...report
                }
            });
            return record;
        });

        this.records = [...this.records, ...records]

        var nbIn = this.records.length,
            excluded = {},
            excludedCount = 0,
            self = this;

        function doFilter(records, filter) {
            const result = [];

            records.forEach((record, i) => {

                try {
                    self.emit('beforeProcess', record, filter)

                    const testResult = filter.test(record, filter);

                    if (testResult) {
                        filter.matches++;
                        filteredRecords.add(record.id);
                        record._filtered = true;

                        if (isPlainObject(testResult)) {
                            record = testResult;
                        } else {
                            let report, index;

                            if (record.reports.some(report => report.code === filter.code)) {
                                report = record.reports.find(report => report.code === filter.code)
                                index = record.reports.findIndex(report => report.code === filter.code)
                                record.reports.splice(index, 1)
                            } else {
                                report = {
                                    code: filter.code,
                                    level: 'level' in filter ? filter.level : 'error'
                                }
                                index = record.reports.length
                            }

                            if (typeof testResult === 'string') {
                                report._message = testResult
                            }

                            record.reports.splice(index, 0, report)
                        }

                        self.emit('filtered', record, filter)
                        self.emit(filter.code, record, filter);

                        if (filter.exclude) {
                            excludedCount++;
                            if (typeof excluded[record.id] === 'undefined') {
                                excluded[record.id] = filter.code;
                            }
                            self.emit('excluded', record, filter)
                            return;
                        }


                    }
                } catch (e) {
                    console.error(e)
                    console.info('At record', record)
                    process.exit()
                }

                result.push(record)

            })
            return result;
        }

        function doFilterLevels(records) {

            const errorLevels = Object
                .keys(LEVELS)
                .filter(level => LEVELS[level] >= self.config.errorLevel)
                .map(level => level.toLowerCase());

            console.log(`effective levels: ${JSON.stringify(errorLevels)}`)

            return records.map(record => {

                // Filtering reports by level

                const highestLevel = Math.max(...record.reports.filter(report => errorLevels.includes(report.level)).map(report => LEVELS[report.level.toUpperCase()]))
                //console.log(record)
                record.reports = record.reports.filter(report => LEVELS[report.level.toUpperCase()] === highestLevel);

                return record;

            })
        }

        function doFilterPriorities(records) {

            const errorLevels = Object
                .keys(LEVELS)
                .filter(level => LEVELS[level] >= self.config.errorLevel)
                .map(level => level.toLowerCase());

            return records.map(record => {

                let reports = [];

                // Filtering reports priorities by level

                errorLevels.forEach(errorLevel => {

                    const reportsByLevel = record.reports.filter(report => report.level === errorLevel);

                    if (reportsByLevel.length > 0) {

                        const maxPriority = Math.max(...reportsByLevel.map(report => {
                            const reportCode = report.code;
                            const reportFilterPriority = self.filterPriorities.get(reportCode);
                            // console.log(`code: ${reportCode}, priority: ${reportFilterPriority}`);
                            return reportFilterPriority;
                        }));

                        const filteredReportsForThisLevel = reportsByLevel.filter(report => self.filterPriorities.get(report.code) >= maxPriority);

                        // console.log(`maxPriority: ${maxPriority}`);
                        // console.log(filteredReportsForThisLevel)
                        reports = reports.concat(filteredReportsForThisLevel);
                    }
                })

                record.reports = reports;
                // console.log(reports);
                // process.exit();
                return record;

            })
        }

        function doAddMessages(records) {
            const result = [];

            records.forEach((record) => {

                // Adding messages

                record.reports.forEach(report => {
                    var message = self.getMessage(report.code, report._message);
                    delete report._message
                    if (message) {
                        report.message = message;
                    }
                })

                result.push(record)

            })

            return result;
        }

        console.debug(`Processing ${this._errors.length} custom errors...`);

        this._errors.forEach(error => {
            this.records = doErrors(this.records, error)
        });

        console.debug(`Processing ${this.filters.length} filters...`);


        const progressBar = new ProgressBar('[:bar] :percent :etas -- current filter: :filter', { total: this.filters.length, width: 60 })

        this.filters.forEach(filter => {
            progressBar.tick({ filter: filter.code })
            this.records = doFilter(this.records, filter)
        });

        this.unfilteredRecords = this.records
            .filter(record => !record._filtered)
            .map(record => {
                const newRecord = structuredClone(record)
                this.emit('unfiltered', newRecord)
                return newRecord
            })

        console.log('Filtering report by level...')

        this.records = doFilterLevels(this.records);

        console.log('Filtering reports by priority...');

        this.records = doFilterPriorities(this.records);

        console.log('Adding messages...')

        this.records = doAddMessages(this.records);

        const perFilter = this.filters.map(({
            code,
            matches,
            exclude = false,
            level = 'error'
        }) => ({
            code,
            matches,
            excluded: exclude,
            level
        }))

        return {
            nbIn,
            excludedCount,
            excluded,
            filtered: filteredRecords.size,
            filtersWithoutMessages: Array.from(self.filtersWithoutMessages.values()),
            nbOut: records.length,
            records: this.records,
            unfilteredRecords: this.unfilteredRecords,
            perFilter
        };
    }
}

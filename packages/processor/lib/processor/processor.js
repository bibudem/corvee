import EventEmitter from 'eventemitter3';
import isPlainObject from 'is-plain-object'
import {
    LEVELS
} from './levels'

import {
    messageFactory
} from '../messages'

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
        ...config
    } = {}) {
        super();
        this.records = [];
        this._filters = [];
        this.filterPriorities = new FilterPriorities();
        this._errors = [];
        this.config = config;
        this.config.errorLevel = this.config.errorLevel || LEVELS.WARNING;
        this.addPlugin(filters);
        this.addErrors(errors);
        this.getMessage = messageFactory(this.config.messages);
        this.filtersWithoutMessages = new Set();
    }

    isMuted(report) {

        return report.reports.every(report => LEVELS[report.level] < this.config.errorLevel)
    }

    addErrors(...errors) {

        this._errors = this._errors.concat(...errors.flat(Infinity).map(error => {
            error.matches = 0;
            error.test = error.test.bind(this);
            return error;
        }));

        return this;
    }

    addPlugin(...filters) {

        this._filters = this._filters.concat(...filters.flat(Infinity).map(filter => {
            filter.matches = 0;
            filter.test = filter.test.bind(this);
            filter.priority = filter.priority || 0;
            this.filterPriorities.set(filter.code, filter.priority);
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

        // Normalizing records structure
        records = records.map(record => {
            record.reports = (record.reports || []).map(report => {
                return {
                    ...reportType,
                    ...report
                }
            });
            return record;
        });

        this.records = records;
        const filteredrecords = new Set();
        var nbIn = this.records.length,
            excluded = {},
            excludedCount = 0,
            self = this;

        function doCustomErrors(records, customError) {
            const result = [];

            records.forEach((record, i) => {
                const testResult = customError.test(record);

                if (testResult) {
                    customError.matches++;
                    if (isPlainObject(testResult)) {
                        record = testResult;
                    } else {
                        const report = {
                            code: error.code,
                            level: 'level' in customError ? customError.level : 'error'
                        }
                        if (typeof testResult === 'string') {
                            report.content = testResult
                        }
                        record.reports.push(report)
                        // record[i] = record;
                    }
                    self.emit(customError.code, record);
                }

                result.push(record)

            })
            return result;
        }

        function doFilter(records, filter) {
            const result = [];

            records.forEach((record, i) => {
                const testResult = filter.test(record);

                if (testResult) {
                    filter.matches++;
                    filteredrecords.add(record.id);
                    if (filter.exclude) {
                        excludedCount++;
                        if (typeof excluded[record.id] === 'undefined') {
                            excluded[record.id] = filter.code;
                        }
                        self.emit(filter.code, record);
                        return;
                    } else {
                        if (isPlainObject(testResult)) {
                            record = testResult;
                        } else {
                            const report = {
                                code: filter.code,
                                level: 'level' in filter ? filter.level : 'error'
                            }
                            if (typeof testResult === 'string') {
                                report.content = testResult
                            }
                            record.reports.push(report)
                            // record[i] = record;
                        }
                    }

                    self.emit(filter.code, record);
                }

                // Adding messages

                record.reports.forEach(report => {
                    var message = self.getMessage(report.code, report.content);
                    if (message) {
                        report.message = message;
                    } else {
                        self.filtersWithoutMessages.add(report.code);
                    }
                })

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

            // console.log(`effective levels: ${JSON.stringify(errorLevels)}`)

            return records.map(record => {
                // console.log(record.id)
                let reports = [];

                // Filtering reports priorities by level

                errorLevels.forEach(errorLevel => {
                    // console.log(`=== ${errorLevel} ==========================`)
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
                // console.log(`==============================================`)
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
                    var message = self.getMessage(report.code, report.content);
                    if (message) {
                        report.message = message;
                    } else {
                        self.filtersWithoutMessages.add(report.code);
                    }
                })

                result.push(record)

            })

            return result;
        }

        console.log('Adding custom errors...');

        this._errors.forEach(error => {
            this.records = doErrors(this.records, error)
        });

        console.log('Filtering reports...');

        this._filters.forEach(filter => {
            this.records = doFilter(this.records, filter)
        });

        console.log('Filtering report by level...')
        this.records = doFilterLevels(this.records);

        console.log('Filtering reports by priority...');

        this.records = doFilterPriorities(this.records);

        console.log('Adding messages...')

        this.records = doAddMessages(this.records);



        const perFilter = this._filters.map(({
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
            filtered: filteredrecords.size,
            filtersWithoutMessages: Array.from(self.filtersWithoutMessages.values()),
            nbOut: records.length,
            records: this.records,
            perFilter
        };
    }
}
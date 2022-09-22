import { Report } from './report.js'

export class CorveeReport extends Report {
    constructor(msg) {
        super(msg)
        this.code = 'cv-report'
    }

}
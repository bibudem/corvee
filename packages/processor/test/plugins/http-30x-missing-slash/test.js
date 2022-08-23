import {
    CorveeProcessor
} from '../../../lib'

import plugin from '../../../plugins/http-30x-missing-slash'
import noop from '../../../plugins/misc-noop'

import {
    default as data1
} from './data-1'

import {
    default as data2
}
    from './data-2'

describe('plugin http-30x-missing-slash', () => {
    const processor = new CorveeProcessor(plugin);

    it('should create one report', async () => {
        const report = await processor.process(data1);
        // console.dir(report.data[0].reports)
        expect(report.data[0].reports).toEqual([{
            code: 'http-30x-missing-slash',
            level: 'info'
        }])
    })

    it('should create one report', async () => {
        processor.addFilters(noop);
        const report = await processor.process(data2);
        expect(report.data[0].reports).toEqual([{
            code: 'http-30x-missing-slash',
            level: 'info'
        }])
    })


})
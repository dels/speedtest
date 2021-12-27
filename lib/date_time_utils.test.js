import {jest} from '@jest/globals';

import {
    cli,
} from '../__fixtures__/client.fixtures.js'

import {
    measuresAtTwoNonConsequtiveDays, measuresAtTwoConsequtiveDays,
    fiveConsequtiveMeasures, sixConsequtiveMeasures
} from '../__fixtures__/measures.fixtures.js'

import
{
    getNow,
    getParseableTodayTime, getTodayTime,
    getParseableTodayDate, getTodayDate
} from './date_time_utils.js'

/*
 * general testing
 */
test('missing configuration', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(() => {
        longerBreakRequired()
    }).toThrow()
})

test('happy path with getTodayTime', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    });
    const now = new Date()
    let config = cli()
        const hours = (now.getHours() < 10 ? "0" + now.getHours() : now.getHours())
    const minutes = (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes())

    config.debug = true
    expect(getParseableTodayTime(config)).toBe(hours + ":" + minutes)
    expect(getTodayTime(config)).toBe(hours + minutes)

    config = cli("2021-12-23", "18:00")
    expect(getParseableTodayTime(config)).toBe("18:00")
    expect(getTodayTime(config)).toBe("1800")

    config = cli("2021-12-23", "00:00")
    expect(getParseableTodayTime(config)).toBe("00:00")
    expect(getTodayTime(config)).toBe("0000")

})

test('happy path with getTodayDate', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    });
    const now = new Date()
    let config = cli()
    const year = now.getFullYear()
    const month = ((1 + now.getMonth() < 10 ? "0" + (1 + now.getMonth()) : (1 + now.getMonth())))
    const day = (now.getDate() < 10 ? "0" + now.getDate() : now.getDate())

    expect(getParseableTodayDate(config)).toBe(year + "-" + month + "-" + day)
    expect(getTodayDate(config)).toBe("" + year + month + day)
    config = cli("2021-12-23", "18:00")
    expect(getParseableTodayDate(config)).toBe("2021-12-23")
    expect(getTodayDate(config)).toBe("20211223")
})

test('adjust days in getTodayDate', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    });
    const config = cli("2021-12-23", "18:00")
    expect(getParseableTodayDate(config, -1)).toBe("2021-12-22")
    expect(getTodayDate(config, -1)).toBe("20211222")
    expect(getParseableTodayDate(config, -23)).toBe("2021-11-30")
    expect(getTodayDate(config, -23)).toBe("20211130")
})


test('adjust days in getTodayTime', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    });
    const config = cli("2021-12-23", "18:00")
    expect(getParseableTodayTime(config, -1)).toBe("17:59")
    expect(getTodayTime(config, -1)).toBe("1759")
    expect(getParseableTodayTime(config, (-1 *(18 * 60) + 1))).toBe("00:01")
    expect(getTodayTime(config, (-1 *(18 * 60) + 1))).toBe("0001")
})

test('getNow ', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    });
    let config = cli()
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() < 10 ? "0" + now.getMonth() : now.getMonth())
    const days = (now.getDate() < 10 ? "0" + now.getDate() : now.getDate())
    const hours = (now.getHours() < 10 ? "0" + now.getHours() : now.getHours())
    const minutes = (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes())
    
    expect(getNow(config)).toBe("" + year + (1 + month ) + days + "-" + hours + minutes)
})

test('testing sime edge cases ', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    });
    let config
    config = cli("2021-09-09", "09:09")
    expect(getNow(config)).toBe("20210909-0909")
    expect(getTodayTime(config)).toBe("0909")
    expect(getParseableTodayTime(config)).toBe("09:09")
    expect(getTodayTime(config, -1)).toBe("0908")
    expect(getParseableTodayTime(config, -1)).toBe("09:08")
    expect(getParseableTodayDate(config)).toBe("2021-09-09")
    expect(getTodayDate(config)).toBe("20210909")
    expect(getParseableTodayDate(config, -10)).toBe("2021-08-30")
    expect(getTodayDate(config, -10)).toBe("20210830")
    
    config = cli("2021-10-10", "10:10")
    expect(getNow(config)).toBe("20211010-1010")
    expect(getTodayTime(config)).toBe("1010")
    expect(getParseableTodayTime(config)).toBe("10:10")
    expect(getTodayTime(config, -1)).toBe("1009")
    expect(getParseableTodayTime(config, -1)).toBe("10:09")

    expect(getParseableTodayDate(config)).toBe("2021-10-10")
    expect(getTodayDate(config)).toBe("20211010")
    expect(getParseableTodayDate(config, -10)).toBe("2021-09-30")
expect(getTodayDate(config, -10)).toBe("20210930")

})

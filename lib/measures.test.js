import {jest} from '@jest/globals';

import {
    cli, cliEmptyDataDir, cliFullyValidDataDir
} from '../__fixtures__/client.fixtures.js'

import {
    measuresAtTwoNonConsequtiveDays, measuresAtTwoConsequtiveDays,
    fiveConsequtiveMeasures, sixConsequtiveMeasures,
} from '../__fixtures__/measures.fixtures.js'


import {
    measuresAtThreeNonConsequtiveDaysWithinFourteenDaysWithBelowMinimumAtTwoDays
} from '../__fixtures__/analytics.fixtures.js'

import {
    longerBreakRequired, lastMeasureWithinLastDays, measureWithinLastMinutes,
    measurementNowWouldComplyGermanComplianceReport, readJsonFiles
} from './measures.js'

/*
 * general testing
 */
test('missing configuration', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    });
    expect(() => {
        longerBreakRequired()
    }).toThrow()
})


/*
 * testing rule of having a minimum break of 5 min between measures
 */

test('pause at least 5 minutes between measures', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(measureWithinLastMinutes(cli("2021-12-22", "11:05", 5), sixConsequtiveMeasures().measures)).toBe(false)
    expect(measureWithinLastMinutes(cli("2021-12-22", "11:07", 5), sixConsequtiveMeasures().measures)).toBe(true)
    expect(measureWithinLastMinutes(cli("2021-12-22", "11:30", 5), sixConsequtiveMeasures().measures)).toBe(false)
    expect(measureWithinLastMinutes(cli("2021-12-22", "11:11", 5), sixConsequtiveMeasures().measures)).toBe(false)
})

/*
 * testing rule of measuring on non-consequitive days
 */
test('measure on non-consequitive days', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(measureWithinLastMinutes(cli("2021-12-23", "18:00"), measuresAtTwoNonConsequtiveDays().measures)).toBe(false)
})

test('no measure today if we had measured yesterday already', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(lastMeasureWithinLastDays(cli("2021-12-23", "18:00"), measuresAtTwoConsequtiveDays().measures)).toBe(true)
})

/*
 * testing rule of minum 3 hours break after 5 measures
 */
test('continue after 5 measures last measure longer than three hours ago', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(longerBreakRequired(cli("2021-12-22", "18:00"), fiveConsequtiveMeasures().measures)).toBe(false)
})

test('break required after 5 measures', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(longerBreakRequired(cli("2021-12-22", "17:00"), fiveConsequtiveMeasures().measures)).toBe(true)
})

test('no break required with 6 mesaures at all', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(longerBreakRequired(cli("2021-12-22", "17:00"), sixConsequtiveMeasures().measures)).toBe(false)
})


test('call leastMeasureWithinLastDays with falsy values', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(lastMeasureWithinLastDays(cli("2021-12-23", "18:00"), measuresAtTwoNonConsequtiveDays().measures, "test")).toBe(null)
    expect(lastMeasureWithinLastDays(cli("2021-12-23", "18:00"), measuresAtTwoNonConsequtiveDays().measures, -1)).toBe(null)
})



test('if german law compliance is achieved', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    // last test was on 24th so test would be compliant
    expect(
        measurementNowWouldComplyGermanComplianceReport(
            cli("2021-12-26", "11:07"),
            measuresAtThreeNonConsequtiveDaysWithinFourteenDaysWithBelowMinimumAtTwoDays().measures)
    ).toBe(true)
    // measures yesterday must be not compliant
    expect(
        measurementNowWouldComplyGermanComplianceReport(
            cli("2021-12-25", "11:07"),
            measuresAtThreeNonConsequtiveDaysWithinFourteenDaysWithBelowMinimumAtTwoDays().measures)
    ).toBe(false)
    // doing test which is not 5th and last test is longer ago than 5 minutes
    expect(
        measurementNowWouldComplyGermanComplianceReport(
            cli("2021-12-24", "23:12"),
            measuresAtThreeNonConsequtiveDaysWithinFourteenDaysWithBelowMinimumAtTwoDays().measures)
    ).toBe(true)

    // doing test which is not 5th and but last test is only 3 minutes old
    expect(
        measurementNowWouldComplyGermanComplianceReport(
            cli("2021-12-24", "23:09"),
            measuresAtThreeNonConsequtiveDaysWithinFourteenDaysWithBelowMinimumAtTwoDays().measures)
    ).toBe(false)

})

test('check if we can properly read json files', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(readJsonFiles(cliEmptyDataDir())).not.toBeNull()
    expect(readJsonFiles(cliFullyValidDataDir())).not.toBeNull()
    
    const fullValidMeasures = readJsonFiles(cliFullyValidDataDir())
    expect(Object.keys(fullValidMeasures).length).toBe(2)
    console.log("measures keys: " + JSON.stringify(Object.keys(fullValidMeasures.measures)))
    expect(Object.keys(fullValidMeasures.measures).length).toBe(3)

    
})

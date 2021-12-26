import {jest} from '@jest/globals';

import {
    cli
} from '../__fixtures__/client.fixtures.js'

import {
    measuresAtThreeNonConsequtiveDaysWithinFourteenDaysWithBelowMinimumAtTwoDays,
    fullyValidMeasuresAtThreeNonConsequtiveDaysWithinThirtyDays,
    
} from '../__fixtures__/analytics.fixtures.js'

import {
    analyzeDailyNintyPercentDownloadAtLeast,
    analyzeBelowNintyPercentDownload,
    daysUnderMinimalDownload, 
} from './analytics.js'

import dotenv from "dotenv"
dotenv.config()

test('fully valid test with valid test data', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    
    expect(analyzeDailyNintyPercentDownloadAtLeast
            (cli("2021-12-25", "11:07"),
                                           fullyValidMeasuresAtThreeNonConsequtiveDaysWithinThirtyDays().measures, 250, 25, 14)
    ).toStrictEqual(
        {
            "days": 3,
            "days_reached": 3,
            "20211220": true,
            "20211222": true,
            "20211224": true,
        })
    
    expect(
        analyzeBelowNintyPercentDownload(cli("2021-12-25", "11:07"),
                                         fullyValidMeasuresAtThreeNonConsequtiveDaysWithinThirtyDays().measures, 250, 25, 14)
    ).toStrictEqual(
        {
            "percent_above": 100,
            "percent_below": 0,
            "times": 30,
            "times_above": 30,
            "times_below": 0
        }
    )

    expect(
        daysUnderMinimalDownload(cli("2021-12-25", "11:07"),
                                    fullyValidMeasuresAtThreeNonConsequtiveDaysWithinThirtyDays().measures, 150, 10, 14)
          ).toStrictEqual(
              {
                  "days": 3,
                  "days_below": 0,
                  "20211220": false,
                  "20211222": false,
                  "20211224": false,
              }
          )
})


test('fully valid test with valid test data', () => {
    const spy = jest.spyOn(console, 'log')
    
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    
    expect(
        daysUnderMinimalDownload(
            cli("2021-12-25", "11:07"),
            measuresAtThreeNonConsequtiveDaysWithinFourteenDaysWithBelowMinimumAtTwoDays().measures, 150, 10, 14)
    ).toStrictEqual(
        {
            "days": 3,
            "days_below": 2,
            "20211220": true,
            "20211222": false,
            "20211224": true,
        }
    )
})



test('detect that average is below 90 percent ', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })

    expect(
        analyzeBelowNintyPercentDownload(
            cli("2021-12-25", "11:07"),
            measuresAtThreeNonConsequtiveDaysWithinFourteenDaysWithBelowMinimumAtTwoDays().measures, 225, 22.5, 14)
    ).toStrictEqual(
        {
            "percent_below": 13.3,
            "percent_above": 86.6,
            "times": 30,
            "times_above": 26,
            "times_below": 4
        }
    )
})


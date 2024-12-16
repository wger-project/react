import { Exercise } from "components/Exercises/models/exercise";
import { Language } from "components/Exercises/models/language";
import { Muscle } from "components/Exercises/models/muscle";
import { GroupedLogData, LogData, RoutineStatsData } from "components/WorkoutRoutines/models/LogStats";
import {
    formatStatsData,
    getFullStatsData,
    getHumanReadableHeaders,
    StatGroupBy,
    StatSubType,
    StatType
} from "components/WorkoutRoutines/widgets/RoutineStatistics";
import {
    testExerciseBenchPress,
    testExerciseCrunches,
    testExerciseCurls,
    testLanguageEnglish,
    testMuscles
} from "tests/exerciseTestdata";


// Mock data
const mockExerciseList: Exercise[] = [
    testExerciseBenchPress,
    testExerciseCrunches,
    testExerciseCurls,
];

const mockLanguage: Language = testLanguageEnglish;
const mockMuscleList: Muscle[] = testMuscles;
const mockT = (a: string) => a;

describe('Tests for the getHumanReadableHeaders helper', () => {


    test('should return data grouped by exercises', () => {
        const mockLogData: LogData = new LogData({
            "exercises": { 2: 10, 4: 5 },
            "total": 150
        });

        const result = getHumanReadableHeaders(
            mockExerciseList,
            mockLanguage,
            mockMuscleList,
            mockT,
            StatGroupBy.Exercises,
            mockLogData,
        );
        expect(result.headers).toEqual(["Benchpress", "Crunches"]);
        expect(result.data).toEqual([10, 5]);
    });

    test('should return data grouped by muscles', () => {
        const mockLogData: LogData = new LogData({
            muscle: { 2: 10, 3: 15 },
            "total": 25
        });
        const result = getHumanReadableHeaders(
            mockExerciseList,
            mockLanguage,
            mockMuscleList,
            mockT,
            StatGroupBy.Muscles,
            mockLogData
        );
        expect(result.headers).toEqual(["server.finger_muscle", "server.shoulders"]);
        expect(result.data).toEqual([10, 15]);
    });

    test('should return total data', () => {
        const mockLogData: LogData = new LogData({
            total: 25,
        });
        const result = getHumanReadableHeaders(
            mockExerciseList,
            mockLanguage,
            mockMuscleList,
            mockT,
            StatGroupBy.Total,
            mockLogData
        );
        expect(result.headers).toEqual(["total"]);
        expect(result.data).toEqual([25]);
    });


    test('should return empty data for unknown StatGroupBy', () => {
        const mockLogData: LogData = new LogData({
            exercises: { 1: 10, 2: 15 },
            muscle: { 1: 10, 2: 15 },
            total: 25
        });

        const result = getHumanReadableHeaders(
            mockExerciseList,
            mockLanguage,
            mockMuscleList,
            mockT,
            'unknown' as unknown as StatGroupBy, // Forcing an unknown value
            mockLogData
        );
        expect(result.headers).toEqual([]);
        expect(result.data).toEqual([]);

    });

    test('should handle missing exercise/muscle data gracefully', () => {
        const mockLogData: LogData = new LogData({
            exercises: { 123: 8 }, // Exercise with ID 123 doesn't exist in mockExerciseList
            muscle: { 123: 12 }, // Muscle with ID 123 doesn't exist in mockMuscleList
            total: 20
        });

        const resultExercises = getHumanReadableHeaders(
            mockExerciseList,
            mockLanguage,
            mockMuscleList,
            mockT,
            StatGroupBy.Exercises,
            mockLogData
        );
        expect(resultExercises.headers).toEqual([undefined]);
        expect(resultExercises.data).toEqual([8]);

        const resultMuscles = getHumanReadableHeaders(
            mockExerciseList,
            mockLanguage,
            mockMuscleList,
            mockT,
            StatGroupBy.Muscles,
            mockLogData
        );
        expect(resultMuscles.headers).toEqual(['']);
    });

});

describe('Tests for the getFullStatsData function', () => {

    test('should return correct data and totals for weekly data', () => {
        const mockStatsData = new RoutineStatsData({
            sets: new GroupedLogData({
                weekly: {
                    1: new LogData({ muscle: { 2: 5, 3: 10 }, total: 15 }),
                    2: new LogData({ muscle: { 2: 8, 3: 12 }, total: 20 }),
                },
            })
        });


        const result = getFullStatsData(
            mockStatsData,
            StatType.Sets,
            StatSubType.Weekly,
            StatGroupBy.Muscles,
            mockExerciseList,
            mockMuscleList,
            mockLanguage,
            'en',
            mockT,
        );

        expect(result.headers).toEqual(['server.finger_muscle', 'server.shoulders']);
        expect(result.data).toEqual([
            { key: 'week 1', values: [5, 10] },
            { key: 'week 2', values: [8, 12] }
        ]);

        expect(result.totals).toEqual({ 'server.finger_muscle': 13, 'server.shoulders': 22 });
    });


    test('should return correct data and totals for iteration data', () => {

        const mockStatsData = new RoutineStatsData({
            volume: new GroupedLogData({
                iteration: {
                    1: new LogData({ exercises: { 2: 10, 4: 12 }, total: 22 }),
                    2: new LogData({ exercises: { 2: 5, 4: 7 }, total: 12 }),
                    3: new LogData({ exercises: { 2: 15, 4: 2 }, total: 17 }),
                }
            })
        });
        const result = getFullStatsData(
            mockStatsData,
            StatType.Volume,
            StatSubType.Iteration,
            StatGroupBy.Exercises,
            mockExerciseList,
            mockMuscleList,
            mockLanguage,
            'en',
            mockT,
        );
        expect(result.headers).toEqual(["Benchpress", "Crunches"]);
        expect(result.data).toEqual([
            { key: 'iteration 1', values: [10, 12] },
            { key: 'iteration 2', values: [5, 7] },
            { key: 'iteration 3', values: [15, 2] }
        ]);

        expect(result.totals).toEqual({ "Benchpress": 30, "Crunches": 21 });


    });


    test('should return correct data and totals for daily data', () => {

        const mockStatsData = new RoutineStatsData({
            sets: new GroupedLogData({
                daily: {
                    "2024-03-01": new LogData({ total: 25, muscle: { 3: 10, 2: 15 } }),
                    "2024-03-03": new LogData({ total: 30, muscle: { 3: 12, 2: 18 } }),
                }
            })
        });
        const result = getFullStatsData(
            mockStatsData,
            StatType.Sets,
            StatSubType.Daily,
            StatGroupBy.Muscles,
            mockExerciseList,
            mockMuscleList,
            mockLanguage,
            'en',
            mockT,
        );
        console.log(JSON.stringify(result, null, 4));
        expect(result.headers).toEqual(['server.finger_muscle', 'server.shoulders']);

        expect(result.data).toEqual([
            { key: "3/1/2024", values: [15, 10] },
            { key: "3/3/2024", values: [18, 12] }
        ]);
        expect(result.totals).toEqual({ "server.finger_muscle": 33, "server.shoulders": 22 });
    });
});


describe('formatStatsData', () => {

    it('should format data correctly for exercises', () => {
        const mockFullStatsData = {
            headers: ['Push Ups', 'Pull Ups'],
            data: [
                { key: '2024-01-01', values: [10, 5] },
                { key: '2024-01-03', values: [15, 8] },
            ],
            totals: { 'Push Ups': 25, 'Pull Ups': 13 }
        };

        const result = formatStatsData(mockFullStatsData);

        expect(result).toEqual([{
            "data": [
                { category: "2024-01-01", value: 10 },
                { category: "2024-01-03", value: 15 }
            ],
            "name": "Push Ups"
        },
            {
                "data": [
                    { category: "2024-01-01", value: 5 },
                    { category: "2024-01-03", value: 8 }
                ],
                "name": "Pull Ups"
            }
        ]);
    });


    it('should format data correctly for iteration', () => {
        const mockFullStatsData = {
            headers: ['Benchpress', 'Crunches'],
            data: [
                { key: 'iteration 1', values: [10, 12] },
                { key: 'iteration 2', values: [5, 7] },
                { key: 'iteration 3', values: [15, 2] },

            ],
            totals: { 'Benchpress': 30, 'Crunches': 21 }
        };

        const result = formatStatsData(mockFullStatsData);

        expect(result).toEqual([{
            "name": "Benchpress",
            "data": [
                { category: "iteration 1", value: 10 },
                { category: "iteration 2", value: 5 },
                { category: "iteration 3", value: 15 }
            ],
        },
            {
                "name": "Crunches",
                "data": [
                    { category: "iteration 1", value: 12 },
                    { category: "iteration 2", value: 7 },
                    { category: "iteration 3", value: 2 }
                ],
            }]);
    });


    it('should format data correctly for weekly', () => {

        const mockFullStatsData = {
            headers: ['server.finger_muscle', 'server.shoulders'],
            data: [
                { key: 'week 1', values: [5, 10] },
                { key: 'week 2', values: [8, 12] }
            ],
            totals: {
                'server.finger_muscle': 13,
                'server.shoulders': 22
            }
        };

        const result = formatStatsData(mockFullStatsData);

        expect(result).toEqual([{
            "data": [
                { category: "week 1", value: 5 },
                { category: "week 2", value: 8 }
            ],
            "name": "server.finger_muscle"
        },
            {
                "data": [
                    { category: "week 1", value: 10 },
                    { category: "week 2", value: 12 }
                ],
                "name": "server.shoulders"
            }
        ]);

    });

    it('should handle missing data gracefully', () => {
        const mockFullStatsData = {
            headers: ['Exercise A', 'Exercise B'],
            data: [
                { key: 'Day 1', values: [10, undefined] },  // Missing value for Exercise B
                { key: 'Day 2', values: [undefined, 5] }, // Missing value for Exercise A
            ],
            totals: { 'Exercise A': 10, 'Exercise B': 5 }
        };

        const result = formatStatsData(mockFullStatsData);
        expect(result).toEqual([{
            "data": [
                { category: "Day 1", value: 10 },
                { category: "Day 2" }],
            "name": "Exercise A"
        },
            {
                "data": [
                    { category: "Day 1" },
                    { category: "Day 2", value: 5 }
                ],
                "name": "Exercise B"
            }
        ]);
    });


    it('should handle empty headers and data', () => {
        const mockFullStatsData = {
            headers: [],
            data: [],
            totals: {}
        };
        const result = formatStatsData(mockFullStatsData);
        expect(result).toEqual([]);
    });

});
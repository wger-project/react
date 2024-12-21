import { LogData, RoutineStatsDataAdapter } from "components/WorkoutRoutines/models/LogStats";
import { testRoutineStatistics } from "tests/workoutStatisticsTestData";

describe('RoutineStatsDataAdapter parser tests', () => {


    test('calls addQuery.mutate with correct data when creating a new entry', async () => {
        const adapter = new RoutineStatsDataAdapter();

        const result = adapter.fromJson(testRoutineStatistics);

        expect(result.volume.mesocycle.total).toBe(150);
        expect(result.volume.mesocycle).toStrictEqual(new LogData({
            "exercises": {
                "1": 20,
                "2": 30,
                "42": 50,
            },
            "muscle": {
                "7": 70,
                "8": 10,
                "9": 20,
            },
            "upper_body": 7,
            "lower_body": 8,
            "total": 150
        }));
        expect(result.volume.daily['2024-12-01']).toStrictEqual(new LogData({
            "exercises": {
                "1": 20,
                "2": 30,
                "42": 50,
            },
            "muscle": {
                "7": 70,
                "8": 10,
                "9": 20,
            },
            "upper_body": 7,
            "lower_body": 8,
            "total": 150
        }));
    });
});
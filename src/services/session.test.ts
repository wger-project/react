import axios from "axios";
import { getSessions } from "services";
import * as exerciseService from "services/exercise";
import { testExerciseBenchPress, testExerciseSquats } from "tests/exerciseTestdata";

jest.mock("axios");
jest.mock("services/exercise");

describe("Session service tests", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('Loads sessions with associated logs and exercises', async () => {
        // Arrange
        (axios.get as jest.Mock).mockImplementationOnce(() => {
            return Promise.resolve({
                data: {
                    count: 2,
                    next: null,
                    previous: null,
                    results: [
                        {
                            "id": 4072327,
                            "date": "2025-08-07T00:00:00+02:00",
                            "session": 24284,
                            "routine": 39764,
                            "iteration": 1,
                            "slot_entry": 316691,
                            "next_log": null,
                            "exercise": 200,
                            "repetitions_unit": 1,
                            "repetitions": "2.00",
                            "repetitions_target": "1.00",
                            "weight_unit": 1,
                            "weight": "33.00",
                            "weight_target": null,
                            "rir": "0.5",
                            "rir_target": null,
                            "rest": 167,
                            "rest_target": null
                        },
                        {
                            "id": 4072329,
                            "date": "2025-08-07T00:00:00+02:00",
                            "session": 24284,
                            "routine": 39764,
                            "iteration": 1,
                            "slot_entry": 316693,
                            "next_log": null,
                            "exercise": 201,
                            "repetitions_unit": 1,
                            "repetitions": "2.00",
                            "repetitions_target": "3.00",
                            "weight_unit": 1,
                            "weight": "46.00",
                            "weight_target": null,
                            "rir": "1.0",
                            "rir_target": null,
                            "rest": 178,
                            "rest_target": null
                        },
                    ]
                }
            });
        });

        (axios.get as jest.Mock).mockImplementationOnce(() => {
            return Promise.resolve({
                data: {
                    count: 1,
                    next: null,
                    previous: null,
                    results: [
                        {
                            "id": 24284,
                            "routine": 39764,
                            "day": null,
                            "date": "2025-08-07",
                            "notes": null,
                            "impression": "3",
                            "time_start": "20:10:58",
                            "time_end": "23:28:21"
                        },
                    ]
                }
            });
        });

        (exerciseService.getExercise as jest.Mock).mockImplementation((id) => {
            if (id === 200) {
                return Promise.resolve(testExerciseSquats);
            } else if (id === 201) {
                return Promise.resolve(testExerciseBenchPress);
            }
        });

        // Act
        const sessions = await getSessions();

        // Assert
        expect(sessions).toHaveLength(1);
        expect(sessions[0].id).toBe(24284);
        expect(sessions[0].logs).toHaveLength(2);
        expect(sessions[0].logs[0].exerciseId).toBe(200);
        expect(sessions[0].logs[0].exerciseObj).toBeDefined();
        expect(sessions[0].logs[0].exerciseObj?.getTranslation().name).toBe('Squats');
        expect(sessions[0].logs[1].exerciseId).toBe(201);
        expect(sessions[0].logs[1].exerciseObj).toBeDefined();
        expect(sessions[0].logs[1].exerciseObj?.getTranslation().name).toBe('Benchpress');

        expect(exerciseService.getExercise).toHaveBeenCalledWith(200);
        expect(exerciseService.getExercise).toHaveBeenCalledWith(201);

        // Check that API calls were made correctly
        expect(axios.get).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining('/workoutlog/'),
            expect.anything()
        );
        expect(axios.get).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('/workoutsession/'),
            expect.anything()
        );
    });

    // Keep the existing test
    test('Correctly filters sessions and log entries', async () => {
        (axios.get as jest.Mock).mockImplementation(() => {
            return Promise.resolve({
                data: {
                    count: 2,
                    next: null,
                    previous: null,
                    results: []
                }
            });
        });

        await getSessions({
            filtersetQueryLogs: { foo: "bar" },
            filtersetQuerySessions: { baz: 1234 }
        });

        // No results, so no loading of ingredients or weight units
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(axios.get).toHaveBeenNthCalledWith(1,
            expect.stringContaining('foo=bar'),
            expect.anything()
        );
        expect(axios.get).toHaveBeenNthCalledWith(2,
            expect.stringContaining('baz=1234'),
            expect.anything()
        );
    });
});
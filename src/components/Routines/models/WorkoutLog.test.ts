import { WorkoutLog, WorkoutLogAdapter } from "@/components/Routines/models/WorkoutLog";

describe('WorkoutLog model', () => {

    const apiResponse = {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
        date: '2024-05-10',
        iteration: 3,
        exercise: 345,
        slot_entry: 2,
        session: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001',
        routine: 1,

        repetitions_unit: 1,
        repetitions: "10.00",
        repetitions_target: "12.00",

        weight_unit: 1,
        weight: "82.50",
        weight_target: "80.00",

        rir: "1.50",
        rir_target: "2.00",

        rest: 120,
        rest_target: 90,
    };

    test('parses the response of the API', () => {

        // Act
        const log = new WorkoutLogAdapter().fromJson(apiResponse);

        // Assert
        expect(log.id).toBe('aaaaaaaa-aaaa-aaaa-aaaa-000000000001');
        expect(log.date).toStrictEqual(new Date('2024-05-10'));
        expect(log.iteration).toBe(3);
        expect(log.exerciseId).toBe(345);
        expect(log.slotEntryId).toBe(2);
        expect(log.sessionId).toBe('bbbbbbbb-bbbb-bbbb-bbbb-000000000001');
        expect(log.routineId).toBe(1);

        // The API sends the decimals as strings
        expect(log.repetitions).toBe(10);
        expect(log.repetitionsTarget).toBe(12);
        expect(log.weight).toBe(82.5);
        expect(log.weightTarget).toBe(80);
        expect(log.rir).toBe(1.5);
        expect(log.rirTarget).toBe(2);
        expect(log.restTime).toBe(120);
        expect(log.restTimeTarget).toBe(90);
    });

    test('keeps null values null', () => {

        // Act
        const log = new WorkoutLogAdapter().fromJson({
            ...apiResponse,
            repetitions: null,
            repetitions_target: null,
            weight: null,
            weight_target: null,
            rir: null,
            rir_target: null,
            rest: null,
            rest_target: null,
        });

        // Assert
        expect(log.repetitions).toBeNull();
        expect(log.repetitionsTarget).toBeNull();
        expect(log.weight).toBeNull();
        expect(log.weightTarget).toBeNull();
        expect(log.rir).toBeNull();
        expect(log.rirTarget).toBeNull();
        expect(log.restTime).toBeNull();
        expect(log.restTimeTarget).toBeNull();
    });

    test('keeps zero values, they are not the same as "not set"', () => {

        // Act
        // 0 RiR means training to failure, a bodyweight exercise weighs 0 and
        // supersets are done without a rest in between
        const log = new WorkoutLogAdapter().fromJson({
            ...apiResponse,
            repetitions: "0.00",
            repetitions_target: "0.00",
            weight: "0.00",
            weight_target: "0.00",
            rir: "0.00",
            rir_target: "0.00",
            rest: 0,
            rest_target: 0,
        });

        // Assert
        expect(log.repetitions).toBe(0);
        expect(log.repetitionsTarget).toBe(0);
        expect(log.weight).toBe(0);
        expect(log.weightTarget).toBe(0);
        expect(log.rir).toBe(0);
        expect(log.rirTarget).toBe(0);
        expect(log.restTime).toBe(0);
        expect(log.restTimeTarget).toBe(0);
    });

    test('serializes the keys the API expects', () => {

        // Act
        const adapter = new WorkoutLogAdapter();
        const json = adapter.toJson(adapter.fromJson(apiResponse));

        // Assert
        expect(json).toEqual({
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
            iteration: 3,
            date: new Date('2024-05-10').toISOString(),
            slot_entry: 2,
            exercise: 345,
            session: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001',
            routine: 1,

            repetitions_unit: 1,
            repetitions: 10,
            repetitions_target: 12,

            weight_unit: 1,
            weight: 82.5,
            weight_target: 80,

            rir: 1.5,
            rir_target: 2,

            rest: 120,
            rest_target: 90,
        });
    });

    test('keeps a log without a session unassigned', () => {

        // Act
        const adapter = new WorkoutLogAdapter();
        const json = adapter.toJson(adapter.fromJson({ ...apiResponse, session: null }));

        // Assert
        expect(json.session).toBeNull();
    });

    test('a zero target survives the round trip to the API', () => {

        // Act
        const adapter = new WorkoutLogAdapter();
        const json = adapter.toJson(adapter.fromJson({
            ...apiResponse,
            rir_target: "0.00",
            weight_target: "0.00",
            rest: 0,
        }));

        // Assert
        expect(json.rir_target).toBe(0);
        expect(json.weight_target).toBe(0);
        expect(json.rest).toBe(0);
    });

    describe('rirString', () => {

        test('shows a placeholder when there is no rir', () => {
            const log = new WorkoutLogAdapter().fromJson({ ...apiResponse, rir: null });

            expect(log.rirString).toBe('-/-');
        });

        test('shows a zero rir as a number', () => {
            const log = new WorkoutLogAdapter().fromJson({ ...apiResponse, rir: "0.00" });

            expect(log.rirString).toBe('0');
        });

        test('shows the rir with its decimals', () => {
            const log = new WorkoutLogAdapter().fromJson({ ...apiResponse, rir: "1.50" });

            expect(log.rirString).toBe('1.5');
        });
    });

    test('accepts a date object as well as a string', () => {

        // Act
        const log = new WorkoutLog({
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
            date: new Date('2024-05-10'),
            iteration: 1,
            slotEntryId: 2,
            exerciseId: 345,
            repetitions: 10,
            weight: 80,
            rir: null,
        });

        // Assert
        expect(log.date).toStrictEqual(new Date('2024-05-10'));
    });
});

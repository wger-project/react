import { WorkoutLog, WorkoutLogAdapter } from "@/components/Routines/models/WorkoutLog";

const adapter = new WorkoutLogAdapter();

const baseApiResponse = {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
    iteration: 1,
    date: "2024-08-01",
    exercise: 100,
    slot_entry: 2,
    routine: 1,
    session: null,
    repetitions_unit: 1,
    repetitions: "10.00",
    repetitions_target: null,
    weight_unit: 1,
    weight: "20.00",
    weight_target: null,
    rir: null,
    rir_target: null,
    rest: null,
    rest_target: null,
};

describe('WorkoutLog adapter', () => {
    test('fromJson sets notes when present', () => {
        const log = adapter.fromJson({ ...baseApiResponse, notes: 'Felt strong' });
        expect(log.notes).toBe('Felt strong');
    });

    test('fromJson sets notes to null when absent', () => {
        const log = adapter.fromJson(baseApiResponse);
        expect(log.notes).toBeNull();
    });

    test('toJson includes notes', () => {
        const log = adapter.fromJson({ ...baseApiResponse, notes: 'Heavy day' });
        const json = adapter.toJson(log);
        expect(json.notes).toBe('Heavy day');
    });

    test('toJson sets notes to null when not set', () => {
        const log = adapter.fromJson(baseApiResponse);
        const json = adapter.toJson(log);
        expect(json.notes).toBeNull();
    });

    test('constructor accepts notes', () => {
        const log = new WorkoutLog({
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
            date: new Date('2024-08-01'),
            iteration: 1,
            exerciseId: 100,
            slotEntryId: 2,
            repetitions: 10,
            weight: 20,
            rir: null,
            notes: 'Test note',
        });
        expect(log.notes).toBe('Test note');
    });
});

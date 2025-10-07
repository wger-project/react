import { Day } from "components/WorkoutRoutines/models/Day";

describe('Day model tests', () => {

    test('correctly clones an object', async () => {
        const day = new Day({ id: 1, routineId: 2, name: 'Chest Day', order: 0, isRest: false });
        const day2 = Day.clone(day, { name: 'Leg Day', isRest: true });

        expect(day2.id).toBe(1);
        expect(day2.isRest).toBe(true);
        expect(day2.name).toBe('Leg Day');
        expect(day2.routineId).toBe(2);
        expect(day2.order).toBe(0);
    });
});
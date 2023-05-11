import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { WorkoutSetting } from "components/WorkoutRoutines/models/WorkoutSetting";
import { repTextWithUnit } from "components/WorkoutRoutines/utils/repText";

describe("test the reps and weight utility", () => {

    const repUnit = new RepetitionUnit(1, "reps");
    const tillFailureUnit = new RepetitionUnit(2, "till failure");
    const secondsUnit = new RepetitionUnit(3, "sec");

    const weightKgUnit = new WeightUnit(1, "kg");
    const weightLbUnit = new WeightUnit(2, "lb");
    const weightPlaceUnit = new WeightUnit(3, "plates");

    let setting1: WorkoutSetting;
    let setting2: WorkoutSetting;
    let setting3: WorkoutSetting;

    beforeEach(() => {
        setting1 = new WorkoutSetting(
            1,
            123,
            repUnit.id,
            4,
            100.00,
            weightKgUnit.id,
            '2',
            1,
            '',
            repUnit,
            weightKgUnit
        );

        setting2 = new WorkoutSetting(
            2,
            123,
            repUnit.id,
            6,
            90,
            weightKgUnit.id,
            '1.5',
            2,
            '',
            repUnit,
            weightKgUnit
        );

        setting3 = new WorkoutSetting(
            3,
            123,
            1,
            8,
            80,
            2,
            '',
            3,
            '',
            repUnit,
            weightKgUnit
        );
    });

    describe("test the repText function", () => {

        test("repetitions, weight in kg and RiR, all sets equal", () => {
            const result = repTextWithUnit(4, [setting1]);
            expect(result).toEqual("4 × 4 (100 kg, 2 RiR)");
        });

        test("repetitions, weight with comma in kg and RiR, all sets equal", () => {
            setting1.weight = 100.5;

            const result = repTextWithUnit(4, [setting1]);
            expect(result).toEqual("4 × 4 (100.50 kg, 2 RiR)");
        });

        // TODO: fix the function so that it returns "4 (100 kg, 2 RiR)", with only one space
        test("repetitions, weight in kg and RiR, different sets", () => {
            const result = repTextWithUnit(3, [setting1, setting2, setting3]);
            expect(result).toEqual("4  (100 kg, 2 RiR) – 6  (90 kg, 1.5 RiR) – 8  (80 kg)");
        });

        test("repetitions, weight in kg, no RiR, all sets equal", () => {
            setting1.rir = null;
            const result = repTextWithUnit(4, [setting1]);
            expect(result).toEqual("4 × 4 (100 kg)");
        });

        test("repetitions, weight in lb, no RiR, all sets equal", () => {
            setting1.rir = null;
            setting1.weightUnit = weightLbUnit.id;
            setting1.weightUnitObj = weightLbUnit;
            const result = repTextWithUnit(4, [setting1]);
            expect(result).toEqual("4 × 4 (100 lb)");
        });

        test("until failure, no weight, no RiR, all sets equal", () => {
            setting1.rir = null;
            setting1.repetitionUnit = tillFailureUnit.id;
            setting1.repetitionUnitObj = tillFailureUnit;
            setting1.weight = null;
            const result = repTextWithUnit(4, [setting1]);
            expect(result).toEqual("4 × ∞");
        });

        test("until failure, weight, no RiR, all sets equal", () => {
            setting1.rir = null;
            setting1.repetitionUnit = tillFailureUnit.id;
            setting1.repetitionUnitObj = tillFailureUnit;
            setting1.weight = 5;
            const result = repTextWithUnit(4, [setting1]);
            expect(result).toEqual("4 × ∞ (5 kg)");
        });

        test("repetitions, weight in plates, no RiR, all sets equal", () => {
            setting1.reps = 3;
            setting1.weight = 5;
            setting1.rir = null;
            setting1.weightUnit = weightPlaceUnit.id;
            setting1.weightUnitObj = weightPlaceUnit;
            const result = repTextWithUnit(4, [setting1]);
            expect(result).toEqual("4 × 3 (5 plates)");
        });

        test("repetitions, duration in seconds, no RiR, all sets equal", () => {
            setting1.rir = null;
            setting1.weightUnit = secondsUnit.id;
            setting1.weightUnitObj = secondsUnit;
            const result = repTextWithUnit(4, [setting1]);
            expect(result).toEqual("4 × 4 (100 sec)");
        });
    });
});

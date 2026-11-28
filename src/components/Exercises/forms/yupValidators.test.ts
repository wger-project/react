import { descriptionValidator } from "@/components/Exercises/forms/yupValidators";

const FIFTEEN_WORDS = "Stand upright and hold the dumbbells at your sides, then curl both weights up slowly.";
const LONG_ENOUGH = FIFTEEN_WORDS + " Lower them again under control and keep your elbows close to your body.";

describe("descriptionValidator", () => {
    test("accepts a description with enough characters and words", () => {
        expect(descriptionValidator().isValidSync(LONG_ENOUGH)).toBe(true);
    });

    test("rejects a description under 120 characters", () => {
        expect(FIFTEEN_WORDS.length).toBeLessThan(120);
        expect(descriptionValidator().isValidSync(FIFTEEN_WORDS)).toBe(false);
    });

    test("rejects a long description with too few words", () => {
        const fewWords = "Supercalifragilisticexpialidocious ".repeat(5);
        expect(fewWords.length).toBeGreaterThanOrEqual(120);
        expect(descriptionValidator().isValidSync(fewWords)).toBe(false);
    });

    test("markdown list markers don't count as words", () => {
        const padded = "- 1. * - ".repeat(14) + "Hold the bar and pull yourself up.";
        expect(padded.length).toBeGreaterThanOrEqual(120);
        expect(descriptionValidator().isValidSync(padded)).toBe(false);
    });

    test("an unchanged existing description stays valid, an edited one is checked", () => {
        const old = "View the video to understand the exercise";
        expect(descriptionValidator(old).isValidSync(old)).toBe(true);
        expect(descriptionValidator(old).isValidSync(old + "!")).toBe(false);
    });
});

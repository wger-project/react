import { ImageFormData } from "@/components/Exercises/models/exercise";
import { ImageStyle } from "@/components/Exercises/models/image";
import { exerciseSubmissionInitialState, SetExerciseSubmissionState } from "@/state";
import {
    exerciseSubmissionReducer,
    reset,
    setAlternativeNamesEn,
    setAlternativeNamesI18n,
    setCategory,
    setDescriptionEn,
    setDescriptionI18n,
    setEquipment,
    setImages,
    setLanguageId,
    setNameEn,
    setNameI18n,
    setNewBaseVariationId,
    setNotesEn,
    setNotesI18n,
    setPrimaryMuscles,
    setSecondaryMuscles,
    setVariationId,
} from "@/state/exerciseSubmissionReducer";
import { ExerciseSubmissionAction, ExerciseSubmissionState } from "@/state/exerciseSubmissionState";

const baseState: ExerciseSubmissionState = exerciseSubmissionInitialState;

const sampleImage: ImageFormData = {
    url: "blob://abc",
    file: new File([new Uint8Array([1, 2, 3])], "img.png", { type: "image/png" }),
    author: "alice",
    authorUrl: "https://example.com/alice",
    title: "A nice image",
    derivativeSourceUrl: "",
    objectUrl: "",
    style: ImageStyle.PHOTO,
};


describe("exerciseSubmissionReducer - action creators", () => {
    test("reset action has the expected type and no payload", () => {
        expect(reset()).toEqual({ type: SetExerciseSubmissionState.RESET });
    });

    test.each([
        ["setNameEn", setNameEn, "Bench Press", SetExerciseSubmissionState.SET_NAME_EN],
        ["setDescriptionEn", setDescriptionEn, "A description", SetExerciseSubmissionState.SET_DESCRIPTION_EN],
        ["setNameI18n", setNameI18n, "Bankdrücken", SetExerciseSubmissionState.SET_NAME_I18N],
        ["setDescriptionI18n", setDescriptionI18n, "Eine Beschreibung", SetExerciseSubmissionState.SET_DESCRIPTION_I18N],
    ])("%s wraps the string payload", (_name, creator, value, expectedType) => {
        expect((creator as (v: string) => ExerciseSubmissionAction)(value)).toEqual({
            type: expectedType,
            payload: value,
        });
    });

    test.each([
        ["setNotesEn", setNotesEn, ["a", "b"], SetExerciseSubmissionState.SET_NOTES_EN],
        ["setNotesI18n", setNotesI18n, ["x"], SetExerciseSubmissionState.SET_NOTES_I18N],
        ["setAlternativeNamesEn", setAlternativeNamesEn, ["alt1", "alt2"], SetExerciseSubmissionState.SET_ALIASES_EN],
        ["setAlternativeNamesI18n", setAlternativeNamesI18n, ["altA"], SetExerciseSubmissionState.SET_ALIASES_I18N],
    ])("%s wraps the string-array payload", (_name, creator, value, expectedType) => {
        expect((creator as (v: string[]) => ExerciseSubmissionAction)(value)).toEqual({
            type: expectedType,
            payload: value,
        });
    });

    test.each([
        ["setEquipment", setEquipment, [1, 2, 3], SetExerciseSubmissionState.SET_EQUIPMENT],
        ["setPrimaryMuscles", setPrimaryMuscles, [10], SetExerciseSubmissionState.SET_PRIMARY_MUSCLES],
        ["setSecondaryMuscles", setSecondaryMuscles, [11, 12], SetExerciseSubmissionState.SET_MUSCLES_SECONDARY],
    ])("%s wraps the number-array payload", (_name, creator, value, expectedType) => {
        expect((creator as (v: number[]) => ExerciseSubmissionAction)(value)).toEqual({
            type: expectedType,
            payload: value,
        });
    });

    test("setCategory accepts a number and null", () => {
        expect(setCategory(7)).toEqual({ type: SetExerciseSubmissionState.SET_CATEGORY, payload: 7 });
        expect(setCategory(null)).toEqual({ type: SetExerciseSubmissionState.SET_CATEGORY, payload: null });
    });

    test("setLanguageId accepts a number and null", () => {
        expect(setLanguageId(2)).toEqual({ type: SetExerciseSubmissionState.SET_LANGUAGE, payload: 2 });
        expect(setLanguageId(null)).toEqual({ type: SetExerciseSubmissionState.SET_LANGUAGE, payload: null });
    });

    test("setVariationId accepts a uuid string and null", () => {
        expect(setVariationId("abc-123")).toEqual({
            type: SetExerciseSubmissionState.SET_VARIATION_ID,
            payload: "abc-123",
        });
        expect(setVariationId(null)).toEqual({
            type: SetExerciseSubmissionState.SET_VARIATION_ID,
            payload: null,
        });
    });

    test("setNewBaseVariationId accepts a number and null", () => {
        expect(setNewBaseVariationId(42)).toEqual({
            type: SetExerciseSubmissionState.SET_NEW_VARIATION_BASE_ID,
            payload: 42,
        });
        expect(setNewBaseVariationId(null)).toEqual({
            type: SetExerciseSubmissionState.SET_NEW_VARIATION_BASE_ID,
            payload: null,
        });
    });

    test("setImages wraps an ImageFormData[]", () => {
        const images = [sampleImage];
        expect(setImages(images)).toEqual({
            type: SetExerciseSubmissionState.SET_IMAGES,
            payload: images,
        });
    });
});

describe("exerciseSubmissionReducer - reducer", () => {
    test("returns the initial state on RESET", () => {
        const state: ExerciseSubmissionState = {
            ...baseState,
            nameEn: "Bench Press",
            descriptionEn: "Description",
            category: 1,
            equipment: [1, 2],
            muscles: [3],
            musclesSecondary: [4],
            languageId: 5,
            nameI18n: "Bankdrücken",
            descriptionI18n: "Beschreibung",
            alternativeNamesEn: ["alt"],
            notesEn: ["note"],
            variationGroup: "abc",
            newVariationExerciseId: 7,
            images: [sampleImage],
        };

        const next = exerciseSubmissionReducer(state, reset());
        expect(next).toBe(exerciseSubmissionInitialState);
    });

    test("returns the same state when action is undefined", () => {
        // The reducer guards against `undefined` actions; useful when called outside React's normal flow
        const next = exerciseSubmissionReducer(baseState, undefined as unknown as ExerciseSubmissionAction);
        expect(next).toBe(baseState);
    });

    test("returns the same state on an unknown action type", () => {
        const next = exerciseSubmissionReducer(baseState, { type: 9999 as SetExerciseSubmissionState });
        expect(next).toBe(baseState);
    });

    test("SET_NAME_EN updates only nameEn", () => {
        const next = exerciseSubmissionReducer(baseState, setNameEn("Squat"));
        expect(next.nameEn).toBe("Squat");
        expect(next.descriptionEn).toBe(baseState.descriptionEn);
        expect(next).not.toBe(baseState);
    });

    test("SET_DESCRIPTION_EN updates only descriptionEn", () => {
        const next = exerciseSubmissionReducer(baseState, setDescriptionEn("Squat down"));
        expect(next.descriptionEn).toBe("Squat down");
        expect(next.nameEn).toBe(baseState.nameEn);
    });

    test("SET_NOTES_EN updates only notesEn", () => {
        const next = exerciseSubmissionReducer(baseState, setNotesEn(["keep back straight"]));
        expect(next.notesEn).toEqual(["keep back straight"]);
    });

    test("SET_ALIASES_EN updates only alternativeNamesEn", () => {
        const next = exerciseSubmissionReducer(baseState, setAlternativeNamesEn(["a1", "a2"]));
        expect(next.alternativeNamesEn).toEqual(["a1", "a2"]);
    });

    test("SET_NAME_I18N updates only nameI18n", () => {
        const next = exerciseSubmissionReducer(baseState, setNameI18n("Kniebeuge"));
        expect(next.nameI18n).toBe("Kniebeuge");
    });

    test("SET_DESCRIPTION_I18N updates only descriptionI18n", () => {
        const next = exerciseSubmissionReducer(baseState, setDescriptionI18n("Beschreibung"));
        expect(next.descriptionI18n).toBe("Beschreibung");
    });

    test("SET_NOTES_I18N updates only notesI18n", () => {
        const next = exerciseSubmissionReducer(baseState, setNotesI18n(["Notiz"]));
        expect(next.notesI18n).toEqual(["Notiz"]);
    });

    test("SET_ALIASES_I18N updates only alternativeNamesI18n", () => {
        const next = exerciseSubmissionReducer(baseState, setAlternativeNamesI18n(["x"]));
        expect(next.alternativeNamesI18n).toEqual(["x"]);
    });

    test("SET_CATEGORY updates only category", () => {
        const next = exerciseSubmissionReducer(baseState, setCategory(3));
        expect(next.category).toBe(3);
    });

    test("SET_EQUIPMENT updates only equipment", () => {
        const next = exerciseSubmissionReducer(baseState, setEquipment([1, 2, 3]));
        expect(next.equipment).toEqual([1, 2, 3]);
    });

    test("SET_PRIMARY_MUSCLES updates only muscles", () => {
        const next = exerciseSubmissionReducer(baseState, setPrimaryMuscles([1, 2]));
        expect(next.muscles).toEqual([1, 2]);
    });

    test("SET_MUSCLES_SECONDARY updates only musclesSecondary", () => {
        const next = exerciseSubmissionReducer(baseState, setSecondaryMuscles([4, 5]));
        expect(next.musclesSecondary).toEqual([4, 5]);
    });

    test("SET_VARIATION_ID updates only variationGroup", () => {
        const next = exerciseSubmissionReducer(baseState, setVariationId("uuid-1"));
        expect(next.variationGroup).toBe("uuid-1");

        const cleared = exerciseSubmissionReducer(next, setVariationId(null));
        expect(cleared.variationGroup).toBeNull();
    });

    test("SET_NEW_VARIATION_BASE_ID updates only newVariationExerciseId", () => {
        const next = exerciseSubmissionReducer(baseState, setNewBaseVariationId(99));
        expect(next.newVariationExerciseId).toBe(99);
    });

    test("SET_LANGUAGE updates only languageId", () => {
        const next = exerciseSubmissionReducer(baseState, setLanguageId(7));
        expect(next.languageId).toBe(7);
    });

    test("SET_IMAGES updates only images", () => {
        const next = exerciseSubmissionReducer(baseState, setImages([sampleImage]));
        expect(next.images).toEqual([sampleImage]);
    });

    test("a sequence of actions accumulates state", () => {
        let s = baseState;
        s = exerciseSubmissionReducer(s, setNameEn("Bench Press"));
        s = exerciseSubmissionReducer(s, setCategory(2));
        s = exerciseSubmissionReducer(s, setEquipment([1, 10]));
        s = exerciseSubmissionReducer(s, setPrimaryMuscles([1]));
        s = exerciseSubmissionReducer(s, setSecondaryMuscles([3]));
        s = exerciseSubmissionReducer(s, setLanguageId(1));
        s = exerciseSubmissionReducer(s, setNameI18n("Bankdrücken"));
        s = exerciseSubmissionReducer(s, setVariationId("group-1"));

        expect(s).toMatchObject({
            nameEn: "Bench Press",
            category: 2,
            equipment: [1, 10],
            muscles: [1],
            musclesSecondary: [3],
            languageId: 1,
            nameI18n: "Bankdrücken",
            variationGroup: "group-1",
        });

        // RESET wipes everything
        const reseted = exerciseSubmissionReducer(s, reset());
        expect(reseted).toBe(exerciseSubmissionInitialState);
    });
});

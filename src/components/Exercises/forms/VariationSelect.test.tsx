import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VariationSelect } from "@/components/Exercises/forms/VariationSelect";
import { useExercisesQuery } from "@/components/Exercises/queries";
import React from "react";
import {
    testExerciseBenchPress,
    testExerciseCrunches,
    testExerciseCurls,
    testExerciseSkullCrusher,
    testExerciseSquats,
} from "@/tests/exerciseTestdata";
import type { Mock } from "vitest";

vi.mock("@/components/Exercises/queries");

const mockedUseExercisesQuery = useExercisesQuery as Mock;
const queryClient = new QueryClient();

// Exercise.id / variationGroup are typed as nullable; the fixtures always set
// them, so narrow once here for use as concrete prop values.
const SQUATS_ID = testExerciseSquats.id as number;
const CRUNCHES_ID = testExerciseCrunches.id as number;
const SKULL_CRUSHER_GROUP = testExerciseSkullCrusher.variationGroup as string;


function renderSelect(props: Partial<React.ComponentProps<typeof VariationSelect>> = {}) {
    const defaults: React.ComponentProps<typeof VariationSelect> = {
        exerciseId: undefined,
        selectedVariationId: null,
        selectedNewVariationExerciseId: null,
        onChangeVariationId: vi.fn(),
        onChangeNewVariationExerciseId: vi.fn(),
    };
    const merged = { ...defaults, ...props };
    render(
        <QueryClientProvider client={queryClient}>
            <VariationSelect {...merged} />
        </QueryClientProvider>
    );
    return merged;
}


describe("VariationSelect", () => {
    beforeEach(() => {
        // Default: query has succeeded with the full set of test exercises
        mockedUseExercisesQuery.mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            data: [
                testExerciseSquats,         // variationGroup: null
                testExerciseBenchPress,     // variationGroup: 'a1b2c3d4-0001-...'
                testExerciseCurls,          // same group as bench press
                testExerciseCrunches,       // variationGroup: null
                testExerciseSkullCrusher,   // own group: 'a1b2c3d4-0002-...'
            ],
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("renders the search box and the list of exercises", () => {
        renderSelect();

        expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
        expect(screen.getByText("exercises.filterVariations")).toBeInTheDocument();

        // Standalone exercises
        expect(screen.getByText("Squats")).toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();

        // Grouped (Bench press + Curls share the same group, both names render in the same item)
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("Curls")).toBeInTheDocument();
        expect(screen.getByText("Skull crusher")).toBeInTheDocument();
    });

    test("shows the loading placeholder while the query is loading", () => {
        mockedUseExercisesQuery.mockImplementation(() => ({
            isLoading: true,
            isSuccess: false,
            data: undefined,
        }));

        renderSelect();

        expect(screen.queryByText("Squats")).not.toBeInTheDocument();
        // The loading placeholder uses CircularProgress, which renders role="progressbar"
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    test("filters exercises by the search term (case-insensitive)", async () => {
        const user = userEvent.setup();
        renderSelect();
        const input = screen.getByRole("textbox", { name: /name/i });

        await user.type(input, "squat");

        expect(screen.getByText("Squats")).toBeInTheDocument();
        expect(screen.queryByText("Crunches")).not.toBeInTheDocument();
        expect(screen.queryByText("Benchpress")).not.toBeInTheDocument();
        expect(screen.queryByText("Curls")).not.toBeInTheDocument();
        expect(screen.queryByText("Skull crusher")).not.toBeInTheDocument();
    });

    test("hides the current exercise (exerciseId prop) from the standalone list", () => {
        // Squats has id 345 and no variation group, so passing its id should hide it
        renderSelect({ exerciseId: SQUATS_ID });

        expect(screen.queryByText("Squats")).not.toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
    });

    test("clicking on a grouped exercise calls onChangeVariationId with that group's UUID", async () => {
        const user = userEvent.setup();
        const onChangeVariationId = vi.fn();
        const onChangeNewVariationExerciseId = vi.fn();
        renderSelect({ onChangeVariationId, onChangeNewVariationExerciseId });

        await user.click(screen.getByText("Skull crusher"));

        expect(onChangeVariationId).toHaveBeenCalledWith(SKULL_CRUSHER_GROUP);
        expect(onChangeNewVariationExerciseId).not.toHaveBeenCalled();
    });

    test("clicking on the currently selected group emits null (deselect)", async () => {
        const user = userEvent.setup();
        const onChangeVariationId = vi.fn();
        renderSelect({
            selectedVariationId: SKULL_CRUSHER_GROUP,
            onChangeVariationId,
        });

        await user.click(screen.getByText("Skull crusher"));

        expect(onChangeVariationId).toHaveBeenCalledWith(null);
    });

    test("clicking on a standalone exercise calls onChangeNewVariationExerciseId with its id", async () => {
        const user = userEvent.setup();
        const onChangeVariationId = vi.fn();
        const onChangeNewVariationExerciseId = vi.fn();
        renderSelect({ onChangeVariationId, onChangeNewVariationExerciseId });

        await user.click(screen.getByText("Crunches"));

        expect(onChangeNewVariationExerciseId).toHaveBeenCalledWith(CRUNCHES_ID);
        expect(onChangeVariationId).not.toHaveBeenCalled();
    });

    test("clicking on the currently selected standalone exercise emits null via onChangeVariationId (deselect)", async () => {
        // When toggling off a standalone exercise both ids end up null in the
        // child's handleToggle, so the parent's handleToggle takes the
        // `newVariationId === null` branch and routes the call to
        // onChangeVariationId(null) - not onChangeNewVariationExerciseId.
        const user = userEvent.setup();
        const onChangeVariationId = vi.fn();
        const onChangeNewVariationExerciseId = vi.fn();
        renderSelect({
            selectedNewVariationExerciseId: CRUNCHES_ID,
            onChangeVariationId,
            onChangeNewVariationExerciseId,
        });

        await user.click(screen.getByText("Crunches"));

        expect(onChangeVariationId).toHaveBeenCalledWith(null);
        expect(onChangeNewVariationExerciseId).not.toHaveBeenCalled();
    });

    test("the currently selected variation group is rendered as checked", () => {
        renderSelect({ selectedVariationId: SKULL_CRUSHER_GROUP });

        // MUI Switch uses role="switch"
        const switches = screen.getAllByRole("switch");
        const checkedSwitches = switches.filter(s => (s as HTMLInputElement).checked);
        expect(checkedSwitches).toHaveLength(1);
    });

    test("the currently selected standalone exercise is rendered as checked", () => {
        renderSelect({ selectedNewVariationExerciseId: CRUNCHES_ID });

        const switches = screen.getAllByRole("switch");
        const checkedSwitches = switches.filter(s => (s as HTMLInputElement).checked);
        expect(checkedSwitches).toHaveLength(1);
    });
});

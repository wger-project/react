import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditExerciseVariation } from "@/components/Exercises/forms/Variation";
import { useExercisesQuery } from "@/components/Exercises/queries";
import { useProfileQuery } from "@/components/User/queries/profile";
import React from "react";
import { editExercise } from "@/services";
import {
    testExerciseBenchPress,
    testExerciseCrunches,
    testExerciseCurls,
    testExerciseSkullCrusher,
    testExerciseSquats,
} from "@/tests/exerciseTestdata";
import { testProfileDataVerified } from "@/tests/userTestdata";
import type { Mock } from "vitest";

vi.mock("@/components/Exercises/queries");
vi.mock("@/components/User/queries/profile");
vi.mock("@/services");

const queryClient = new QueryClient();
const FIXED_UUID = "11111111-2222-3333-4444-555555555555";

// Exercise.id is typed as `number | null`, but EditExerciseVariation requires a
// concrete number. The fixtures always set ids, so narrow them once here.
const SQUATS_ID = testExerciseSquats.id as number;
const CRUNCHES_ID = testExerciseCrunches.id as number;
const SKULL_CRUSHER_GROUP = testExerciseSkullCrusher.variationGroup as string;


function renderVariation(props: { exerciseId?: number; initial?: string | null } = {}) {
    const { exerciseId = SQUATS_ID, initial = null } = props;
    render(
        <QueryClientProvider client={queryClient}>
            <EditExerciseVariation exerciseId={exerciseId} initial={initial} />
        </QueryClientProvider>
    );
}


describe("EditExerciseVariation", () => {
    beforeEach(() => {
        (useExercisesQuery as Mock).mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            data: [
                testExerciseSquats,
                testExerciseBenchPress,
                testExerciseCurls,
                testExerciseCrunches,
                testExerciseSkullCrusher,
            ],
        }));
        (useProfileQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            data: testProfileDataVerified,
        }));
        (editExercise as Mock).mockResolvedValue(200);

        // Stable UUID so we can assert on the value sent to editExercise
        if (!globalThis.crypto) {
            (globalThis as { crypto?: Crypto }).crypto = {} as Crypto;
        }
        vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(FIXED_UUID);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    test("clicking on an existing variation group calls editExercise with that group", async () => {
        const user = userEvent.setup();
        renderVariation({ exerciseId: SQUATS_ID, initial: null });

        await user.click(screen.getByText("Skull crusher"));

        await waitFor(() => {
            expect(editExercise).toHaveBeenCalledWith(SQUATS_ID, {
                // eslint-disable-next-line camelcase
                variation_group: SKULL_CRUSHER_GROUP,
                // eslint-disable-next-line camelcase
                license_author: testProfileDataVerified.username,
            });
        });
        // Only the current exercise is patched - no second call
        expect(editExercise).toHaveBeenCalledTimes(1);
    });

    test("clicking on the currently selected variation group clears it (sets variation_group to null)", async () => {
        const user = userEvent.setup();
        renderVariation({
            exerciseId: SQUATS_ID,
            initial: SKULL_CRUSHER_GROUP,
        });

        await user.click(screen.getByText("Skull crusher"));

        await waitFor(() => {
            expect(editExercise).toHaveBeenCalledWith(SQUATS_ID, {
                // eslint-disable-next-line camelcase
                variation_group: null,
                // eslint-disable-next-line camelcase
                license_author: testProfileDataVerified.username,
            });
        });
    });

    test("clicking on a standalone exercise creates a new group and assigns both exercises to it", async () => {
        const user = userEvent.setup();
        renderVariation({ exerciseId: SQUATS_ID, initial: null });

        await user.click(screen.getByText("Crunches"));

        await waitFor(() => {
            expect(editExercise).toHaveBeenCalledTimes(2);
        });
        // The current exercise is patched first ...
        expect(editExercise).toHaveBeenNthCalledWith(1, SQUATS_ID, {
            // eslint-disable-next-line camelcase
            variation_group: FIXED_UUID,
            // eslint-disable-next-line camelcase
            license_author: testProfileDataVerified.username,
        });
        // ... then the freshly picked exercise is added to the same UUID group.
        expect(editExercise).toHaveBeenNthCalledWith(2, CRUNCHES_ID, {
            // eslint-disable-next-line camelcase
            variation_group: FIXED_UUID,
            // eslint-disable-next-line camelcase
            license_author: testProfileDataVerified.username,
        });
    });

    test("if the second editExercise call fails, the state is rolled back to the previous group", async () => {
        const user = userEvent.setup();
        // First call succeeds, second fails
        (editExercise as Mock).mockReset();
        (editExercise as Mock)
            .mockResolvedValueOnce(200)
            .mockRejectedValueOnce(new Error("network"));

        renderVariation({
            exerciseId: SQUATS_ID,
            initial: SKULL_CRUSHER_GROUP,
        });

        // Click on a standalone exercise to start the new-group flow
        await user.click(screen.getByText("Crunches"));

        // Both calls happen (first success, second fail)
        await waitFor(() => {
            expect(editExercise).toHaveBeenCalledTimes(2);
        });

        // After rollback the originally-selected variation group is restored:
        // its switch should be the only one checked.
        await waitFor(() => {
            const switches = screen.getAllByRole("switch") as HTMLInputElement[];
            const checked = switches.filter(s => s.checked);
            expect(checked).toHaveLength(1);
        });
    });

});

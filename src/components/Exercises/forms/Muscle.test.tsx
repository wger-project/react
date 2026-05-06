import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditExerciseMuscle } from "@/components/Exercises/forms/Muscle";
import { useEditExerciseQuery, useMusclesQuery } from "@/components/Exercises/queries";
import React from "react";
import { testMuscles } from "@/tests/exerciseTestdata";
import type { Mock } from "vitest";

vi.mock("@/components/Exercises/queries");

describe("Test the widget to live edit the muscles", () => {

    let editMutateMock: Mock;

    beforeEach(() => {
        editMutateMock = vi.fn();
        (useMusclesQuery as Mock).mockImplementation(() => ({ isSuccess: true, data: testMuscles }));
        (useEditExerciseQuery as Mock).mockImplementation(() => ({ mutateAsync: editMutateMock }));
    });

    test('Clicking on a muscle immediately fires the request', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseMuscle
                exerciseId={100}
                value={[1, 2]}
                setValue={vi.fn()}
                blocked={[]}
                isMain
            />
        );

        // Assert
        expect(await screen.findByText(/biggus/i)).toBeInTheDocument();
        expect(await screen.findByText(/dacttilaris/i)).toBeInTheDocument();

        await user.click(screen.getByRole('combobox', { name: /exercises\.muscles/i }));
        const shoulders = await screen.findByText(/shoulders/i);
        await user.click(shoulders);
        expect(editMutateMock).toHaveBeenCalledWith({
            id: 100,
            data: { "muscles": [1, 2, 3] },
        });
    });

    test('Correctly sets secondary muscles', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseMuscle
                exerciseId={1234}
                value={[1, 2]}
                setValue={vi.fn()}
                blocked={[]}
                isMain={false}
            />
        );

        // Assert
        expect(await screen.findByText(/biggus/i)).toBeInTheDocument();
        expect(await screen.findByText(/dacttilaris/i)).toBeInTheDocument();

        await user.click(screen.getByRole('combobox', { name: /exercises\.secondarymuscles/i }));
        const shoulders = await screen.findByText(/shoulders/i);
        await user.click(shoulders);
        expect(editMutateMock).toHaveBeenCalledWith({
            id: 1234,
            // eslint-disable-next-line camelcase
            data: { muscles_secondary: [1, 2, 3] },
        });
    });
});

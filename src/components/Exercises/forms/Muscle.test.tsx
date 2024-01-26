import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditExerciseMuscle } from "components/Exercises/forms/Muscle";
import { useMusclesQuery } from "components/Exercises/queries";
import React from "react";
import { editExercise } from "services";
import { testMuscles } from "tests/exerciseTestdata";

jest.mock("components/Exercises/queries");
jest.mock("services/exercise");

describe("Test the widget to live edit the muscles", () => {

    beforeEach(() => {
        // @ts-ignore
        useMusclesQuery.mockImplementation(() => ({ isSuccess: true, data: testMuscles }));

        // @ts-ignore
        editExercise.mockImplementation(() => (200));
    });

    test('Clicking on a muscle immediately fires the request', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseMuscle
                exerciseId={100}
                value={[1, 2]}
                setValue={jest.fn()}
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
        expect(editExercise).toHaveBeenCalledWith(100, { "muscles": [1, 2, 3] });
    });

    test('Correctly sets secondary muscles', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseMuscle
                exerciseId={1234}
                value={[1, 2]}
                setValue={jest.fn()}
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
        // eslint-disable-next-line camelcase
        expect(editExercise).toHaveBeenCalledWith(1234, { muscles_secondary: [1, 2, 3] });
    });
});

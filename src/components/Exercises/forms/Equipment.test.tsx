import axios from "axios";
import { render, screen } from "@testing-library/react";
import React from "react";
import { testEquipment } from "tests/exerciseTestdata";
import { useEquipmentQuery } from "components/Exercises/queries";
import userEvent from "@testing-library/user-event";
import { editExerciseBase } from "services/exerciseBase";
import { EditExerciseEquipment } from "components/Exercises/forms/Equipment";

jest.mock("axios");
jest.mock("components/Exercises/queries");
jest.mock("services/exerciseBase");

describe("Test the edit widget to live edit the equipment", () => {

    beforeEach(() => {
        // @ts-ignore
        useEquipmentQuery.mockImplementation(() => (
            { isSuccess: true, data: testEquipment }
        ));

        // @ts-ignore
        editExerciseBase.mockImplementation(() => (100));
    });


    test('Clicking on the equipment immediately fires the request', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseEquipment
                baseId={100}
                initial={[1, 2]}
            />
        );

        // Assert
        const barbell = await screen.findByText(/Barbell/i);
        expect(barbell).toBeInTheDocument();
        const dumbbell = await screen.findByText(/Dumbbell/i);
        expect(dumbbell).toBeInTheDocument();

        const textbox = screen.getByRole('combobox', {
            name: /equipment/i
        });

        await user.click(textbox);
        const rocks = await screen.findByText(/rocks/i);
        await user.click(rocks);
        expect(editExerciseBase).toHaveBeenCalledWith(100, { "equipment": [1, 2, 42] });
    });

    test('Clicking on an existing equipment, removes it', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseEquipment
                baseId={100}
                initial={[1, 2]}
            />
        );

        // Assert
        const textbox = screen.getByRole('combobox', {
            name: /equipment/i
        });

        await user.click(textbox);
        screen.logTestingPlaygroundURL();

        const rocks = await screen.getByRole('option', { name: /dumbbell/i });
        await user.click(rocks);
        expect(editExerciseBase).toHaveBeenCalledWith(100, { "equipment": [1] });
    });
});

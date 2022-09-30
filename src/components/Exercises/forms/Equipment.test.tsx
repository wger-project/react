import { render, screen } from "@testing-library/react";
import React from "react";
import { testEquipment } from "tests/exerciseTestdata";
import { useEquipmentQuery } from "components/Exercises/queries";
import userEvent from "@testing-library/user-event";
import { editExerciseBase } from "services/exerciseBase";
import { EditExerciseEquipment } from "components/Exercises/forms/Equipment";
import { useProfileQuery } from "components/User/queries/profile";
import { testProfileDataVerified } from "tests/userTestdata";

jest.mock("components/User/queries/profile");
jest.mock("components/Exercises/queries");
jest.mock("services/exerciseBase");

describe("Test the edit widget to live edit the equipment", () => {

    beforeEach(() => {
        // @ts-ignore
        useEquipmentQuery.mockImplementation(() => (
            { isSuccess: true, data: testEquipment }
        ));

        // @ts-ignore
        useProfileQuery.mockImplementation(() => (
            { isSuccess: true, data: testProfileDataVerified }
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

        // eslint-disable-next-line camelcase
        expect(editExerciseBase).toHaveBeenCalledWith(100, { equipment: [1, 2, 42], license_author: "admin" });
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
        const rocks = screen.getByRole('option', { name: /dumbbell/i });
        await user.click(rocks);

        // eslint-disable-next-line camelcase
        expect(editExerciseBase).toHaveBeenCalledWith(100, { equipment: [1], license_author: "admin" });
    });
});

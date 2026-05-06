import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditExerciseEquipment } from "@/components/Exercises/forms/Equipment";
import { useEditExerciseQuery, useEquipmentQuery } from "@/components/Exercises/queries";
import { useProfileQuery } from "@/components/User";
import React from "react";
import { testEquipment } from "@/tests/exerciseTestdata";
import { testProfileDataVerified } from "@/tests/userTestdata";
import type { Mock } from 'vitest';

vi.mock("@/components/User/queries/profile");
vi.mock("@/components/Exercises/queries");

describe("Test the edit widget to live edit the equipment", () => {

    let editMutateMock: Mock;

    beforeEach(() => {
        editMutateMock = vi.fn();
        (useEquipmentQuery as Mock).mockImplementation(() => (
            { isSuccess: true, data: testEquipment }
        ));
        (useProfileQuery as Mock).mockImplementation(() => (
            { isSuccess: true, data: testProfileDataVerified }
        ));
        (useEditExerciseQuery as Mock).mockImplementation(() => ({ mutateAsync: editMutateMock }));
    });


    test('Clicking on the equipment immediately fires the request', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseEquipment
                exerciseId={100}
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

        expect(editMutateMock).toHaveBeenCalledWith({
            id: 100,
            // eslint-disable-next-line camelcase
            data: { equipment: [1, 2, 42], license_author: "admin" },
        });
    });

    test('Clicking on an existing equipment, removes it', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseEquipment
                exerciseId={100}
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

        expect(editMutateMock).toHaveBeenCalledWith({
            id: 100,
            // eslint-disable-next-line camelcase
            data: { equipment: [1], license_author: "admin" },
        });
    });
});

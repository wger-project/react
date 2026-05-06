import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditExerciseCategory } from "@/components/Exercises/forms/Category";
import { useCategoriesQuery } from "@/components/Exercises/queries";
import { useProfileQuery } from "@/components/User";
import React from "react";
import { editExercise } from "@/services";
import { testCategories } from "@/tests/exerciseTestdata";
import { testProfileDataVerified } from "@/tests/userTestdata";
import type { Mock } from 'vitest';

vi.mock("@/components/User/queries/profile");
vi.mock("@/components/Exercises/queries");
vi.mock("@/services");

describe("Test the edit widget to live edit the category", () => {

    test('Clicking on a category immediately fires the request', async () => {

        // Arrange
        (useCategoriesQuery as Mock).mockImplementation(() => (
            { isSuccess: true, data: testCategories }
        ));
        (useProfileQuery as Mock).mockImplementation(() => (
            { isSuccess: true, data: testProfileDataVerified }
        ));
        (editExercise as Mock).mockImplementation(() => (100));
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseCategory
                exerciseId={100}
                initial={2}
            />
        );

        // Assert
        const select = await screen.findByText(/legs/i);
        expect(select).toBeInTheDocument();


        await user.click(select);
        const chest = await screen.findByText(/chest/i);
        await user.click(chest);

        // eslint-disable-next-line camelcase
        expect(editExercise).toHaveBeenCalledWith(100, { category: 3, license_author: "admin" });
    });
});

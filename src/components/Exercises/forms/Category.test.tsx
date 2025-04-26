import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditExerciseCategory } from "components/Exercises/forms/Category";
import { useCategoriesQuery } from "components/Exercises/queries";
import { useProfileQuery } from "components/User/queries/profile";
import React from "react";
import { editExercise } from "services";
import { testCategories } from "tests/exerciseTestdata";
import { testProfileDataVerified } from "tests/userTestdata";

jest.mock("components/User/queries/profile");
jest.mock("components/Exercises/queries");
jest.mock("services");

describe("Test the edit widget to live edit the category", () => {

    test('Clicking on a category immediately fires the request', async () => {

        // Arrange
        (useCategoriesQuery as jest.Mock).mockImplementation(() => (
            { isSuccess: true, data: testCategories }
        ));
        (useProfileQuery as jest.Mock).mockImplementation(() => (
            { isSuccess: true, data: testProfileDataVerified }
        ));
        (editExercise as jest.Mock).mockImplementation(() => (100));
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

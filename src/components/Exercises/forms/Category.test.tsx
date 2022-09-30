import { render, screen } from "@testing-library/react";
import React from "react";
import { EditExerciseCategory } from "components/Exercises/forms/Category";
import { testCategories } from "tests/exerciseTestdata";
import { useCategoriesQuery } from "components/Exercises/queries";
import userEvent from "@testing-library/user-event";
import { editExerciseBase } from "services/exerciseBase";
import { useProfileQuery } from "components/User/queries/profile";
import { testProfileDataVerified } from "tests/userTestdata";

jest.mock("components/User/queries/profile");
jest.mock("components/Exercises/queries");
jest.mock("services/exerciseBase");

describe("Test the edit widget to live edit the category", () => {

    test('Clicking on a category immediately fires the request', async () => {

        // Arrange
        // @ts-ignore
        useCategoriesQuery.mockImplementation(() => (
            { isSuccess: true, data: testCategories }
        ));

        // @ts-ignore
        useProfileQuery.mockImplementation(() => (
            { isSuccess: true, data: testProfileDataVerified }
        ));

        // @ts-ignore
        editExerciseBase.mockImplementation(() => (100));
        const user = userEvent.setup();

        // Act
        render(
            <EditExerciseCategory
                baseId={100}
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
        expect(editExerciseBase).toHaveBeenCalledWith(100, { category: 3, license_author: "admin" });
    });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { testExerciseCrunches, testLanguageEnglish, testLanguageFrench } from "tests/exerciseTestdata";
import { testProfileDataNotVerified, testProfileDataVerified } from "tests/userTestdata";
import { ExerciseDetailView } from "components/Exercises/Detail/ExerciseDetailView";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Language } from "components/Exercises/models/language";
import { usePermissionQuery } from "components/User/queries/permission";
import { useProfileQuery } from "components/User/queries/profile";

jest.mock("components/User/queries/profile");
jest.mock("components/User/queries/permission");

const queryClient = new QueryClient();

describe("Contribute banner tests", () => {

    const renderComponent = (exercise: ExerciseBase, language: Language) => render(
        <QueryClientProvider client={queryClient}>
            <ExerciseDetailView
                exercise={exercise}
                language={language}
                setEditMode={jest.fn}
                variations={[]}
            />
        </QueryClientProvider>
    );

    beforeEach(() => {

        // @ts-ignore
        useProfileQuery.mockImplementation(() => ({
            isSuccess: true,
            data: testProfileDataNotVerified
        }));

        // @ts-ignore
        usePermissionQuery.mockImplementation(() => ({
            isSuccess: true,
            data: false
        }));

    });


    test('Should show no banner for a language that is already translated', async () => {

        // Act
        await renderComponent(testExerciseCrunches, testLanguageEnglish);

        // Assert
        expect(usePermissionQuery).toBeCalled();
        expect(useProfileQuery).toBeCalled();
        expect(screen.queryByText("exercises.exerciseNotTranslated")).not.toBeInTheDocument();
    });

    test('Should show no banner to anonymous users', async () => {
        // Arrange
        // @ts-ignore
        useProfileQuery.mockImplementation(() => ({
            isSuccess: true,
            data: null
        }));

        // Act
        renderComponent(testExerciseCrunches, testLanguageEnglish);

        // Assert
        expect(screen.queryByText("exercises.exerciseNotTranslated")).not.toBeInTheDocument();
    });

    test('Should show the banner to admins', async () => {
        // Arrange
        // @ts-ignore
        usePermissionQuery.mockImplementation(() => ({
            isSuccess: true,
            data: true
        }));

        // Act
        renderComponent(testExerciseCrunches, testLanguageFrench);

        // Assert
        expect(screen.getByText("exercises.exerciseNotTranslated")).toBeInTheDocument();
    });

    test('Should show the banner to verified users', () => {
        // Arrange
        // @ts-ignore
        useProfileQuery.mockImplementation(() => ({
            isSuccess: true,
            data: testProfileDataVerified
        }));

        // Act
        renderComponent(testExerciseCrunches, testLanguageFrench);

        // Assert
        expect(screen.getByText("exercises.exerciseNotTranslated")).toBeInTheDocument();
    });
});
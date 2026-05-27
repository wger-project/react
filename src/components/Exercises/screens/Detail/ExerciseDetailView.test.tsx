import { ExerciseDetailView } from "@/components/Exercises/screens/Detail/ExerciseDetailView";
import { Exercise } from "@/components/Exercises/models/exercise";
import { Language } from "@/components/Exercises/models/language";
import { usePermissionQuery, useProfileQuery } from "@/components/User";
import { testExerciseCrunches, testLanguageEnglish, testLanguageFrench } from "@/tests/exerciseTestdata";
import { testProfileDataNotVerified, testProfileDataVerified } from "@/tests/userTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { Mock } from 'vitest';

vi.mock("@/components/User/queries/profile");
vi.mock("@/components/User/queries/permission");

const queryClient = new QueryClient();

describe("Contribute banner tests", () => {

    const renderComponent = (exercise: Exercise, language: Language) => render(
        <QueryClientProvider client={queryClient}>
            <ExerciseDetailView
                exercise={exercise}
                language={language}
                setEditMode={vi.fn()}
                variations={[]}
            />
        </QueryClientProvider>
    );

    beforeEach(() => {

        (useProfileQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            data: testProfileDataNotVerified
        }));
        (usePermissionQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            data: false
        }));

    });


    test('Should show no banner for a language that is already translated', async () => {

        // Act
        await renderComponent(testExerciseCrunches, testLanguageEnglish);

        // Assert
        expect(usePermissionQuery).toHaveBeenCalled();
        expect(useProfileQuery).toHaveBeenCalled();
        expect(screen.queryByText("exercises.exerciseNotTranslated")).not.toBeInTheDocument();
    });

    test('Should show no banner to anonymous users', async () => {
        // Arrange
        (useProfileQuery as Mock).mockImplementation(() => ({
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
        (usePermissionQuery as Mock).mockImplementation(() => ({
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
        (useProfileQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            data: testProfileDataVerified
        }));

        // Act
        renderComponent(testExerciseCrunches, testLanguageFrench);

        // Assert
        expect(screen.getByText("exercises.exerciseNotTranslated")).toBeInTheDocument();
    });
});
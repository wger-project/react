import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { Step6Overview } from "components/Exercises/Add/Step6Overview";
import {
    useAddExerciseFullQuery,
    useCategoriesQuery,
    useEquipmentQuery,
    useLanguageQuery,
    useMusclesQuery
} from "components/Exercises/queries";
import { useProfileQuery } from "components/User/queries/profile";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { useExerciseSubmissionStateValue } from "state";
import { testCategories, testEquipment, testLanguages, testMuscles } from "tests/exerciseTestdata";
import { testProfileDataVerified } from "tests/userTestdata";


jest.mock("components/Exercises/queries");
jest.mock("components/User/queries/profile");
jest.mock("state");

const mockOnContinue = jest.fn();
const mockedUseCategoriesQuery = useCategoriesQuery as jest.Mock;
const mockedMuscleQuery = useMusclesQuery as jest.Mock;
const mockedUseEquipmentQuery = useEquipmentQuery as jest.Mock;
const mockedLanguageQuery = useLanguageQuery as jest.Mock;
const mockedUseExerciseStateValue = useExerciseSubmissionStateValue as jest.Mock;
const mockedUseProfileQuery = useProfileQuery as jest.Mock;
const addFullExerciseMutation = useAddExerciseFullQuery as jest.Mock;

const queryClient = new QueryClient();

describe("Test the add exercise step 6 component", () => {

    beforeEach(() => {
        mockedUseCategoriesQuery.mockImplementation(() => (
            { isLoading: false, data: testCategories }
        ));
        mockedMuscleQuery.mockImplementation(() => (
            { isLoading: false, data: testMuscles }
        ));
        mockedUseEquipmentQuery.mockImplementation(() => (
            { isLoading: false, data: testEquipment }
        ));
        mockedLanguageQuery.mockImplementation(() => (
            { isLoading: false, data: testLanguages }
        ));

        mockedUseProfileQuery.mockImplementation(() => (
            { isLoading: false, data: testProfileDataVerified }
        ));

        addFullExerciseMutation.mockImplementation(() => (
            { isIdle: false, data: 1 }
        ));

        // there must be a better way to do this!!!
        mockedUseExerciseStateValue.mockImplementation(() => (
            [{
                category: 1,
                muscles: [2],
                musclesSecondary: [],
                variationId: null,
                newVariationExerciseId: null,
                languageId: 3,
                equipment: [2],

                nameEn: 'A new exercise',
                descriptionEn: 'This very nice exercise will blow your mind',
                alternativeNamesEn: [],
                notesEn: [],

                nameI18n: 'un excellent exercice',
                alternativeNamesI18n: [],
                descriptionI18n: 'Ce très bel exercice va vous époustoufler',
                notesI18n: [],

                images: [],
            }]
        ));
    });


    test("Smoketest", () => {
        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/exercises/9']}>
                    <Routes>
                        <Route path="exercises/:exerciseId"
                               element={<Step6Overview onContinue={mockOnContinue} />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByText('A new exercise')).toBeInTheDocument();
        expect(screen.getByText('This very nice exercise will blow your mind')).toBeInTheDocument();

        expect(screen.getByText('Arms')).toBeInTheDocument();
        expect(screen.getByText('Dumbbell')).toBeInTheDocument();
        expect(screen.getByText('exercises.step1HeaderBasics')).toBeInTheDocument();
        expect(screen.getByText(/Musculus dacttilaris/i)).toBeInTheDocument();

        expect(screen.getByText('un excellent exercice')).toBeInTheDocument();
        expect(screen.getByText('Ce très bel exercice va vous époustoufler')).toBeInTheDocument();
    });

    test("that the correct calls to the API are made", () => {
        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/exercises/9']}>
                    <Routes>
                        <Route path="exercises/:exerciseId"
                               element={<Step6Overview onContinue={mockOnContinue} />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        // TODO: addExercise, etc.
    });

});

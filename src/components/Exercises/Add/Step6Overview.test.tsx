import React from "react";
import { render, screen } from "@testing-library/react";
import { Step6Overview } from "components/Exercises/Add/Step6Overview";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCategoriesQuery, useEquipmentQuery, useLanguageQuery, useMusclesQuery } from "components/Exercises/queries";
import { testCategories, testEquipment, testLanguages, testMuscles } from "tests/exerciseTestdata";
import { useExerciseStateValue } from "state";


jest.mock("components/Exercises/queries");
jest.mock("state");

const mockOnContinue = jest.fn();
const mockedUseCategoriesQuery = useCategoriesQuery as jest.Mock;
const mockedMuscleQuery = useMusclesQuery as jest.Mock;
const mockedUseEquipmentQuery = useEquipmentQuery as jest.Mock;
const mockedLanguageQuery = useLanguageQuery as jest.Mock;
const mockedUseExerciseStateValue = useExerciseStateValue as jest.Mock;

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

        // there must be a better way to do this!!!
        mockedUseExerciseStateValue.mockImplementation(() => (
            [{
                category: 1,
                muscles: [2],
                musclesSecondary: [],
                variationId: null,
                newVariationBaseId: null,
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
                        <Route path="exercises/:baseID"
                               element={<Step6Overview onContinue={mockOnContinue} />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByText('A new exercise')).toBeInTheDocument();
        expect(screen.getByText('This very nice exercise will blow your mind')).toBeInTheDocument();

        expect(screen.getByText('server.arms')).toBeInTheDocument();
        expect(screen.getByText('server.dumbbell')).toBeInTheDocument();
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
                        <Route path="exercises/:baseID"
                               element={<Step6Overview onContinue={mockOnContinue} />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        // TODO: addExerciseBase, etc.
    });

});

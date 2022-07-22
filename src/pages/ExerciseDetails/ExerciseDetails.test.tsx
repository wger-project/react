import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { ExerciseDetails } from './index';
import { MemoryRouter, Route, Routes } from 'react-router';
import { getExerciseBase, getExerciseBasesForVariation, getLanguageByShortName, getLanguages } from "services";
import { QueryClient, QueryClientProvider } from "react-query";
import { testExerciseSquats, testLanguageEnglish, testLanguages } from "tests/exerciseTestdata";
import { useLanguageQuery } from "components/Exercises/queries";

jest.mock("services");
jest.mock("components/Exercises/queries");

const mockedUseLanguageQuery = useLanguageQuery as jest.Mock;

describe("Should render with", () => {

    beforeEach(() => {
        // since we used jest.mock(), getExerciseBase is a jest.fn() having no implementation
        // or doing nothing at all, so this implementation will resolve to our dummy data.
        // @ts-ignore
        getExerciseBase.mockImplementation(() => Promise.resolve(testExerciseSquats));
        // @ts-ignore
        getExerciseBasesForVariation.mockImplementation(() => Promise.resolve(
            [
                // TODO: add some variations. Adding a helper function to create variations is probably a good idea.
            ]
        ));
        // @ts-ignore
        getLanguageByShortName.mockImplementation(() => Promise.resolve(testLanguageEnglish));
        // @ts-ignore
        getLanguages.mockImplementation(() => Promise.resolve(languages));

        mockedUseLanguageQuery.mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: testLanguages
        }));
    });

    test('should render the exercise to screen', async () => {

        const queryClient = new QueryClient();
        await render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/exercises/9']}>
                    <Routes>
                        <Route path='exercises/:baseID' element={<ExerciseDetails />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        await act(() => Promise.resolve());

        expect(mockedUseLanguageQuery).toBeCalled();
        expect(getExerciseBase).toBeCalled();
        expect(getExerciseBasesForVariation).toBeCalled();

        expect(screen.getByText("exercises.description")).toBeInTheDocument();
        expect(screen.getByText("Squats")).toBeInTheDocument();

        expect(screen.getByText(testExerciseSquats.muscles[0].name)).toBeInTheDocument();
        expect(screen.getByText(testExerciseSquats.muscles[1].name)).toBeInTheDocument();

        expect(screen.getByText('Variants')).toBeInTheDocument();
        expect(screen.getByText("VIEW")).toBeInTheDocument();

    });
});
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from '@testing-library/react';
import { useLanguageQuery } from "components/Exercises/queries";
import { usePermissionQuery } from "components/User/queries/permission";
import { useProfileQuery } from "components/User/queries/profile";
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { getExercise, getExercisesForVariation, getLanguageByShortName, getLanguages } from "services";
import {
    testExerciseCrunches,
    testExerciseCurls,
    testExerciseSquats,
    testLanguageEnglish,
    testLanguages
} from "tests/exerciseTestdata";
import { testProfileDataVerified } from "tests/userTestdata";
import { ExerciseDetails } from './ExerciseDetails';

jest.mock("services");
jest.mock("components/Exercises/queries");
jest.mock("components/User/queries/profile");
jest.mock("components/User/queries/permission");

const queryClient = new QueryClient();

describe("Render tests", () => {

    beforeEach(() => {
        (getExercise as jest.Mock).mockImplementation(() => Promise.resolve(testExerciseSquats));
        (getExercisesForVariation as jest.Mock).mockImplementation(() => Promise.resolve(
            [
                testExerciseCurls,
                testExerciseCrunches
            ]
        ));
        (getLanguageByShortName as jest.Mock).mockImplementation(() => Promise.resolve(testLanguageEnglish));
        (getLanguages as jest.Mock).mockImplementation(() => Promise.resolve(testLanguages));
        (useProfileQuery as jest.Mock).mockImplementation(() => Promise.resolve({
            isSuccess: true,
            data: testProfileDataVerified
        }));
        (usePermissionQuery as jest.Mock).mockImplementation(() => ({
            isSuccess: true,
            data: true
        }));
        (useLanguageQuery as jest.Mock).mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: testLanguages
        }));
    });

    test('should render the exercise to screen', async () => {

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/exercises/9']}>
                    <Routes>
                        <Route path="exercises/:exerciseId" element={<ExerciseDetails />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        await act(async () => {
            await new Promise((r) => setTimeout(r, 20));
        });

        expect(useLanguageQuery).toBeCalled();
        expect(usePermissionQuery).toBeCalled();
        expect(useProfileQuery).toBeCalled();
        expect(getExercise).toBeCalled();
        expect(getExercisesForVariation).toBeCalled();

        expect(screen.getByText("exercises.description")).toBeInTheDocument();
        expect(screen.getByText("Squats")).toBeInTheDocument();

        expect(screen.getByText("Biggus musculus (Big muscle)")).toBeInTheDocument();
        expect(screen.getByText('Rectus abdominis (Abs)')).toBeInTheDocument();

        // Header is only shown for exercises that have variations

        // TODO: commented out because for some reason this fails on githubs CI, but not locally
        // expect(screen.queryByText('exercises.variations')).not.toBeInTheDocument();
        // expect(screen.getByText("VIEW")).toBeInTheDocument();
    });
});
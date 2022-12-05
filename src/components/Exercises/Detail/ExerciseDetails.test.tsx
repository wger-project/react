import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { ExerciseDetails } from './ExerciseDetails';
import { MemoryRouter, Route, Routes } from 'react-router';
import { getExerciseBase, getExerciseBasesForVariation, getLanguageByShortName, getLanguages } from "services";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    testExerciseCrunches,
    testExerciseCurls,
    testExerciseSquats,
    testLanguageEnglish,
    testLanguages
} from "tests/exerciseTestdata";
import { useLanguageQuery } from "components/Exercises/queries";
import { testProfileDataVerified } from "tests/userTestdata";
import { usePermissionQuery } from "components/User/queries/permission";
import { useProfileQuery } from "components/User/queries/profile";

jest.mock("services");
jest.mock("components/Exercises/queries");
jest.mock("components/User/queries/profile");
jest.mock("components/User/queries/permission");

const queryClient = new QueryClient();

describe("Render tests", () => {

    beforeEach(() => {
        // @ts-ignore
        getExerciseBase.mockImplementation(() => Promise.resolve(testExerciseSquats));
        // @ts-ignore
        getExerciseBasesForVariation.mockImplementation(() => Promise.resolve(
            [
                testExerciseCurls,
                testExerciseCrunches
            ]
        ));
        // @ts-ignore
        getLanguageByShortName.mockImplementation(() => Promise.resolve(testLanguageEnglish));

        // @ts-ignore
        getLanguages.mockImplementation(() => Promise.resolve(languages));

        // @ts-ignore
        useProfileQuery.mockImplementation(() => Promise.resolve({
            isSuccess: true,
            data: testProfileDataVerified
        }));

        // @ts-ignore
        usePermissionQuery.mockImplementation(() => ({
            isSuccess: true,
            data: true
        }));

        // @ts-ignore
        useLanguageQuery.mockImplementation(() => ({
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
                        <Route path="exercises/:baseID" element={<ExerciseDetails />} />
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
        expect(getExerciseBase).toBeCalled();
        expect(getExerciseBasesForVariation).toBeCalled();

        expect(screen.getByText("exercises.description")).toBeInTheDocument();
        expect(screen.getByText("Squats")).toBeInTheDocument();

        expect(screen.getByText("Biggus musculus (server.big_muscle)")).toBeInTheDocument();
        expect(screen.getByText('Rectus abdominis (server.abs)')).toBeInTheDocument();

        // Header is only shown for exercises that have variations
        expect(screen.queryByText('exercises.variations')).not.toBeInTheDocument();
        expect(screen.getByText("VIEW")).toBeInTheDocument();

    });
});
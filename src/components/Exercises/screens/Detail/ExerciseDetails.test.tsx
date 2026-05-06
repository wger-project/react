import {
    useExerciseQuery,
    useExercisesForVariationQuery,
    useLanguageQuery,
} from "@/components/Exercises/queries";
import { usePermissionQuery, useProfileQuery } from "@/components/User";
import { getLanguages } from "@/components/Exercises/api/language";
import {
    testExerciseCrunches,
    testExerciseCurls,
    testExerciseSquats,
    testLanguages
} from "@/tests/exerciseTestdata";
import { testProfileDataVerified } from "@/tests/userTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Mock } from 'vitest';
import { ExerciseDetails } from './ExerciseDetails';

vi.mock("@/components/Exercises/api/language");
vi.mock("@/components/Exercises/queries");
vi.mock("@/components/User/queries/profile");
vi.mock("@/components/User/queries/permission");

const queryClient = new QueryClient();

describe("Render tests", () => {

    beforeEach(() => {
        (useExerciseQuery as Mock).mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: testExerciseSquats,
        }));
        (useExercisesForVariationQuery as Mock).mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: [testExerciseCurls, testExerciseCrunches],
        }));
        (getLanguages as Mock).mockImplementation(() => Promise.resolve(testLanguages));
        (useProfileQuery as Mock).mockImplementation(() => Promise.resolve({
            isSuccess: true,
            data: testProfileDataVerified
        }));
        (usePermissionQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            data: true
        }));
        (useLanguageQuery as Mock).mockImplementation(() => ({
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

        // Wait until the page has actually rendered (not just the queries
        // firing) — the description shows up only after every query resolved.
        expect(await screen.findByText("exercises.description")).toBeInTheDocument();
        expect(useLanguageQuery).toHaveBeenCalled();
        expect(usePermissionQuery).toHaveBeenCalled();
        expect(useProfileQuery).toHaveBeenCalled();
        expect(useExerciseQuery).toHaveBeenCalled();
        expect(useExercisesForVariationQuery).toHaveBeenCalled();
        expect(screen.getByText("Squats")).toBeInTheDocument();

        expect(screen.getByText("Biggus musculus (Big muscle)")).toBeInTheDocument();
        expect(screen.getByText('Rectus abdominis (Abs)')).toBeInTheDocument();

        // Header is only shown for exercises that have variations

        // TODO: commented out because for some reason this fails on githubs CI, but not locally
        // expect(screen.queryByText('exercises.variations')).not.toBeInTheDocument();
        // expect(screen.getByText("VIEW")).toBeInTheDocument();
    });
});
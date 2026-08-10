import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { compareValue, RoutineDetailsTable } from "@/components/Routines/screens/Detail/RoutineDetailsTable";
import { WorkoutLogAdapter } from "@/components/Routines/models/WorkoutLog";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getLanguages } from "@/components/Exercises/api/language";
import { getRoutine, getRoutineLogData } from "@/components/Routines/api/routine";
import { testLanguages } from "@/tests/exerciseTestdata";
import { testQueryClient } from "@/tests/queryClient";
import { testRoutine1, testRoutineLogData } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Exercises/api/language");
vi.mock("@/components/Routines/api/routine");

describe("Smoke tests the RoutineDetailsTable component", () => {

    beforeEach(() => {
        (getRoutine as Mock).mockResolvedValue(testRoutine1);
        (getLanguages as Mock).mockResolvedValue(testLanguages);
        (getRoutineLogData as Mock).mockResolvedValue(testRoutineLogData);
    });

    test('renders the routine table', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter initialEntries={['/test/101']}>
                    <Routes>
                        <Route path="/test/:routineId" element={<RoutineDetailsTable />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        await waitFor(() => {
            expect(getRoutine).toHaveBeenCalledTimes(1);
            expect(getLanguages).toHaveBeenCalledTimes(1);
            expect(getRoutineLogData).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByText('Test routine 1')).toBeInTheDocument();
        expect(screen.getByText('routines.sets')).toBeInTheDocument();
        expect(screen.getByText('routines.reps')).toBeInTheDocument();
        expect(screen.getByText('weight')).toBeInTheDocument();
        expect(screen.getByText('routines.restTime')).toBeInTheDocument();
        expect(screen.getByText('routines.rir')).toBeInTheDocument();
    });
});

describe('compareValue', () => {
    test('returns null when value is null or undefined', () => {
        expect(compareValue(null, 1, 10)).toBeNull();
        expect(compareValue(undefined, 1, 10)).toBeNull();
    });

    test('returns "lower" when value is less than from', () => {
        expect(compareValue(0, 1, 10)).toBe('lower');
    });

    test('returns "higher" when value is greater than to', () => {
        expect(compareValue(11, 1, 10)).toBe('higher');
    });

    test('returns "match" when value is within from and to', () => {
        expect(compareValue(5, 1, 10)).toBe('match');
    });

    test('returns "lower" when only from is set and value is less than from', () => {
        expect(compareValue(0, 1, null)).toBe('lower');
    });

    test('returns "higher" when only from is set and value is greater than from', () => {
        expect(compareValue(2, 1, null)).toBe('higher');
    });

    test('returns "match" when only from is set and value is equal to from', () => {
        expect(compareValue(1, 1, null)).toBe('match');
    });

    test('returns null when from and to are both null or undefined', () => {
        expect(compareValue(5, null, null)).toBeNull();
        expect(compareValue(5, undefined, undefined)).toBeNull();
    });

    test('compares against a target of zero coming from the API', () => {
        // A routine can ask for 0 RiR (train to failure) or a weight of 0 for a
        // bodyweight exercise. Such a target must still be compared against, so this
        // goes through the adapter instead of using a literal.
        const log = new WorkoutLogAdapter().fromJson({
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
            date: '2024-05-10',
            iteration: 1,
            exercise: 345,
            slot_entry: 2,
            repetitions: "10.00",
            repetitions_target: "10.00",
            weight: "0.00",
            weight_target: "0.00",
            rir: "0.00",
            rir_target: "0.00",
        });

        expect(compareValue(log.rir, log.rirTarget, null)).toBe('match');
        expect(compareValue(log.weight, log.weightTarget, null)).toBe('match');
    });
});
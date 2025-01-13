import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { RoutineEdit } from "components/WorkoutRoutines/Detail/RoutineEdit";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { getLanguages, getProfile, getRoutine } from "services";
import { testLanguages } from "tests/exerciseTestdata";
import { testQueryClient } from "tests/queryClient";
import { testProfileDataVerified } from "tests/userTestdata";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Smoke tests the RoutineDetailsTable component", () => {

    beforeEach(() => {
        (getRoutine as jest.Mock).mockResolvedValue(testRoutine1);
        (getProfile as jest.Mock).mockResolvedValue(testProfileDataVerified);
        (getLanguages as jest.Mock).mockResolvedValue(testLanguages);
    });

    test('renders the form', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter initialEntries={['/test/101']}>
                    <Routes>
                        <Route path="/test/:routineId" element={<RoutineEdit />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        await waitFor(() => {
            expect(getRoutine).toHaveBeenCalled();
            expect(getLanguages).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByText('editName')).toBeInTheDocument();
        screen.logTestingPlaygroundURL();
        expect(screen.queryAllByText('Every day is leg day 🦵🏻')).toHaveLength(3);
        expect(screen.getByText('durationWeeksDays')).toBeInTheDocument();
        expect(screen.queryAllByText('routines.restDay')).toHaveLength(2);
        expect(screen.queryAllByText('Pull day')).toHaveLength(2);
        expect(screen.queryAllByText('Full body routine')).toHaveLength(2);
        expect(screen.getByText('routines.addDay')).toBeInTheDocument();
        expect(screen.getByText('routines.resultingRoutine')).toBeInTheDocument();
        expect(screen.queryAllByText('Squats')).toHaveLength(2);
        expect(screen.getByText('4 Sets, 5 x 20 @ 2Rir')).toBeInTheDocument();
    });
});

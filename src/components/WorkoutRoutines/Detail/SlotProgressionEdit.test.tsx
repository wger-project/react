import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { SlotProgressionEdit } from "components/WorkoutRoutines/Detail/SlotProgressionEdit";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { getLanguages, getRoutine } from "services";
import { testLanguages } from "tests/exerciseTestdata";
import { getTestQueryClient } from "tests/queryClient";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Smoke tests the SlotProgressionEdit component", () => {

    beforeEach(() => {
        (getRoutine as jest.Mock).mockResolvedValue(testRoutine1);
        (getLanguages as jest.Mock).mockResolvedValue(testLanguages);
    });

    test('renders the progression page', async () => {

        // Act
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <MemoryRouter initialEntries={['/test/101/2']}>
                    <Routes>
                        <Route path="/test/:routineId/:slotId" element={<SlotProgressionEdit />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(getRoutine).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(screen.getByText('routines.editProgression')).toBeInTheDocument();
        });
        expect(screen.getByText('routines.editProgression')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
    });
});

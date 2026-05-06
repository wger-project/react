import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { SessionAdd } from "@/components/Routines/screens/Detail/SessionAdd";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getLanguages } from "@/components/Exercises/api/language";
import { getRoutine } from "@/components/Routines/api/routine";
import { searchSession } from "@/components/Routines/api/session";
import { testLanguages } from "@/tests/exerciseTestdata";
import { testQueryClient } from "@/tests/queryClient";
import { testWorkoutSession } from "@/tests/workoutLogsRoutinesTestData";
import { testRoutine1 } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Exercises/api/language");
vi.mock("@/components/Routines/api/routine");
vi.mock("@/components/Routines/api/session");

describe("Smoke tests the SessionAdd component", () => {

    beforeEach(() => {
        (getRoutine as Mock).mockResolvedValue(testRoutine1);
        (getLanguages as Mock).mockResolvedValue(testLanguages);
        (searchSession as Mock).mockResolvedValue(testWorkoutSession);
    });

    test('renders the form page', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter initialEntries={['/test/101/5']}>
                    <Routes>
                        <Route path="/test/:routineId/:dayId" element={<SessionAdd />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        await waitFor(() => {
            expect(getRoutine).toHaveBeenCalled();
            expect(getLanguages).toHaveBeenCalled();
            expect(searchSession).toHaveBeenCalled();
        });
        expect(screen.getByText('routines.addWeightLog')).toBeInTheDocument();
    });
});

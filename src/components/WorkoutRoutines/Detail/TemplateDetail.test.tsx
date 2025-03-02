import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { TemplateDetail } from "components/WorkoutRoutines/Detail/TemplateDetail";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { getLanguages, getRoutine } from "services";
import { testLanguages } from "tests/exerciseTestdata";
import { testQueryClient } from "tests/queryClient";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Smoke tests the TemplateDetail component", () => {

    beforeEach(() => {
        (getRoutine as jest.Mock).mockResolvedValue(testRoutine1);
        (getLanguages as jest.Mock).mockResolvedValue(testLanguages);
    });

    test('renders all public templates', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter initialEntries={['/test/101']}>
                    <Routes>
                        <Route path="/test/:routineId" element={<TemplateDetail />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        await waitFor(() => {
            expect(getRoutine).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByText('Test routine 1')).toBeInTheDocument();
        expect(screen.getByText('Full body routine')).toBeInTheDocument();
        expect(screen.getByText('routines.template')).toBeInTheDocument();
        expect(screen.getByText('routines.copyAndUseTemplate')).toBeInTheDocument();
    });
});

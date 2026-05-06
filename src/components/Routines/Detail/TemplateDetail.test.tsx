import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { TemplateDetail } from "@/components/Routines/Detail/TemplateDetail";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getLanguages, getRoutine } from "@/services";
import { testLanguages } from "@/tests/exerciseTestdata";
import { getTestQueryClient } from "@/tests/queryClient";
import { testRoutine1 } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock("@/services");

describe("Smoke tests the TemplateDetail component", () => {

    beforeEach(() => {
        (getRoutine as Mock).mockResolvedValue(testRoutine1);
        (getLanguages as Mock).mockResolvedValue(testLanguages);
    });

    test('renders all public templates', async () => {

        // Act
        render(
            <QueryClientProvider client={getTestQueryClient()}>
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
        await waitFor(() => {
            expect(screen.getByText('Test routine 1')).toBeInTheDocument();
        });
        expect(screen.getByText('Full body routine')).toBeInTheDocument();
        expect(screen.getByText('routines.template')).toBeInTheDocument();
        expect(screen.getByText('routines.copyAndUseTemplate')).toBeInTheDocument();
    });
});

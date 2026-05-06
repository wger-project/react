import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { RoutineOverview } from "@/components/Routines/Overview/RoutineOverview";
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { getRoutinesShallow } from "@/services";
import { testQueryClient } from "@/tests/queryClient";
import { TEST_ROUTINES } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock("@/services");

describe("Smoke tests the RoutineOverview component", () => {

    beforeEach(() => {
        (getRoutinesShallow as Mock).mockResolvedValue(TEST_ROUTINES);
    });

    test('renders all routines', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={testQueryClient}>
                    <RoutineOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        // Assert
        await waitFor(() => expect(getRoutinesShallow).toHaveBeenCalledTimes(1));
        expect(await screen.findByText('Test routine 1')).toBeInTheDocument();
        expect(screen.getByText('routines.routine')).toBeInTheDocument();
        expect(screen.getByText('routines.routines')).toBeInTheDocument();
    });
});

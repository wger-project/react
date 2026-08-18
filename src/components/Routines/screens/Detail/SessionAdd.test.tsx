import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionAdd } from "@/components/Routines/screens/Detail/SessionAdd";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getLanguages } from "@/components/Exercises/api/language";
import { getRoutine } from "@/components/Routines/api/routine";
import { searchSessions } from "@/components/Routines/api/session";
import { testLanguages } from "@/tests/exerciseTestdata";
import { testQueryClient } from "@/tests/queryClient";
import { WorkoutSession } from "@/components/Routines/models/WorkoutSession";
import { DateTime } from "luxon";
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
        (searchSessions as Mock).mockResolvedValue([testWorkoutSession]);
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
            expect(searchSessions).toHaveBeenCalled();
        });
        expect(screen.getByText('routines.addWeightLog')).toBeInTheDocument();
    });

    test('asks which session to work on again after the date changed', async () => {

        // Arrange
        const sessionOn = (id: string, hour: number, notes: string) => new WorkoutSession({
            id: id,
            dayId: 5,
            routineId: 101,
            notes: notes,
            impression: '2',
            datetimeStart: DateTime.now().startOf('day').set({ hour: hour }).toJSDate(),
            datetimeEnd: null,
        });
        (searchSessions as Mock).mockResolvedValue([
            sessionOn('bbbbbbbb-bbbb-bbbb-bbbb-000000000001', 8, 'morning workout'),
            sessionOn('bbbbbbbb-bbbb-bbbb-bbbb-000000000002', 18, 'evening workout'),
        ]);
        const user = userEvent.setup();

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
        await waitFor(() => expect(screen.getByText(/morning workout/)).toBeInTheDocument());
        await user.click(screen.getByText(/morning workout/));
        await waitFor(() => expect(screen.getByRole('textbox', { name: /notes/i })).toBeInTheDocument());

        // Act - move the form to another day
        const dateGroup = screen.getByRole('group', { name: /date/i });
        await user.click(within(dateGroup).getByRole('spinbutton', { name: /year/i }));
        await user.keyboard('2025');

        // Assert
        // The sessions of another date are different ones, so the screen drops
        // the pick instead of carrying it over
        await waitFor(() => expect(screen.getByText('routines.multipleSessions')).toBeInTheDocument());
    });
});

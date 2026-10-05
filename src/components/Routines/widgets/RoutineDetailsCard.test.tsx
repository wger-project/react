import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { useRoutineDetailQuery } from "@/components/Routines/queries";
import { RoutineDetailsCard } from "@/components/Routines/widgets/RoutineDetailsCard";
import React from 'react';
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { testRoutine1 } from "@/tests/workoutRoutinesTestData";
import { testExerciseBenchPress } from "@/tests/exerciseTestdata";
import { Day } from "@/components/Routines/models/Day";
import { Routine } from "@/components/Routines/models/Routine";
import { Slot } from "@/components/Routines/models/Slot";
import { SlotEntry } from "@/components/Routines/models/SlotEntry";
import type { Mock } from 'vitest';

vi.mock("@/components/Exercises/api/language");
vi.mock("@/components/Routines/queries");

const queryClient = new QueryClient();

describe("Test the RoutineDetail component", () => {

    beforeEach(() => {
        (useRoutineDetailQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testRoutine1
        }));
    });

    test('renders a specific routine', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/routine/101']}>
                    <Routes>
                        <Route path="routine/:routineId" element={<RoutineDetailsCard />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(useRoutineDetailQuery).toHaveBeenCalledWith(101);
        expect(screen.getByText('Full body routine')).toBeInTheDocument();
        expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
    });

    test('renders days the sequence has no data for', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/routine/101']}>
                    <Routes>
                        <Route path="routine/:routineId" element={<RoutineDetailsCard />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert: only the leg day has data, the other two are in the structure only
        expect(screen.getByText('Pull day')).toBeInTheDocument();
        expect(screen.getByText('routines.restDay')).toBeInTheDocument();
    });

    test('links the exercises to their detail page', async () => {

        // Arrange: a day the sequence has no data for, with an exercise in it
        const pushDay = new Day({
            id: 7,
            routineId: 1,
            order: 4,
            name: 'Push day',
            description: '',
            isRest: false,
            needLogsToAdvance: false,
            type: 'custom',
            config: null,
            slots: [
                new Slot({
                    id: 3,
                    dayId: 7,
                    order: 1,
                    comment: '',
                    config: null,
                    entries: [
                        new SlotEntry({
                            id: 3,
                            slotId: 3,
                            exerciseId: 2,
                            exercise: testExerciseBenchPress,
                            repetitionUnitId: 1,
                            repetitionRounding: 1,
                            weightUnitId: 1,
                            weightRounding: 1,
                            order: 1,
                            comment: '',
                            type: 'normal',
                            config: null
                        })
                    ]
                })
            ]
        });
        (useRoutineDetailQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: new Routine({
                id: testRoutine1.id,
                name: testRoutine1.name,
                description: testRoutine1.description,
                created: testRoutine1.created,
                start: testRoutine1.start,
                end: testRoutine1.end,
                fitInWeek: testRoutine1.fitInWeek,
                isTemplate: testRoutine1.isTemplate,
                isPublic: testRoutine1.isPublic,
                days: [...testRoutine1.days, pushDay],
                dayData: testRoutine1.dayData,
            })
        }));

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/routine/101']}>
                    <Routes>
                        <Route path="routine/:routineId" element={<RoutineDetailsCard />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert: exercises from the sequence and from the structure-only days
        expect(screen.getByRole('link', { name: 'Squats' })).toHaveAttribute(
            'href',
            expect.stringMatching(/\/exercise\/345\/view\/squats$/)
        );
        expect(screen.getByRole('link', { name: 'Benchpress' })).toHaveAttribute(
            'href',
            expect.stringMatching(/\/exercise\/2\/view\/benchpress$/)
        );
    });
});

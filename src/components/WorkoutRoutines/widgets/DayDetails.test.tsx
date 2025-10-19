import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { Day } from "components/WorkoutRoutines/models/Day";
import { DayDragAndDropGrid } from "components/WorkoutRoutines/widgets/DayDetails";
import React from 'react';
import { addDay, getRoutine } from "services";
import { getTestQueryClient } from "tests/queryClient";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Test the DayDragAndDropGrid component", () => {
    let user: ReturnType<typeof userEvent.setup>;
    let mockSetSelectedDay: jest.Mock;
    const mockAddDay = addDay as jest.Mock;

    beforeEach(() => {
        mockSetSelectedDay = jest.fn();
        user = userEvent.setup();
        (getRoutine as jest.Mock).mockResolvedValue(testRoutine1);
        mockAddDay.mockResolvedValue(testRoutine1.days[0]);
    });

    test('correctly renders the days', async () => {

        // Act
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <DayDragAndDropGrid routineId={222} selectedDayIndex={0} setSelectedDayIndex={mockSetSelectedDay} />
            </QueryClientProvider>
        );

        // Assert
        expect(getRoutine).toHaveBeenCalled();
        await waitFor(() => {
            expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        });
        expect(screen.getByText('routines.restDay')).toBeInTheDocument();
        expect(screen.getByText('Pull day')).toBeInTheDocument();
        expect(mockSetSelectedDay).not.toHaveBeenCalled();
    });

    test('correctly adds a new day', async () => {

        // Act
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <DayDragAndDropGrid routineId={222} selectedDayIndex={0} setSelectedDayIndex={mockSetSelectedDay} />
            </QueryClientProvider>
        );
        await waitFor(() => {
            expect(getRoutine).toHaveBeenCalled();
        });
        await waitFor(async () => {
            await user.click(screen.getByRole('button', { name: 'routines.addDay' }));
        });

        // Assert
        expect(mockAddDay).toHaveBeenCalledWith(new Day({
            isRest: false,
            name: "routines.newDay 4",
            needLogsToAdvance: false,
            order: 4,
            routineId: 222,
        }));
        expect(mockSetSelectedDay).toHaveBeenCalledWith(3);
    });
});

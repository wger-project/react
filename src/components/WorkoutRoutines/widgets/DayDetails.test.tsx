import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { Day } from "components/WorkoutRoutines/models/Day";
import { DayDetails, DayDragAndDropGrid } from "components/WorkoutRoutines/widgets/DayDetails";
import React from 'react';
import { MemoryRouter } from "react-router-dom";
import { addDay, getLanguages, getProfile, getRoutine } from "services";
import { getTestQueryClient } from "tests/queryClient";
import { testProfileDataVerified } from "tests/userTestdata";
import { testDayLegs, testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Test the DayDragAndDropGrid component", () => {
    let user: ReturnType<typeof userEvent.setup>;
    let mockSetSelectedDay: jest.Mock;
    const mockAddDay = addDay as jest.Mock;

    beforeEach(() => {
        mockSetSelectedDay = jest.fn();
        user = userEvent.setup();
        (getRoutine as jest.Mock).mockResolvedValue(testRoutine1);
        (getLanguages as jest.Mock).mockResolvedValue([]);
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


describe("DayDetails component", () => {
    let mockSetSelectedDay: jest.Mock;

    beforeEach(() => {
        mockSetSelectedDay = jest.fn();
        (getProfile as jest.Mock).mockResolvedValue(testProfileDataVerified);
        (getLanguages as jest.Mock).mockResolvedValue([]);
    });

    const renderComponent = (day: Day = testDayLegs) => {
        const queryClient = getTestQueryClient();
        queryClient.setQueryData(['profile'], testProfileDataVerified);

        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <DayDetails
                        day={day}
                        routineId={1}
                        setSelectedDayIndex={mockSetSelectedDay}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        );
    };

    // testRoutine1.days = [testDayLegs, testRestDay, testDayPull]
    const testRestDay = testRoutine1.days[1];
    const testDayWithoutSlots = testRoutine1.days[2];

    test('renders add exercise button', () => {
        renderComponent();
        expect(screen.getByText('routines.addExercise')).toBeInTheDocument();
    });

    test('does not render add exercise button for rest day', () => {
        renderComponent(testRestDay);
        expect(screen.queryByText('routines.addExercise')).not.toBeInTheDocument();
    });

    test('renders simple mode toggle when day has slots', () => {
        renderComponent();
        expect(screen.getByText('routines.simpleMode')).toBeInTheDocument();
    });

    test('does not render simple mode toggle for rest day', () => {
        renderComponent(testRestDay);
        expect(screen.queryByText('routines.simpleMode')).not.toBeInTheDocument();
    });

    test('does not render simple mode toggle when day has no slots', () => {
        renderComponent(testDayWithoutSlots);
        expect(screen.queryByText('routines.simpleMode')).not.toBeInTheDocument();
    });

    // -- useSlotDeletion --

    test('clicking delete removes slot and shows snackbar', async () => {
        const user = userEvent.setup();
        renderComponent(testDayLegs);

        // Find the slot delete button (skip the DayForm's delete icon)
        const deleteIcons = screen.getAllByTestId('DeleteIcon');
        await user.click(deleteIcons[1].closest('button')!);

        // Snackbar should appear
        expect(screen.getByText('Set successfully deleted')).toBeInTheDocument();
        expect(screen.getByText('undo')).toBeInTheDocument();
    });
});

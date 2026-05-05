import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { Day } from "@/components/WorkoutRoutines/models/Day";
import { Slot } from "@/components/WorkoutRoutines/models/Slot";
import { SlotEntry } from "@/components/WorkoutRoutines/models/SlotEntry";
import { DayDetails, DayDragAndDropGrid, groupSlotsByExercise } from "@/components/WorkoutRoutines/widgets/DayDetails";
import React from 'react';
import { MemoryRouter } from "react-router-dom";
import { addDay, addSlot, getLanguages, getProfile, getRoutine } from "@/services";
import { addSlotEntry } from "@/services/slot_entry";
import { getTestQueryClient } from "@/tests/queryClient";
import { testProfileDataVerified } from "@/tests/userTestdata";
import { testDayLegs, testRoutine1 } from "@/tests/workoutRoutinesTestData";

jest.mock("@/services");
jest.mock("@/services/slot_entry");

const makeSlot = (id: number, exerciseId: number) => new Slot({
    id, dayId: 1, order: id, comment: '', config: null,
    entries: [
        new SlotEntry({
            id, slotId: id, exerciseId,
            repetitionUnitId: 1, repetitionRounding: 1,
            weightUnitId: 1, weightRounding: 1,
            order: 1, comment: '', type: 'normal', config: null,
        })
    ]
});

const makeEmptySlot = (id: number) => new Slot({
    id, dayId: 1, order: id, comment: '', config: null, entries: []
});

const makeSupersetSlot = (id: number, exerciseIds: number[]) => new Slot({
    id, dayId: 1, order: id, comment: '', config: null,
    entries: exerciseIds.map((exId, i) => new SlotEntry({
        id: id * 100 + i, slotId: id, exerciseId: exId,
        repetitionUnitId: 1, repetitionRounding: 1,
        weightUnitId: 1, weightRounding: 1,
        order: i + 1, comment: '', type: 'normal', config: null,
    }))
});

describe("groupSlotsByExercise", () => {

    test('groups consecutive slots with the same exercise', () => {
        const slots = [makeSlot(1, 10), makeSlot(2, 10), makeSlot(3, 10)];
        const groups = groupSlotsByExercise(slots);

        expect(groups).toHaveLength(1);
        expect(groups[0].exerciseId).toBe(10);
        expect(groups[0].slots).toHaveLength(3);
    });

    test('does not group non-consecutive slots with the same exercise', () => {
        const slots = [makeSlot(1, 10), makeSlot(2, 20), makeSlot(3, 10)];
        const groups = groupSlotsByExercise(slots);

        expect(groups).toHaveLength(3);
        expect(groups[0].exerciseId).toBe(10);
        expect(groups[1].exerciseId).toBe(20);
        expect(groups[2].exerciseId).toBe(10);
    });

    test('does not group superset slots (multiple entries)', () => {
        const slots = [makeSupersetSlot(1, [10, 20]), makeSlot(2, 10)];
        const groups = groupSlotsByExercise(slots);

        expect(groups).toHaveLength(2);
        expect(groups[0].slots).toHaveLength(1);
        expect(groups[1].slots).toHaveLength(1);
    });

    test('does not group empty slots', () => {
        const slots = [makeEmptySlot(1), makeEmptySlot(2)];
        const groups = groupSlotsByExercise(slots);

        expect(groups).toHaveLength(2);
    });

    test('handles mixed slots correctly', () => {
        const slots = [
            makeSlot(1, 10),
            makeSlot(2, 10),
            makeSupersetSlot(3, [10, 20]),
            makeSlot(4, 30),
            makeSlot(5, 30),
        ];
        const groups = groupSlotsByExercise(slots);

        expect(groups).toHaveLength(3);
        expect(groups[0].slots).toHaveLength(2);  // 2x exercise 10
        expect(groups[1].slots).toHaveLength(1);  // superset
        expect(groups[2].slots).toHaveLength(2);  // 2x exercise 30
    });

    test('preserves original indices', () => {
        const slots = [makeSlot(1, 10), makeSlot(2, 20), makeSlot(3, 20)];
        const groups = groupSlotsByExercise(slots);

        expect(groups[1].slots[0].originalIndex).toBe(1);
        expect(groups[1].slots[1].originalIndex).toBe(2);
    });
});

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

    // handleDuplicateSlot
    test('duplicate inserts new slot after source with correct order and exerciseId', async () => {
        const user = userEvent.setup();

        const mockAddSlot = addSlot as jest.Mock;
        mockAddSlot.mockResolvedValue(new Slot({ id: 999, dayId: 5, order: 2 }));
        (addSlotEntry as jest.Mock).mockResolvedValue({});

        renderComponent(testDayLegs);

        // Click "Add set" on the first slot
        const addSetButtons = screen.getAllByText('routines.addSet');
        await user.click(addSetButtons[0]);

        // New slot should be created with order = sourceIndex + 2 (1-based, after source)
        await waitFor(() => {
            expect(mockAddSlot).toHaveBeenCalledWith(
                expect.objectContaining({ order: 2 })
            );
        });

        // SlotEntry should be created with the same exerciseId as the source
        await waitFor(() => {
            expect(addSlotEntry).toHaveBeenCalledWith(
                expect.objectContaining({ exerciseId: testDayLegs.slots[0].entries[0].exerciseId })
            );
        });
    });
});

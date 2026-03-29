import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotEntry } from "components/WorkoutRoutines/models/SlotEntry";
import { SlotHeader } from "components/WorkoutRoutines/widgets/slots/SlotHeader";
import React from 'react';
import { MemoryRouter } from "react-router-dom";
import { testDayLegs } from "tests/workoutRoutinesTestData";

const testSlotEntry = (id: number, slotId: number) => new SlotEntry({
    id, slotId, exerciseId: id,
    repetitionUnitId: 1, repetitionRounding: 1,
    weightUnitId: 1, weightRounding: 1,
    order: id, comment: '', type: 'normal', config: null
});

const slotWithTwoEntries = new Slot({
    id: 2, dayId: 1, order: 1, comment: '', config: null,
    entries: [testSlotEntry(1, 2), testSlotEntry(2, 2)]
});

const emptySlot = new Slot({
    id: 3, dayId: 1, order: 1, comment: '', config: null,
    entries: []
});

describe("SlotHeader component", () => {
    const defaultProps = {
        slot: testDayLegs.slots[0],
        index: 0,
        dragHandleProps: null,
        routineId: 1,
        onDelete: jest.fn(),
        onDuplicate: jest.fn(),
        onAddSuperset: jest.fn(),
        addSupersetIsPending: false,
    };

    const renderComponent = (props = {}) => render(
        <MemoryRouter>
            <SlotHeader {...defaultProps} {...props} />
        </MemoryRouter>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders exercise label for single-entry slot', () => {
        renderComponent();
        expect(screen.getByText('routines.exerciseNr')).toBeInTheDocument();
    });

    test('renders superset label for multi-entry slot', () => {
        renderComponent({ slot: slotWithTwoEntries });
        expect(screen.getByText('routines.supersetNr')).toBeInTheDocument();
    });

    test('renders add superset button when slot has entries', () => {
        renderComponent();
        expect(screen.getByText('routines.addSuperset')).toBeInTheDocument();
    });

    test('does not render add superset button when slot is empty', () => {
        renderComponent({ slot: emptySlot });
        expect(screen.queryByText('routines.addSuperset')).not.toBeInTheDocument();
    });

    test('renders edit progression link', () => {
        renderComponent();
        expect(screen.getByText('routines.editProgression')).toBeInTheDocument();
    });

    test('calls onDelete when delete button is clicked', async () => {
        const onDelete = jest.fn();
        renderComponent({ onDelete });

        const deleteIcon = screen.getByTestId('DeleteIcon');
        await userEvent.click(deleteIcon.closest('button')!);

        expect(onDelete).toHaveBeenCalledWith(testDayLegs.slots[0].id);
    });

    test('calls onAddSuperset when button is clicked', async () => {
        const onAddSuperset = jest.fn();
        renderComponent({ onAddSuperset });

        await userEvent.click(screen.getByText('routines.addSuperset'));

        expect(onAddSuperset).toHaveBeenCalledWith(testDayLegs.slots[0].id);
    });

    // grouped mode
    test('renders "Set N" label when grouped', () => {
        renderComponent({ groupSize: 3, indexInGroup: 1 });
        expect(screen.getByText('routines.setNr')).toBeInTheDocument();
        expect(screen.queryByText('routines.exerciseNr')).not.toBeInTheDocument();
    });

    test('does not render add superset or add set buttons when grouped', () => {
        renderComponent({ groupSize: 3, indexInGroup: 0 });
        expect(screen.queryByText('routines.addSuperset')).not.toBeInTheDocument();
        expect(screen.queryByText('routines.addSet')).not.toBeInTheDocument();
    });
});

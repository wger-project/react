import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { DraggableSlotItem } from "@/components/WorkoutRoutines/widgets/slots/DraggableSlotItem";
import React from 'react';
import { MemoryRouter } from "react-router-dom";
import { getLanguages } from "@/services";
import { getTestQueryClient } from "@/tests/queryClient";
import { testDayLegs } from "@/tests/workoutRoutinesTestData";

jest.mock("@/services");

describe("DraggableSlotItem component", () => {
    const defaultProps = {
        slot: testDayLegs.slots[0],
        index: 0,
        routineId: 1,
        simpleMode: true,
        showAutocompleter: false,
        onDelete: jest.fn(),
        onDuplicate: jest.fn(),
        onAddSuperset: jest.fn(),
        addSupersetIsPending: false,
        onExerciseSelected: jest.fn(),
    };

    const renderComponent = (props = {}) => render(
        <QueryClientProvider client={getTestQueryClient()}>
            <MemoryRouter>
                <DragDropContext onDragEnd={jest.fn()}>
                    <Droppable droppableId="test">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                <DraggableSlotItem {...defaultProps} {...props} />
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </MemoryRouter>
        </QueryClientProvider>
    );

    beforeEach(() => {
        jest.clearAllMocks();
        (getLanguages as jest.Mock).mockResolvedValue([]);
    });

    test('renders SlotHeader with exercise label', () => {
        renderComponent();
        expect(screen.getByText('routines.exerciseNr')).toBeInTheDocument();
    });

    test('renders SlotDetails', () => {
        renderComponent();
        expect(screen.getByTestId('sets-field')).toBeInTheDocument();
    });

    test('delegates onDelete to SlotHeader', async () => {
        const onDelete = jest.fn();
        renderComponent({ onDelete });

        const deleteIcon = screen.getByTestId('DeleteIcon');
        await userEvent.click(deleteIcon.closest('button')!);

        expect(onDelete).toHaveBeenCalledWith(testDayLegs.slots[0].id);
    });
});

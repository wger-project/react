import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { DraggableSlotItem } from "@/components/Routines/widgets/slots/DraggableSlotItem";
import React from 'react';
import { MemoryRouter } from "react-router-dom";
import { getLanguages } from "@/services";
import { getTestQueryClient } from "@/tests/queryClient";
import { testDayLegs } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock("@/services");

describe("DraggableSlotItem component", () => {
    const defaultProps = {
        slot: testDayLegs.slots[0],
        index: 0,
        routineId: 1,
        simpleMode: true,
        showAutocompleter: false,
        onDelete: vi.fn(),
        onDuplicate: vi.fn(),
        onAddSuperset: vi.fn(),
        addSupersetIsPending: false,
        onExerciseSelected: vi.fn(),
    };

    const renderComponent = (props = {}) => render(
        <QueryClientProvider client={getTestQueryClient()}>
            <MemoryRouter>
                <DragDropContext onDragEnd={vi.fn()}>
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
        vi.clearAllMocks();
        (getLanguages as Mock).mockResolvedValue([]);
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
        const onDelete = vi.fn();
        renderComponent({ onDelete });

        const deleteIcon = screen.getByTestId('DeleteIcon');
        await userEvent.click(deleteIcon.closest('button')!);

        expect(onDelete).toHaveBeenCalledWith(testDayLegs.slots[0].id);
    });
});

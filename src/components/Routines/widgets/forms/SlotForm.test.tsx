import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { Slot } from "@/components/Routines/models/Slot";
import { SlotForm } from "@/components/Routines/widgets/forms/SlotForm";
import { editSlot } from "@/components/Routines/api/slot";
import { testQueryClient } from "@/tests/queryClient";
import { testDayLegs } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';


vi.mock("@/components/Routines/api/slot");

let user: ReturnType<typeof userEvent.setup>;
const mockEditSlot = editSlot as Mock;

describe('SlotForm', () => {

    beforeEach(() => {
        user = userEvent.setup();
        vi.resetAllMocks();
    });

    test('correctly updates the slot entry on change', async () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SlotForm
                    slot={testDayLegs.slots[0]}
                    routineId={1}
                />
            </QueryClientProvider>
        );


        const inputElement = screen.getByRole('textbox', { name: /comment/i });
        await user.click(inputElement);
        await user.type(inputElement, 'This is a test comment');
        await user.tab();

        const clonedSlot = Slot.clone(testDayLegs.slots[0], { comment: 'This is a test comment' });

        expect(mockEditSlot).toHaveBeenCalledTimes(1);
        expect(mockEditSlot).toHaveBeenCalledWith(clonedSlot);
    });
});

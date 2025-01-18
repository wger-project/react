import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { SlotForm } from "components/WorkoutRoutines/widgets/forms/SlotForm";
import { editSlot } from "services";
import { testQueryClient } from "tests/queryClient";
import { testDayLegs } from "tests/workoutRoutinesTestData";


jest.mock("services");

let user: ReturnType<typeof userEvent.setup>;
const mockEditSlot = editSlot as jest.Mock;

describe('SlotForm', () => {

    beforeEach(() => {
        user = userEvent.setup();
        jest.resetAllMocks();
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

        expect(mockEditSlot).toHaveBeenCalledTimes(1);
        expect(mockEditSlot).toHaveBeenCalledWith({ id: 1, comment: 'This is a test comment' });
    });
});

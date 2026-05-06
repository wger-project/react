import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useProfileQuery } from "@/components/User";
import { DayForm } from "@/components/Routines/widgets/forms/DayForm";
import { editDay } from "@/services";
import { testQueryClient } from "@/tests/queryClient";
import { testProfileDataVerified } from "@/tests/userTestdata";
import { testRoutine1 } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';


vi.mock("@/services");
vi.mock("@/components/User/queries/profile");
const mockEditDay = editDay as Mock;
const mockUseProfileQuery = useProfileQuery as Mock;


describe('Tests for the DayForm', () => {

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        mockEditDay.mockClear();

        mockUseProfileQuery.mockImplementation(() => (
            { isLoading: false, data: testProfileDataVerified }
        ));
    });

    function renderWidget() {
        render(
            <QueryClientProvider client={testQueryClient}>
                <DayForm
                    day={testRoutine1.days[0]}
                    routineId={1}
                    setSelectedDayIndex={vi.fn()}
                />
            </QueryClientProvider>
        );
    }


    test('smoke test - just render the form', async () => {

        // Act
        renderWidget();

        // Assert
        expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Every day is leg day 🦵🏻');
        expect(screen.getByRole('switch', { name: /routines\.restday/i })).not.toBeChecked();
        expect(screen.getByRole('switch', { name: /routines\.needslogstoadvance/i })).not.toBeChecked();
        expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue('');
    });


    test('correct data sent to the server', async () => {

        // Act
        renderWidget();

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        await user.clear(nameInput);
        await user.type(nameInput, 'New name');

        const descriptionInput = screen.getByRole('textbox', { name: /description/i });
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'New description');

        await user.click(screen.getByRole('button', { name: /save/i }));

        // Assert
        expect(mockEditDay).toHaveBeenCalledTimes(1);
        expect(mockEditDay).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 5,
                routineId: 1,
                order: 1,
                name: 'New name',
                description: 'New description',
                isRest: false,
                needLogsToAdvance: false
            })
        );
    });
});
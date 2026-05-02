import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Meal } from "components/Nutrition/models/meal";
import { useAddMealQuery, useEditMealQuery } from "components/Nutrition/queries";
import { MealForm } from "components/Nutrition/widgets/forms/MealForm";
import { TEST_MEAL_1 } from "tests/nutritionTestdata";

jest.mock('components/Nutrition/queries');

describe('Test the MealForm component', () => {
    const queryClient = new QueryClient();
    let mutateAddMock = jest.fn();
    let mutateEditMock = jest.fn();
    let closeFnMock = jest.fn();

    beforeEach(() => {
        mutateAddMock = jest.fn();
        mutateEditMock = jest.fn();
        closeFnMock = jest.fn();

        (useEditMealQuery as jest.Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        (useAddMealQuery as jest.Mock).mockImplementation(() => ({ mutate: mutateAddMock }));
    });

    test('a new meal is correctly added', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MealForm planId="aaaaaaaa-0000-0000-0000-000000000987" closeFn={closeFnMock} />
            </QueryClientProvider>
        );

        const nameInput = screen.getByLabelText('description');
        await user.clear(nameInput);
        await user.type(nameInput, '2nd breakfast');

        const submitButton = screen.getByRole('button', { name: 'submit' });
        await user.click(submitButton);

        // Assert
        expect(mutateEditMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateAddMock).toHaveBeenCalledWith(new Meal({
            name: '2nd breakfast',
            planId: 'aaaaaaaa-0000-0000-0000-000000000987',
            time: expect.any(Date),
        }));
    });

    test('an existing meal is correctly edited', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MealForm planId="aaaaaaaa-0000-0000-0000-000000000987" meal={TEST_MEAL_1} closeFn={closeFnMock} />
            </QueryClientProvider>
        );

        const nameInput = screen.getByLabelText('description');
        await user.clear(nameInput);
        await user.type(nameInput, '2nd breakfast');

        const submitButton = screen.getByRole('button', { name: 'submit' });
        await user.click(submitButton);

        // Assert
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'bbbbbbbb-0000-0000-0000-000000000078',
                name: '2nd breakfast',
                order: 2,
                planId: 'aaaaaaaa-0000-0000-0000-000000000123',
                time: TEST_MEAL_1.time
            })
        );
    });
});

import { useAddMealItemQuery, useEditMealItemQuery, useSearchIngredientQuery } from "@/components/Nutrition/queries";
import { MealItemForm } from "@/components/Nutrition/widgets/forms/MealItemForm";
import { SEARCH_DEBOUNCE_MS } from "@/components/Nutrition/widgets/IngredientAutcompleter";
import { searchIngredient } from "@/components/Nutrition/api/ingredient";
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2 } from "@/tests/ingredientTestdata";
import { TEST_MEAL_ITEM_1 } from "@/tests/nutritionTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import type { Mock } from 'vitest';

const DEBOUNCE_WAIT_MS = SEARCH_DEBOUNCE_MS + 100;

vi.mock('@/components/Nutrition/queries');
vi.mock("@/components/Nutrition/api/ingredient");

// Note: this helper still relies on a real-time sleep rather than waitFor.
// The MUI Autocomplete flow with a prefilled value has subtle ordering
// requirements between the typed search, the dropdown render, and ArrowDown+
// Enter — replacing the sleep with waitFor on searchIngredient changes the
// outcome of "An existing entry should be updated" (display value differs).
// Worth revisiting if/when the test expectations are modernized.
async function fillInEntry(user: UserEvent) {
    const autocomplete = screen.getByTestId('autocomplete');
    const input = within(autocomplete).getByRole('combobox');
    await user.click(autocomplete);
    await user.type(input, 'Bagu');

    // Wait for debounce
    await act(async () => {
        await new Promise((r) => setTimeout(r, DEBOUNCE_WAIT_MS));
    });

    // Select the first result
    await user.click(input);
    await user.keyboard('{ArrowDown}{Enter}');

    const amountInput = screen.getByLabelText('amount');
    await user.clear(amountInput);
    await user.type(amountInput, '120');
    const submitButton = screen.getByRole('button', { name: 'submit' });
    await user.click(submitButton);
}

describe('Test the MealItemForm component', () => {
    const queryClient = new QueryClient();
    let mutateAddMock = vi.fn();
    let mutateEditMock = vi.fn();
    let closeFnMock = vi.fn();

    beforeEach(() => {
        mutateAddMock = vi.fn();
        mutateEditMock = vi.fn();
        closeFnMock = vi.fn();

        (useEditMealItemQuery as Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        (useAddMealItemQuery as Mock).mockImplementation(() => ({ mutate: mutateAddMock }));
        (searchIngredient as Mock).mockImplementation(() => Promise.resolve([TEST_INGREDIENT_1, TEST_INGREDIENT_2]));
        (useSearchIngredientQuery as Mock).mockImplementation(() => searchIngredient);
    });

    test('A new entry should be added', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MealItemForm mealId={123} planId={987} closeFn={closeFnMock} />
            </QueryClientProvider>
        );
        await fillInEntry(user);

        // Assert
        expect(screen.getByDisplayValue('0% fat Greek style yogurt')).toBeInTheDocument();
        expect(screen.getByDisplayValue('120')).toBeInTheDocument();
        expect(mutateEditMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateAddMock).toHaveBeenCalledWith(
            expect.objectContaining({
                mealId: 123,
                amount: 120,
                ingredientId: 101,
                weightUnitId: null,
            })
        );
    });
    test('An existing entry should be updated', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MealItemForm planId={987} item={TEST_MEAL_ITEM_1} closeFn={closeFnMock} />
            </QueryClientProvider>
        );
        await fillInEntry(user);

        // Assert
        expect(screen.getByDisplayValue('1001 Nacht Haferbrei')).toBeInTheDocument();
        expect(screen.getByDisplayValue('120')).toBeInTheDocument();
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 42,
                mealId: 1001,
                amount: 120,
                order: 3,
                ingredientId: 101,
                weightUnitId: null,
            })
        );
    });
});

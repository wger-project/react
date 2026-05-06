import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import {
    useAddDiaryEntryQuery,
    useEditDiaryEntryQuery,
    useSearchIngredientQuery
} from "@/components/Nutrition/queries";
import { NutritionDiaryEntryForm } from "@/components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { searchIngredient } from "@/services";
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2 } from "@/tests/ingredientTestdata";
import { TEST_DIARY_ENTRY_1 } from "@/tests/nutritionDiaryTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from "@testing-library/user-event";
import React from 'react';
import type { Mock } from 'vitest';

vi.mock('@/components/Nutrition/queries');
vi.mock('@/services');

async function fillInEntry(user: UserEvent) {
    const autocomplete = screen.getByTestId('autocomplete');
    const input = within(autocomplete).getByRole('combobox');
    await user.click(autocomplete);
    await user.type(input, 'Bagu');

    // Wait for the debounced search results to render in the dropdown
    // before navigating to them with the keyboard.
    await screen.findByText('0% fat Greek style yogurt');

    // Select the first result
    await user.click(input);
    await user.keyboard('{ArrowDown}{Enter}');

    const amountInput = screen.getByLabelText('amount');
    await user.clear(amountInput);
    await user.type(amountInput, '120');
    const submitButton = screen.getByRole('button', { name: 'submit' });
    await user.click(submitButton);
}

describe('Test the NutritionDiaryEntryForm component', () => {
    const queryClient = new QueryClient();
    let mutateAddMock = vi.fn();
    let mutateEditMock = vi.fn();
    let closeFnMock = vi.fn();

    beforeEach(() => {
        mutateAddMock = vi.fn();
        mutateEditMock = vi.fn();
        closeFnMock = vi.fn();

        (useEditDiaryEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        (useAddDiaryEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateAddMock }));
        (searchIngredient as Mock).mockImplementation(() => Promise.resolve([TEST_INGREDIENT_1, TEST_INGREDIENT_2]));
        (useSearchIngredientQuery as Mock).mockImplementation(() => searchIngredient);
    });


    test('A new entry should be added - no meal', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <NutritionDiaryEntryForm planId={123} closeFn={closeFnMock} />
            </QueryClientProvider>
        );
        await fillInEntry(user);

        // Assert
        expect(screen.getByDisplayValue('0% fat Greek style yogurt')).toBeInTheDocument();
        expect(screen.getByDisplayValue('120')).toBeInTheDocument();
        expect(mutateEditMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateAddMock).toHaveBeenCalledWith(
            new DiaryEntry({
                amount: 120,
                datetime: expect.any(Date),
                ingredientId: 101,
                planId: 123,
                mealId: null,
                weightUnitId: null,
            })
        );
    });
    test('A new entry should be added - passing meal ID', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <NutritionDiaryEntryForm planId={123} mealId={456} closeFn={closeFnMock} />
            </QueryClientProvider>
        );
        await fillInEntry(user);

        // Assert
        expect(screen.getByDisplayValue('0% fat Greek style yogurt')).toBeInTheDocument();
        expect(screen.getByDisplayValue('120')).toBeInTheDocument();
        expect(mutateEditMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateAddMock).toHaveBeenCalledWith(
            new DiaryEntry({
                amount: 120,
                datetime: expect.any(Date),
                ingredientId: 101,
                planId: 123,
                mealId: 456,
                weightUnitId: null,

            })
        );
    });

    test('An existing diary entry should be edited', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <NutritionDiaryEntryForm planId={123} entry={TEST_DIARY_ENTRY_1} closeFn={closeFnMock} />
            </QueryClientProvider>
        );
        await fillInEntry(user);

        // Assert
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 42,
                amount: 120,
                mealId: 78,
                planId: 123,
                ingredientId: 101,
            })
        );
    });

    test('An existing diary entry should be edited - passing a meal Id', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <NutritionDiaryEntryForm planId={123} mealId={456} entry={TEST_DIARY_ENTRY_1} closeFn={closeFnMock} />
            </QueryClientProvider>
        );
        await fillInEntry(user);

        // Assert
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 42,
                planId: 123,
                mealId: 456,
                amount: 120,
                ingredientId: 101,
                weightUnitId: null,
            })
        );
    });
});
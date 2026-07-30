import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import {
    useAddDiaryEntryQuery,
    useDeleteDiaryEntryQuery,
    useEditDiaryEntryQuery,
    useSearchIngredientQuery
} from "@/components/Nutrition/queries";
import { NutritionDiaryEntryForm } from "@/components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { searchIngredient } from "@/components/Nutrition/api/ingredient";
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2 } from "@/tests/ingredientTestdata";
import { TEST_DIARY_ENTRY_1 } from "@/tests/nutritionDiaryTestdata";
import { TEST_MEAL_1, TEST_MEAL_2 } from "@/tests/nutritionTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from "@testing-library/user-event";
import React from 'react';
import type { Mock } from 'vitest';

vi.mock('@/components/Nutrition/queries');
vi.mock("@/components/Nutrition/api/ingredient");

async function fillInEntry(user: UserEvent) {
    const autocomplete = screen.getByTestId('autocomplete');
    const input = within(autocomplete).getByRole('combobox');
    await user.click(autocomplete);
    await user.type(input, 'Bagu');

    // Wait for the debounced search results to render in the dropdown before
    // navigating to them with the keyboard. Note: in edit mode the currently
    // selected ingredient (yogurt) is filtered out of the dropdown
    // (filterSelectedOptions), so wait for the second result, which is always
    // present.
    await screen.findByText('1001 Nacht Haferbrei');

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
    let mutateDeleteMock = vi.fn();
    let closeFnMock = vi.fn();

    beforeEach(() => {
        mutateAddMock = vi.fn();
        mutateEditMock = vi.fn();
        mutateDeleteMock = vi.fn();
        closeFnMock = vi.fn();

        (useEditDiaryEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        (useAddDiaryEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateAddMock }));
        (useDeleteDiaryEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateDeleteMock }));
        (searchIngredient as Mock).mockImplementation(() => Promise.resolve([TEST_INGREDIENT_1, TEST_INGREDIENT_2]));
        (useSearchIngredientQuery as Mock).mockImplementation(() => searchIngredient);
    });


    test('A new entry should be added - no meal', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <NutritionDiaryEntryForm planId="aaaaaaaa-0000-0000-0000-000000000123" closeFn={closeFnMock} />
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
                planId: 'aaaaaaaa-0000-0000-0000-000000000123',
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
                <NutritionDiaryEntryForm planId="aaaaaaaa-0000-0000-0000-000000000123"
                                         mealId="bbbbbbbb-0000-0000-0000-000000000456" closeFn={closeFnMock} />
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
                planId: 'aaaaaaaa-0000-0000-0000-000000000123',
                mealId: 'bbbbbbbb-0000-0000-0000-000000000456',
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
                <NutritionDiaryEntryForm planId="aaaaaaaa-0000-0000-0000-000000000123" entry={TEST_DIARY_ENTRY_1}
                                         closeFn={closeFnMock} />
            </QueryClientProvider>
        );
        await fillInEntry(user);

        // Assert
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'dddddddd-0000-0000-0000-000000000042',
                amount: 120,
                mealId: 'bbbbbbbb-0000-0000-0000-000000000078',
                planId: 'aaaaaaaa-0000-0000-0000-000000000123',
                // The newly selected ingredient, not the entry's original one
                ingredientId: 102,
            })
        );
    });

    test('The form is prefilled with the entry data when editing', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <NutritionDiaryEntryForm planId="aaaaaaaa-0000-0000-0000-000000000123" entry={TEST_DIARY_ENTRY_1}
                                         closeFn={closeFnMock} />
            </QueryClientProvider>
        );

        // Assert - ingredient and amount are prefilled
        expect(screen.getByDisplayValue('0% fat Greek style yogurt')).toBeInTheDocument();
        expect(screen.getByDisplayValue('120')).toBeInTheDocument();

        // Submitting without changes keeps the entry's data
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'dddddddd-0000-0000-0000-000000000042',
                amount: 120,
                ingredientId: 101,
                mealId: 'bbbbbbbb-0000-0000-0000-000000000078',
                datetime: TEST_DIARY_ENTRY_1.datetime,
            })
        );
    });

    test('Editing shows the entry\'s meal preselected when meals are passed', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <NutritionDiaryEntryForm planId="aaaaaaaa-0000-0000-0000-000000000123" entry={TEST_DIARY_ENTRY_1}
                                         meals={[TEST_MEAL_1, TEST_MEAL_2]} closeFn={closeFnMock} />
            </QueryClientProvider>
        );

        // Assert - the meal the entry belongs to is selected, not an empty field
        expect(screen.getByDisplayValue('Second breakfast')).toBeInTheDocument();

        // Submitting keeps that meal
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({ mealId: 'bbbbbbbb-0000-0000-0000-000000000078' })
        );
    });

    test('An existing diary entry should be deleted', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <NutritionDiaryEntryForm planId="aaaaaaaa-0000-0000-0000-000000000123" entry={TEST_DIARY_ENTRY_1}
                                         closeFn={closeFnMock} />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('button', { name: 'delete' }));

        // Assert
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(mutateEditMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateDeleteMock).toHaveBeenCalledWith('dddddddd-0000-0000-0000-000000000042');
    });

    test('An existing diary entry should be edited - passing a meal Id', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <NutritionDiaryEntryForm planId="aaaaaaaa-0000-0000-0000-000000000123"
                                         mealId="bbbbbbbb-0000-0000-0000-000000000456" entry={TEST_DIARY_ENTRY_1}
                                         closeFn={closeFnMock} />
            </QueryClientProvider>
        );
        await fillInEntry(user);

        // Assert
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'dddddddd-0000-0000-0000-000000000042',
                planId: 'aaaaaaaa-0000-0000-0000-000000000123',
                mealId: 'bbbbbbbb-0000-0000-0000-000000000456',
                amount: 120,
                // The newly selected ingredient, not the entry's original one
                ingredientId: 102,
                weightUnitId: null,
            })
        );
    });
});
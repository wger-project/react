import { searchIngredient } from "@/components/Nutrition/api/ingredient";
import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import { Ingredient } from "@/components/Nutrition/models/Ingredient";
import {
    useAddDiaryEntryQuery,
    useDeleteDiaryEntryQuery,
    useEditDiaryEntryQuery,
    useSearchIngredientQuery
} from "@/components/Nutrition/queries";
import { NutritionDiaryEntryForm } from "@/components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2 } from "@/tests/ingredientTestdata";
import { mutateMock } from "@/tests/mutationMock";
import { TEST_DIARY_ENTRY_1 } from "@/tests/nutritionDiaryTestdata";
import { TEST_MEAL_1, TEST_MEAL_2, TEST_WEIGHT_UNIT_SLICE } from "@/tests/nutritionTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from "@testing-library/user-event";
import React from 'react';
import type { Mock } from 'vitest';

vi.mock('@/components/Nutrition/queries');
vi.mock("@/components/Nutrition/api/ingredient");

async function fillInEntry(user: UserEvent, ingredientName: string) {
    // An already selected ingredient is shown instead of the search
    const clearButton = screen.queryByRole('button', { name: 'nutrition.changeIngredient' });
    if (clearButton !== null) {
        await user.click(clearButton);
    }

    const autocomplete = screen.getByTestId('autocomplete');
    const input = within(autocomplete).getByRole('combobox');
    await user.click(autocomplete);
    await user.type(input, 'Bagu');

    // Wait for the debounced search results, then pick one by name
    await user.click(await screen.findByText(ingredientName));

    const amountInput = screen.getByLabelText('amount');
    await user.clear(amountInput);
    await user.type(amountInput, '120');
    const submitButton = screen.getByRole('button', { name: 'submit' });
    await user.click(submitButton);
}

describe('Test the NutritionDiaryEntryForm component', () => {
    const queryClient = new QueryClient();
    let mutateAddMock = mutateMock();
    let mutateEditMock = mutateMock();
    let mutateDeleteMock = mutateMock();
    let closeFnMock = vi.fn();

    beforeEach(() => {
        mutateAddMock = mutateMock();
        mutateEditMock = mutateMock();
        mutateDeleteMock = mutateMock();
        closeFnMock = vi.fn();

        (useEditDiaryEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        (useAddDiaryEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateAddMock }));
        (useDeleteDiaryEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateDeleteMock }));
        (searchIngredient as Mock).mockImplementation(() => Promise.resolve([TEST_INGREDIENT_1, TEST_INGREDIENT_2]));
        (useSearchIngredientQuery as Mock).mockImplementation(() => searchIngredient);
    });


    test('clearing a serving unit saves null without mutating the source entry', async () => {
        const user = userEvent.setup();
        const entry = DiaryEntry.clone(TEST_DIARY_ENTRY_1, {
            ingredient: new Ingredient({ ...TEST_INGREDIENT_1, weightUnits: [TEST_WEIGHT_UNIT_SLICE] }),
            weightUnit: TEST_WEIGHT_UNIT_SLICE,
        });
        render(<NutritionDiaryEntryForm planId={entry.planId} entry={entry} closeFn={closeFnMock} />);
        await user.click(screen.getByRole('button', { name: 'nutrition.gramShort' }));
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(mutateEditMock).toHaveBeenCalledWith(expect.objectContaining({
            weightUnitId: null, weightUnit: null, ingredientId: entry.ingredientId,
        }), expect.anything());
        expect(entry.weightUnitId).toBe(TEST_WEIGHT_UNIT_SLICE.id);
        expect(entry.weightUnit).toBe(TEST_WEIGHT_UNIT_SLICE);
    });

    test('closing a draft leaves the cached entry unchanged', async () => {
        const user = userEvent.setup();
        const entry = DiaryEntry.clone(TEST_DIARY_ENTRY_1);
        render(<NutritionDiaryEntryForm planId={entry.planId} entry={entry} closeFn={closeFnMock} />);
        await user.clear(screen.getByLabelText('amount'));
        await user.type(screen.getByLabelText('amount'), '80.5');
        await user.click(screen.getByRole('button', { name: 'close' }));
        expect(entry.amount).toBe(120);
        expect(mutateEditMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalledOnce();
    });

    test.each(['1', '1000', '80.55', '80,55'])('accepts portion %s', async value => {
        const user = userEvent.setup();
        render(<NutritionDiaryEntryForm planId={TEST_DIARY_ENTRY_1.planId} entry={TEST_DIARY_ENTRY_1} />);
        await user.clear(screen.getByLabelText('amount'));
        await user.type(screen.getByLabelText('amount'), value);
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(mutateEditMock).toHaveBeenCalledWith(expect.objectContaining({
            amount: Number(value.replace(',', '.')),
        }), expect.anything());
    });

    test.each(['0.99', '1000.01', '1.001'])('rejects portion %s', async value => {
        const user = userEvent.setup();
        render(<NutritionDiaryEntryForm planId={TEST_DIARY_ENTRY_1.planId} entry={TEST_DIARY_ENTRY_1} />);
        await user.clear(screen.getByLabelText('amount'));
        await user.type(screen.getByLabelText('amount'), value);
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(mutateEditMock).not.toHaveBeenCalled();
    });

    test('a pending save disables resubmission', () => {
        (useEditDiaryEntryQuery as Mock).mockReturnValue({ mutate: mutateEditMock, isPending: true });
        render(<NutritionDiaryEntryForm planId={TEST_DIARY_ENTRY_1.planId} entry={TEST_DIARY_ENTRY_1} />);
        expect(screen.getByRole('button', { name: 'submit' })).toBeDisabled();
    });

    test('a failed write leaves the form open and displays the error', async () => {
        const user = userEvent.setup();
        (useEditDiaryEntryQuery as Mock).mockReturnValue({
            mutate: vi.fn(), isError: true, error: { message: 'Unable to save', response: { data: {} } },
        });
        render(<NutritionDiaryEntryForm planId={TEST_DIARY_ENTRY_1.planId}
            entry={TEST_DIARY_ENTRY_1} closeFn={closeFnMock} />);
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(closeFnMock).not.toHaveBeenCalled();
        expect(screen.getByRole('alert')).toHaveTextContent('Unable to save');
        expect(screen.getByLabelText('amount')).toBeInTheDocument();
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
        await fillInEntry(user, '0% fat Greek style yogurt');

        // Assert
        expect(within(screen.getByTestId('selected-ingredient')).getByText('0% fat Greek style yogurt')).toBeInTheDocument();
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
            , expect.anything());
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
        await fillInEntry(user, '0% fat Greek style yogurt');

        // Assert
        expect(within(screen.getByTestId('selected-ingredient')).getByText('0% fat Greek style yogurt')).toBeInTheDocument();
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
            , expect.anything());
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
        expect(screen.queryByRole('button', { name: 'nutrition.changeIngredient' })).not.toBeInTheDocument();
        await user.clear(screen.getByLabelText('amount'));
        await user.type(screen.getByLabelText('amount'), '80,5');
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'dddddddd-0000-0000-0000-000000000042',
                amount: 80.5,
                mealId: 'bbbbbbbb-0000-0000-0000-000000000078',
                planId: TEST_DIARY_ENTRY_1.planId,
                ingredientId: 101,
            })
            , expect.anything());
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
        expect(within(screen.getByTestId('selected-ingredient')).getByText('0% fat Greek style yogurt')).toBeInTheDocument();
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
            , expect.anything());
    });

    test('Editing preserves the meal without offering a meal selector', async () => {
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
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

        // Submitting keeps that meal
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({ mealId: 'bbbbbbbb-0000-0000-0000-000000000078' })
            , expect.anything());
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
        expect(mutateDeleteMock).toHaveBeenCalledWith('dddddddd-0000-0000-0000-000000000042', expect.anything());
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
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        expect(mutateAddMock).not.toHaveBeenCalled();
        expect(closeFnMock).toHaveBeenCalled();
        expect(mutateEditMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'dddddddd-0000-0000-0000-000000000042',
                planId: TEST_DIARY_ENTRY_1.planId,
                mealId: TEST_DIARY_ENTRY_1.mealId,
                amount: 120,
                ingredientId: 101,
                weightUnitId: null,
            })
            , expect.anything());
    });
});

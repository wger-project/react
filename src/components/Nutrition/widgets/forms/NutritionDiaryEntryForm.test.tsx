import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/setup/setup";
import { useAddDiaryEntryQuery, useEditDiaryEntryQuery } from "components/Nutrition/queries";
import { NutritionDiaryEntryForm } from "components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import React from 'react';
import { searchIngredient } from "services";
import { INGREDIENT_SEARCH } from "tests/api/ingredientSearch";
import { TEST_DIARY_ENTRY_1 } from "tests/nutritionDiaryTestdata";

jest.mock('components/Nutrition/queries');
jest.mock('services');

async function fillInEntry(user: UserEvent) {
    const autocomplete = screen.getByTestId('autocomplete');
    const input = within(autocomplete).getByRole('combobox');
    await user.click(autocomplete);
    await user.type(input, 'Bagu');

    // There's a bounce period of 200ms between the input and the search
    await act(async () => {
        await new Promise((r) => setTimeout(r, 250));
    });

    // Select first result
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
    let mutateAddMock = jest.fn();
    let mutateEditMock = jest.fn();
    let closeFnMock = jest.fn();

    beforeEach(() => {
        mutateAddMock = jest.fn();
        mutateEditMock = jest.fn();
        closeFnMock = jest.fn();

        (useEditDiaryEntryQuery as jest.Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        (useAddDiaryEntryQuery as jest.Mock).mockImplementation(() => ({ mutate: mutateAddMock }));
        (searchIngredient as jest.Mock).mockImplementation(() => Promise.resolve(INGREDIENT_SEARCH));
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
        expect(screen.getByDisplayValue('Baguette with cheese')).toBeInTheDocument();
        expect(screen.getByDisplayValue('120')).toBeInTheDocument();
        expect(mutateEditMock).not.toHaveBeenCalled();
        expect(closeFnMock).toBeCalled();
        expect(mutateAddMock).toHaveBeenCalledWith({
            amount: "120",
            datetime: expect.anything(),
            ingredient: 1234,
            meal: null,
            plan: 123,
            // eslint-disable-next-line camelcase
            weight_unit: null,
        });
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
        expect(screen.getByDisplayValue('Baguette with cheese')).toBeInTheDocument();
        expect(screen.getByDisplayValue('120')).toBeInTheDocument();
        expect(mutateEditMock).not.toHaveBeenCalled();
        expect(closeFnMock).toBeCalled();
        expect(mutateAddMock).toHaveBeenCalledWith({
            amount: "120",
            datetime: expect.anything(),
            ingredient: 1234,
            meal: 456,
            plan: 123,
            // eslint-disable-next-line camelcase
            weight_unit: null,
        });
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
        expect(closeFnMock).toBeCalled();
        expect(mutateEditMock).toHaveBeenCalledWith({
            id: 42,
            amount: "120",
            datetime: expect.anything(),
            ingredient: 1234,
            meal: null,
            plan: 123,
            // eslint-disable-next-line camelcase
            weight_unit: null,
        });
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
        expect(closeFnMock).toBeCalled();
        expect(mutateEditMock).toHaveBeenCalledWith({
            id: 42,
            amount: "120",
            datetime: expect.anything(),
            ingredient: 1234,
            meal: 456,
            plan: 123,
            // eslint-disable-next-line camelcase
            weight_unit: null,
        });
    });
});
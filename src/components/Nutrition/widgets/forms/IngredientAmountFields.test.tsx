import { searchIngredient } from "@/components/Nutrition/api/ingredient";
import { Ingredient } from "@/components/Nutrition/models/Ingredient";
import { NutritionWeightUnit } from "@/components/Nutrition/models/weightUnit";
import { useSearchIngredientQuery } from "@/components/Nutrition/queries";
import { IngredientAmountFields } from "@/components/Nutrition/widgets/forms/IngredientAmountFields";
import { TEST_INGREDIENT_2 } from "@/tests/ingredientTestdata";
import { TEST_WEIGHT_UNIT_SLICE } from "@/tests/nutritionTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from 'react';
import type { Mock } from 'vitest';

vi.mock('@/components/Nutrition/queries');
vi.mock("@/components/Nutrition/api/ingredient");

const INGREDIENT_WITH_UNITS = new Ingredient({ ...TEST_INGREDIENT_2, weightUnits: [TEST_WEIGHT_UNIT_SLICE] });

// Holds the state the forms would own, so the component can be clicked through
function Harness(props: { amount: number, onWeightUnitChange?: (unit: NutritionWeightUnit | null) => void }) {
    const [ingredient, setIngredient] = useState<Ingredient | null>(INGREDIENT_WITH_UNITS);
    const [unit, setUnit] = useState<NutritionWeightUnit | null>(null);

    return <IngredientAmountFields
        ingredient={ingredient}
        onIngredientChange={setIngredient}
        weightUnit={unit}
        onWeightUnitChange={value => {
            props.onWeightUnitChange?.(value);
            setUnit(value);
        }}
        amount={props.amount}
        renderAmountField={endAdornment => <div data-testid="amount-adornment">{endAdornment}</div>}
    />;
}

describe('Test the IngredientAmountFields component', () => {
    const queryClient = new QueryClient();

    beforeEach(() => {
        (searchIngredient as Mock).mockImplementation(() => Promise.resolve([]));
        (useSearchIngredientQuery as Mock).mockImplementation(() => searchIngredient);
    });

    const renderHarness = (props: React.ComponentProps<typeof Harness>) => render(
        <QueryClientProvider client={queryClient}>
            <Harness {...props} />
        </QueryClientProvider>
    );

    test('A unit chip selects the unit, the gram chip clears it', async () => {
        // Arrange
        const user = userEvent.setup();
        const onWeightUnitChange = vi.fn();
        renderHarness({ amount: 2, onWeightUnitChange });

        // Act
        await user.click(screen.getByRole('button', { name: 'slice (50g)' }));

        // Assert
        expect(onWeightUnitChange).toHaveBeenLastCalledWith(TEST_WEIGHT_UNIT_SLICE);
        expect(screen.getByRole('button', { name: 'slice (50g)', pressed: true })).toBeInTheDocument();
        expect(screen.getByTestId('amount-adornment')).toHaveTextContent('× slice');
        expect(screen.getByTestId('macros-summary')).toHaveTextContent(/·\s100\sg/);

        // Act
        await user.click(screen.getByRole('button', { name: 'nutrition.gramShort' }));

        // Assert
        expect(onWeightUnitChange).toHaveBeenLastCalledWith(null);
        expect(screen.getByTestId('amount-adornment')).toHaveTextContent('nutrition.gramShort');
        expect(screen.getByTestId('macros-summary')).not.toHaveTextContent('·');
    });

    test('The summary shows the energy and macros for the entered amount', () => {
        // Act - 200 g of an ingredient with 351 kcal per 100 g
        renderHarness({ amount: 200 });

        // Assert
        const summary = screen.getByTestId('macros-summary');
        expect(within(summary).getByText('702')).toBeInTheDocument();
        expect(summary).toHaveTextContent(/nutrition\.protein 21\sg/);
        expect(summary).toHaveTextContent(/nutrition\.carbohydrates 122\sg/);
        expect(summary).toHaveTextContent(/nutrition\.fat 10\sg/);
    });

    test('Without an amount there is no summary', () => {
        renderHarness({ amount: 0 });

        expect(screen.queryByTestId('macros-summary')).not.toBeInTheDocument();
    });

    test('Clearing the ingredient brings back the search and drops the unit', async () => {
        // Arrange
        const user = userEvent.setup();
        const onWeightUnitChange = vi.fn();
        renderHarness({ amount: 2, onWeightUnitChange });
        await user.click(screen.getByRole('button', { name: 'slice (50g)' }));

        // Act
        await user.click(screen.getByRole('button', { name: 'nutrition.changeIngredient' }));

        // Assert
        expect(screen.queryByTestId('selected-ingredient')).not.toBeInTheDocument();
        expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'slice (50g)' })).not.toBeInTheDocument();
        expect(screen.queryByTestId('macros-summary')).not.toBeInTheDocument();
        expect(onWeightUnitChange).toHaveBeenLastCalledWith(null);
    });
});

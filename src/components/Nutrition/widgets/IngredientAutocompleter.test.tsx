import { act, render, screen, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { IngredientAutocompleter } from 'components/Nutrition/widgets/IngredientAutcompleter';
import { searchIngredient } from 'services';
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2 } from "tests/ingredientTestdata";

jest.mock("services");

describe("Test the IngredientAutocompleter component", () => {

    // Arrange
    const mockCallback = jest.fn();
    beforeEach(() => {
        (searchIngredient as jest.Mock).mockImplementation(() => Promise.resolve([TEST_INGREDIENT_1, TEST_INGREDIENT_2]));
    });

    test('renders correct results', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<IngredientAutocompleter callback={mockCallback} />);
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'Bag');

        // There's a bounce period of 200ms between the input and the search
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });
        expect(searchIngredient).toHaveBeenCalled();
        expect(screen.getByText('0% fat Greek style yogurt')).toBeInTheDocument();
        expect(screen.getByText('1001 Nacht Haferbrei')).toBeInTheDocument();
    });

    test('callback was correctly called', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<IngredientAutocompleter callback={mockCallback} />);
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'Cru');

        // There's a bounce period of 200ms between the input and the search
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });

        // Select the first result
        await user.click(input);
        await user.keyboard('{ArrowDown}{Enter}');

        // Assert
        expect(mockCallback).toHaveBeenLastCalledWith(TEST_INGREDIENT_1);
    });

    test('filters are shown after clicking the toggle icon', async () => {
        const user = userEvent.setup();

        render(<IngredientAutocompleter callback={mockCallback} />);

        expect(screen.queryByText('nutrition.filterVegan')).not.toBeInTheDocument();

        await user.click(screen.getByLabelText('Toggle filters'));

        expect(screen.getByText('nutrition.filterVegan')).toBeInTheDocument();
    });
});

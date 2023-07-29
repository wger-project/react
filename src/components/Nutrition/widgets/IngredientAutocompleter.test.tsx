import { act, render, screen, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { IngredientAutocompleter } from 'components/Nutrition/widgets/IngredientAutcompleter';
import { searchIngredient } from 'services';
import { INGREDIENT_SEARCH } from "tests/api/ingredientSearch";

jest.mock("services");

describe("Test the IngredientAutocompleter component", () => {

    // Arrange
    const mockCallback = jest.fn();
    beforeEach(() => {
        // @ts-ignore
        searchIngredient.mockImplementation(() => Promise.resolve(INGREDIENT_SEARCH));
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
        expect(searchIngredient).toBeCalled();
        expect(screen.getByText('Blue cheese')).toBeInTheDocument();
        expect(screen.getByText('Baguette with cheese')).toBeInTheDocument();
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

        // Select first result
        await user.click(input);
        await user.keyboard('{ArrowDown}{Enter}');

        // Assert
        expect(mockCallback).lastCalledWith(INGREDIENT_SEARCH[0]);
    });
});

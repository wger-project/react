import { act, render, screen, within } from '@testing-library/react';
import { searchIngredient } from 'services';
import { IngredientAutocompleter } from 'components/Nutrition/widgets/IngredientAutcompleter';
import userEvent from "@testing-library/user-event";

jest.mock("services");
const mockCallback = jest.fn();

describe("Test the IngredientAutocompleter component", () => {

    // Arrange
    const response = [
        {
            "value": "Baguette with cheese",
            "data": {
                "id": 1234,
                "name": "Baguette with cheese",
                "category": "Desserts",
                "image": null,
                "image_thumbnail": null
            }
        },
        {
            "value": "Blue cheese",
            "data": {
                "id": 4321,
                "name": "Blue cheese",
                "category": "Beverages",
                "image": null,
                "image_thumbnail": null
            }
        }
    ];

    beforeEach(() => {
        // @ts-ignore
        searchIngredient.mockImplementation(() => Promise.resolve(response));
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
        expect(mockCallback).lastCalledWith(response[0]);
    });
});

import { act, render, screen, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    IngredientAutocompleter,
    STORAGE_KEY_LANGUAGE_FILTER,
    STORAGE_KEY_NUTRISCORE_ENABLED,
    STORAGE_KEY_NUTRISCORE_MAX,
    STORAGE_KEY_VEGAN,
    STORAGE_KEY_VEGETARIAN
} from 'components/Nutrition/widgets/IngredientAutcompleter';
import { searchIngredient } from 'services';
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2, TEST_INGREDIENT_4 } from "tests/ingredientTestdata";

jest.mock("services");

describe("Test the IngredientAutocompleter component", () => {

    // Arrange
    const mockCallback = jest.fn();
    beforeEach(() => {
        localStorage.clear();
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
        expect(screen.queryByLabelText('language')).not.toBeInTheDocument();

        await user.click(screen.getByLabelText('Toggle filters'));

        const popover = screen.getByRole('presentation');
        expect(within(popover).getByLabelText('language')).toBeInTheDocument();
        expect(screen.getByText('nutrition.filterVegan')).toBeInTheDocument();
    });

    test('local storage settings are saved', async () => {
        // Arrange
        const user = userEvent.setup();
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
        render(<IngredientAutocompleter callback={mockCallback} />);

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));

        // Assert
        const veganFilter = screen.getByLabelText('nutrition.filterVegan');
        await user.click(veganFilter);
        expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY_VEGAN, 'true');

        const vegetarianFilter = screen.getByLabelText('nutrition.filterVegetarian');
        await user.click(vegetarianFilter);
        expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY_VEGETARIAN, 'true');

        await user.click(screen.getByLabelText('language'));
        await user.click(screen.getByRole('option', { name: 'nutrition.languageFilterAll' }));
        expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY_LANGUAGE_FILTER, 'all');

        setItemSpy.mockRestore();
    });

    test('shows vegan chip only when ingredient is vegan, not both vegan and vegetarian', async () => {
        // Arrange
        const user = userEvent.setup();
        (searchIngredient as jest.Mock).mockImplementation(() =>
            Promise.resolve([TEST_INGREDIENT_2])
        );

        // Act
        render(<IngredientAutocompleter callback={mockCallback} />);
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'Haferbrei');
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });

        // Assert - vegan ingredient should show "Vegan" but not "Vegetarian"
        expect(screen.getByText('nutrition.filterVegan')).toBeInTheDocument();
        expect(screen.queryByText('nutrition.filterVegetarian')).not.toBeInTheDocument();
    });

    test('shows vegetarian chip when ingredient is only vegetarian', async () => {
        // Arrange
        const user = userEvent.setup();
        (searchIngredient as jest.Mock).mockImplementation(() =>
            Promise.resolve([TEST_INGREDIENT_1])
        );

        // Act
        render(<IngredientAutocompleter callback={mockCallback} />);
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'yogurt');
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });

        // Assert - vegetarian-only ingredient should show "Vegetarian" but not "Vegan"
        expect(screen.getByText('nutrition.filterVegetarian')).toBeInTheDocument();
        expect(screen.queryByText('nutrition.filterVegan')).not.toBeInTheDocument();
    });

    test('shows no dietary chips when ingredient has no dietary info', async () => {
        // Arrange
        const user = userEvent.setup();
        (searchIngredient as jest.Mock).mockImplementation(() =>
            Promise.resolve([TEST_INGREDIENT_4])
        );

        // Act
        render(<IngredientAutocompleter callback={mockCallback} />);
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'Cacao');
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });

        // Assert - no dietary info, no chips
        expect(screen.queryByText('nutrition.filterVegan')).not.toBeInTheDocument();
        expect(screen.queryByText('nutrition.filterVegetarian')).not.toBeInTheDocument();
    });

    test('local storage settings are loaded', async () => {
        // Arrange
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY_VEGAN, 'true');
        localStorage.setItem(STORAGE_KEY_VEGETARIAN, 'true');
        localStorage.setItem(STORAGE_KEY_LANGUAGE_FILTER, 'all');
        render(<IngredientAutocompleter callback={mockCallback} />);

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));

        // Assert
        expect(screen.getByLabelText('nutrition.filterVegan')).toBeChecked();
        expect(screen.getByLabelText('nutrition.filterVegetarian')).toBeChecked();
        expect(screen.getByText('nutrition.languageFilterAll')).toBeInTheDocument();
        localStorage.clear();
    });

    test('nutriscore slider is hidden until the filter switch is enabled', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<IngredientAutocompleter callback={mockCallback} />);

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));

        // Assert
        const nutriscoreSwitch = screen.getByLabelText('nutrition.filterNutriscore');
        expect(nutriscoreSwitch).not.toBeChecked();
        expect(screen.queryByRole('slider', { name: 'nutrition.filterNutriscoreMax' })).not.toBeInTheDocument();

        await user.click(nutriscoreSwitch);

        expect(screen.getByRole('slider', { name: 'nutrition.filterNutriscoreMax' })).toBeInTheDocument();
    });

    test('nutriscore filter settings are saved to local storage', async () => {
        // Arrange
        const user = userEvent.setup();
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
        render(<IngredientAutocompleter callback={mockCallback} />);

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));
        await user.click(screen.getByLabelText('nutrition.filterNutriscore'));

        // Assert
        expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY_NUTRISCORE_ENABLED, 'true');

        // Moving the slider with the keyboard changes the selected grade and persists it
        const slider = screen.getByRole('slider', { name: 'nutrition.filterNutriscoreMax' });
        slider.focus();
        await user.keyboard('{ArrowRight}');
        expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY_NUTRISCORE_MAX, 'd');

        setItemSpy.mockRestore();
    });

    test('nutriscore filter state is loaded from local storage', async () => {
        // Arrange
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY_NUTRISCORE_ENABLED, 'true');
        localStorage.setItem(STORAGE_KEY_NUTRISCORE_MAX, 'b');
        render(<IngredientAutocompleter callback={mockCallback} />);

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));

        // Assert
        expect(screen.getByLabelText('nutrition.filterNutriscore')).toBeChecked();
        expect(screen.getByRole('slider', { name: 'nutrition.filterNutriscoreMax' })).toHaveAttribute('aria-valuetext', 'B');
        localStorage.clear();
    });

    test('searchIngredient is called with nutriscoreMax when the filter is enabled', async () => {
        // Arrange
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY_NUTRISCORE_ENABLED, 'true');
        localStorage.setItem(STORAGE_KEY_NUTRISCORE_MAX, 'b');
        render(<IngredientAutocompleter callback={mockCallback} />);
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');

        // Act
        await user.click(autocomplete);
        await user.type(input, 'Yog');
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });

        // Assert
        expect(searchIngredient).toHaveBeenCalledWith(
            'Yog',
            expect.objectContaining({ nutriscoreMax: 'b' }),
        );
        localStorage.clear();
    });

    test('nutriscoreMax is omitted when the filter switch is off', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<IngredientAutocompleter callback={mockCallback} />);
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');

        // Act
        await user.click(autocomplete);
        await user.type(input, 'Yog');
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });

        // Assert
        expect(searchIngredient).toHaveBeenCalledWith(
            'Yog',
            expect.objectContaining({ nutriscoreMax: undefined }),
        );
    });
});

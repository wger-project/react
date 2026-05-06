import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    IngredientAutocompleter,
    STORAGE_KEY_LANGUAGE_FILTER,
    STORAGE_KEY_NUTRISCORE_MAX,
    STORAGE_KEY_VEGAN,
    STORAGE_KEY_VEGETARIAN
} from '@/components/Nutrition/widgets/IngredientAutcompleter';
import type { Mock } from 'vitest';
import { searchIngredient } from '@/services';
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2, TEST_INGREDIENT_4 } from "@/tests/ingredientTestdata";
import { testQueryClient } from "@/tests/queryClient";

vi.mock("@/services");

const mockCallback = vi.fn();

function renderAutocompleter() {
    render(
        <QueryClientProvider client={testQueryClient}>
            <IngredientAutocompleter callback={mockCallback} />
        </QueryClientProvider>
    );
}

describe("Test the IngredientAutocompleter component", () => {

    // Arrange
    beforeEach(() => {
        localStorage.clear();
        testQueryClient.clear();
        (searchIngredient as Mock).mockImplementation(() => Promise.resolve([TEST_INGREDIENT_1, TEST_INGREDIENT_2]));
    });

    test('renders correct results', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderAutocompleter();
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'Bag');
        await waitFor(() => expect(searchIngredient).toHaveBeenCalled());
        expect(await screen.findByText('0% fat Greek style yogurt')).toBeInTheDocument();
        expect(screen.getByText('1001 Nacht Haferbrei')).toBeInTheDocument();
    });

    test('callback was correctly called', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderAutocompleter();
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'Cru');
        // Wait for the option to actually be in the dropdown — not just for
        // the search call. Otherwise ArrowDown+Enter fires before React has
        // rendered the resolved results.
        await screen.findByText('0% fat Greek style yogurt');

        // Select the first result
        await user.click(input);
        await user.keyboard('{ArrowDown}{Enter}');

        // Assert
        expect(mockCallback).toHaveBeenLastCalledWith(TEST_INGREDIENT_1);
    });

    test('filters are shown after clicking the toggle icon', async () => {
        const user = userEvent.setup();

        renderAutocompleter();

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
        const setItemSpy = vi.spyOn(window.localStorage, 'setItem');
        renderAutocompleter();

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
        (searchIngredient as Mock).mockImplementation(() =>
            Promise.resolve([TEST_INGREDIENT_2])
        );

        // Act
        renderAutocompleter();
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'Haferbrei');

        // Assert - vegan ingredient should show "Vegan" but not "Vegetarian"
        expect(await screen.findByText('nutrition.filterVegan')).toBeInTheDocument();
        expect(screen.queryByText('nutrition.filterVegetarian')).not.toBeInTheDocument();
    });

    test('shows vegetarian chip when ingredient is only vegetarian', async () => {
        // Arrange
        const user = userEvent.setup();
        (searchIngredient as Mock).mockImplementation(() =>
            Promise.resolve([TEST_INGREDIENT_1])
        );

        // Act
        renderAutocompleter();
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'yogurt');

        // Assert - vegetarian-only ingredient should show "Vegetarian" but not "Vegan"
        expect(await screen.findByText('nutrition.filterVegetarian')).toBeInTheDocument();
        expect(screen.queryByText('nutrition.filterVegan')).not.toBeInTheDocument();
    });

    test('shows no dietary chips when ingredient has no dietary info', async () => {
        // Arrange
        const user = userEvent.setup();
        (searchIngredient as Mock).mockImplementation(() =>
            Promise.resolve([TEST_INGREDIENT_4])
        );

        // Act
        renderAutocompleter();
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'Cacao');
        await waitFor(() => expect(searchIngredient).toHaveBeenCalled());

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
        renderAutocompleter();

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));

        // Assert
        expect(screen.getByLabelText('nutrition.filterVegan')).toBeChecked();
        expect(screen.getByLabelText('nutrition.filterVegetarian')).toBeChecked();
        expect(screen.getByText('nutrition.languageFilterAll')).toBeInTheDocument();
        localStorage.clear();
    });

    test('nutriscore slider defaults to Off and is always visible in the popover', async () => {
        // Arrange
        const user = userEvent.setup();
        renderAutocompleter();

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));

        // Assert — slider rendered with Off position (index 0) on first load
        const slider = screen.getByRole('slider', { name: 'nutrition.filterNutriscore' });
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('aria-valuetext', 'nutrition.filterNutriscoreNoFilter');
        expect(slider).toHaveAttribute('aria-valuenow', '0');
    });

    test('moving the slider persists the selected grade to local storage', async () => {
        // Arrange
        const user = userEvent.setup();
        const setItemSpy = vi.spyOn(window.localStorage, 'setItem');
        renderAutocompleter();

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));
        const slider = screen.getByRole('slider', { name: 'nutrition.filterNutriscore' });
        slider.focus();
        await user.keyboard('{ArrowRight}');

        // Assert — index 1 -> 'a'
        expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY_NUTRISCORE_MAX, 'a');

        setItemSpy.mockRestore();
    });

    test('moving the slider back to Off removes the stored grade', async () => {
        // Arrange
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY_NUTRISCORE_MAX, 'a');
        const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem');
        renderAutocompleter();

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));
        const slider = screen.getByRole('slider', { name: 'nutrition.filterNutriscore' });
        slider.focus();
        await user.keyboard('{ArrowLeft}');

        // Assert
        expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY_NUTRISCORE_MAX);

        removeItemSpy.mockRestore();
    });

    test('nutriscore filter state is loaded from local storage', async () => {
        // Arrange
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY_NUTRISCORE_MAX, 'b');
        renderAutocompleter();

        // Act
        await user.click(screen.getByLabelText('Toggle filters'));

        // Assert
        expect(screen.getByRole('slider', { name: 'nutrition.filterNutriscore' })).toHaveAttribute('aria-valuetext', 'nutrition.filterNutriscoreOrBetter');
    });

    test('searchIngredient is called with nutriscoreMax when a grade is selected', async () => {
        // Arrange
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY_NUTRISCORE_MAX, 'b');
        renderAutocompleter();
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');

        // Act
        await user.click(autocomplete);
        await user.type(input, 'Yog');

        // Assert
        await waitFor(() => expect(searchIngredient).toHaveBeenCalledWith(
            'Yog',
            expect.objectContaining({ nutriscoreMax: 'b' }),
        ));
    });

    test('nutriscoreMax is omitted when the slider is at Off', async () => {
        // Arrange
        const user = userEvent.setup();
        renderAutocompleter();
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');

        // Act
        await user.click(autocomplete);
        await user.type(input, 'Yog');

        // Assert
        await waitFor(() => expect(searchIngredient).toHaveBeenCalledWith(
            'Yog',
            expect.objectContaining({ nutriscoreMax: undefined }),
        ));
    });
});

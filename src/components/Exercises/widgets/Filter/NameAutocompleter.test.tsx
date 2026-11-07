import { searchExerciseTranslations } from "@/components/Exercises/api/exerciseTranslation";
import { Exercise } from "@/components/Exercises/models/exercise";
import {
    NameAutocompleter,
    STORAGE_KEY_EXERCISE_EXACT_MATCH,
    STORAGE_KEY_EXERCISE_LANGUAGE
} from "@/components/Exercises/widgets/Filter/NameAutocompleter";
import { useLanguageQuery, useSearchExerciseTranslationsQuery } from "@/components/Exercises/queries";
import { testLanguages } from "@/tests/exerciseTestdata";
import { searchResponse } from "@/tests/exercises/searchResponse";
import { testQueryClient } from "@/tests/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from 'react';

import type { Mock } from 'vitest';

vi.mock("@/components/Exercises/api/exerciseTranslation");
vi.mock("@/components/Exercises/queries");

const mockedSearchExerciseTranslations = searchExerciseTranslations as Mock;
const mockedUseLanguageQuery = useLanguageQuery as Mock;
const mockedUseSearchExerciseTranslationsQuery = useSearchExerciseTranslationsQuery as Mock;
const mockCallback = vi.fn();

function renderAutocompleter() {
    render(
        <QueryClientProvider client={testQueryClient}>
            <NameAutocompleter callback={mockCallback} />
        </QueryClientProvider>
    );
}

describe("Test the NameAutocompleter component", () => {

    // Arrange
    beforeEach(() => {
        localStorage.clear();
        testQueryClient.clear();
        mockedSearchExerciseTranslations.mockImplementation(() => Promise.resolve(searchResponse));
        mockedUseSearchExerciseTranslationsQuery.mockImplementation(() => mockedSearchExerciseTranslations);
        mockedUseLanguageQuery.mockImplementation(() => ({ isSuccess: true, data: testLanguages }));
    });

    test('renders correct results', async () => {
        const user = userEvent.setup();

        // Act
        renderAutocompleter();
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);

        // Assert
        expect(searchExerciseTranslations).not.toHaveBeenCalled();
        await user.type(input, 'Cru');

        expect(screen.getByLabelText("exercises.searchExerciseName")).toBeInTheDocument();
        expect(screen.getByText("noResults")).toBeInTheDocument();
        expect(screen.queryByText("Crunches an Negativbank")).not.toBeInTheDocument();
        expect(screen.queryByText("Bauch")).not.toBeInTheDocument();
        expect(screen.queryByText("Crunches am Seil")).not.toBeInTheDocument();
        expect(screen.queryByText("Brust")).not.toBeInTheDocument();

        // Wait for debounced search results
        expect(await screen.findByText("Crunches an Negativbank")).toBeInTheDocument();
        expect(searchExerciseTranslations).toHaveBeenCalled();
        expect(screen.getByText("Bauch")).toBeInTheDocument();
        expect(screen.getByText("Crunches am Seil")).toBeInTheDocument();
        expect(screen.getByText("Brust")).toBeInTheDocument();
    });

    test('callback was correctly called', async () => {
        const user = userEvent.setup();

        // Act
        renderAutocompleter();
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.click(autocomplete);
        await user.type(input, 'Cru');

        // Wait for debounced search to render an option
        await screen.findByText("Crunches an Negativbank");

        // Select first result
        await user.click(input);
        await user.keyboard('{ArrowDown}{Enter}');

        // Assert
        expect(mockCallback).toHaveBeenCalledWith(expect.any(Exercise));
    });

    test('TuneIcon button is rendered in search box', async () => {

        // Act
        renderAutocompleter();

        // Assert - TuneIcon button should be present
        const filterButton = screen.getByLabelText('Toggle filters');
        expect(filterButton).toBeInTheDocument();
    });

    test('filter popup opens when TuneIcon is clicked', async () => {
        const user = userEvent.setup();

        // Act
        renderAutocompleter();
        expect(screen.queryByText('exercises.exactMatch')).not.toBeInTheDocument();
        await user.click(screen.getByLabelText('Toggle filters'));

        // Assert - the popover shows the language filter and the exact match switch
        expect(await screen.findByText('exercises.exactMatch')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'language' })).toBeInTheDocument();
    });

    test('exact match toggle saves to localStorage', async () => {

        // Arrange
        const user = userEvent.setup();
        localStorage.setItem(STORAGE_KEY_EXERCISE_EXACT_MATCH, 'false');

        // Act
        renderAutocompleter();
        await user.click(screen.getByLabelText('Toggle filters'));
        const exactMatchSwitch = await screen.findByRole('switch');
        expect(exactMatchSwitch).not.toBeChecked();
        await user.click(exactMatchSwitch);

        // Assert
        expect(exactMatchSwitch).toBeChecked();
        expect(localStorage.getItem(STORAGE_KEY_EXERCISE_EXACT_MATCH)).toBe('true');
    });

    test('changing the language filter saves it to localStorage', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        renderAutocompleter();
        await user.click(screen.getByLabelText('Toggle filters'));
        await user.click(await screen.findByRole('combobox', { name: 'language' }));
        await user.click(screen.getByRole('option', { name: 'nutrition.languageFilterAll' }));

        // Assert
        expect(localStorage.getItem(STORAGE_KEY_EXERCISE_LANGUAGE)).toBe('all');
    });

    test('the search uses the default language filter when nothing is stored', async () => {
        const user = userEvent.setup();

        renderAutocompleter();

        // Type something to trigger the search
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.type(input, 'test');

        // The test i18n runs in english, so only the current language is searched
        await waitFor(() => expect(searchExerciseTranslations).toHaveBeenCalledWith(
            'test',
            'en',
            'current',
            false
        ));
    });

    test('language filter is read from localStorage on render', async () => {
        const user = userEvent.setup();
        localStorage.clear();
        localStorage.setItem(STORAGE_KEY_EXERCISE_LANGUAGE, 'all');

        renderAutocompleter();

        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.type(input, 'test');

        await waitFor(() => expect(searchExerciseTranslations).toHaveBeenCalledWith(
            'test',
            expect.any(String),
            'all',
            false
        ));
    });

    test('exact match calls searchExerciseTranslations with exactMatch=true', async () => {
        // Arrange
        const user = userEvent.setup();
        localStorage.clear();
        localStorage.setItem(STORAGE_KEY_EXERCISE_EXACT_MATCH, 'true');

        // Act
        renderAutocompleter();

        // Type in search box
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.type(input, 'Bench Press');

        // Assert - should be called with exactMatch=true
        await waitFor(() => expect(searchExerciseTranslations).toHaveBeenCalledWith(
            'Bench Press',
            expect.any(String),
            expect.any(String),
            true
        ));
    });

});

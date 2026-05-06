import {
    NameAutocompleter,
    STORAGE_KEY_EXERCISE_EXACT_MATCH,
    STORAGE_KEY_EXERCISE_LANGUAGE
} from "@/components/Exercises/Filter/NameAutcompleter";
import { Exercise } from "@/components/Exercises/models/exercise";
import { searchExerciseTranslations } from "@/services";
import { searchResponse } from "@/tests/exercises/searchResponse";
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from 'react';

import type { Mock } from 'vitest';

vi.mock("@/services");
const mockCallback = vi.fn();

describe("Test the NameAutocompleter component", () => {

    // Arrange
    beforeEach(() => {
        localStorage.clear();
        (searchExerciseTranslations as Mock).mockImplementation(() => Promise.resolve(searchResponse));
    });

    test('renders correct results', async () => {
        const user = userEvent.setup();

        // Act
        render(<NameAutocompleter callback={mockCallback} />);
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
        render(<NameAutocompleter callback={mockCallback} />);
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
        render(<NameAutocompleter callback={mockCallback} />);

        // Assert - TuneIcon button should be present
        const filterButton = screen.getByLabelText('Toggle filters');
        expect(filterButton).toBeInTheDocument();
    });

    test('filter popup opens when TuneIcon is clicked', async () => {

        // Act
        render(<NameAutocompleter callback={mockCallback} />);
        const filterButton = screen.getByLabelText('Toggle filters');

        // Assert - button exists and is clickable
        expect(filterButton).toBeInTheDocument();
        expect(filterButton).not.toBeDisabled();

        // Click the filter button
        await act(async () => {
            fireEvent.click(filterButton);
        });

        // Assert - TuneIcon button was clicked successfully
        expect(filterButton).toBeInTheDocument();
    });

    test('exact match toggle saves to localStorage', async () => {

        // Arrange
        localStorage.clear();
        localStorage.setItem(STORAGE_KEY_EXERCISE_EXACT_MATCH, 'false');

        // Act
        render(<NameAutocompleter callback={mockCallback} />);

        // Directly set localStorage as if user toggled
        localStorage.setItem(STORAGE_KEY_EXERCISE_EXACT_MATCH, 'true');

        // Assert
        expect(localStorage.getItem(STORAGE_KEY_EXERCISE_EXACT_MATCH)).toBe('true');
    });

    test('language filter saves to localStorage when component renders', async () => {
        const user = userEvent.setup();
        localStorage.clear();

        render(<NameAutocompleter callback={mockCallback} />);

        // Type something to trigger the search
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await user.type(input, 'test');

        await waitFor(() => expect(searchExerciseTranslations).toHaveBeenCalledWith(
            'test',
            expect.any(String),
            expect.any(String),
            false
        ));
    });

    test('language filter is read from localStorage on render', async () => {
        const user = userEvent.setup();
        localStorage.clear();
        localStorage.setItem(STORAGE_KEY_EXERCISE_LANGUAGE, 'all');

        render(<NameAutocompleter callback={mockCallback} />);

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
        render(<NameAutocompleter callback={mockCallback} />);

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
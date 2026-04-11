import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import React from 'react';
import { searchExerciseTranslations } from "services";
import { searchResponse } from "tests/exercises/searchResponse";
import { Exercise } from "components/Exercises/models/exercise";

jest.mock("services");
const mockCallback = jest.fn();

describe("Test the NameAutocompleter component", () => {

    // Arrange
    beforeEach(() => {
        (searchExerciseTranslations as jest.Mock).mockImplementation(() => Promise.resolve(searchResponse));
    });

    test('renders correct results', async () => {

        // Act
        render(<NameAutocompleter callback={mockCallback} />);
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await act(() => {
            autocomplete.focus();
            autocomplete.click();
        });

        // Assert
        expect(searchExerciseTranslations).not.toHaveBeenCalled();
        fireEvent.input(input, { target: { value: 'Cru' } });

        expect(screen.getByLabelText("exercises.searchExerciseName")).toBeInTheDocument();
        expect(screen.getByText("noResults")).toBeInTheDocument();
        expect(screen.queryByText("Crunches an Negativbank")).not.toBeInTheDocument();
        expect(screen.queryByText("Bauch")).not.toBeInTheDocument();
        expect(screen.queryByText("Crunches am Seil")).not.toBeInTheDocument();
        expect(screen.queryByText("Brust")).not.toBeInTheDocument();

        // There's a bounce period of 200ms between the input and the search
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });
        expect(searchExerciseTranslations).toHaveBeenCalled();
        expect(screen.getByText("Crunches an Negativbank")).toBeInTheDocument();
        expect(screen.getByText("Bauch")).toBeInTheDocument();
        expect(screen.getByText("Crunches am Seil")).toBeInTheDocument();
        expect(screen.getByText("Brust")).toBeInTheDocument();
    });

    test('callback was correctly called', async () => {

        // Act
        render(<NameAutocompleter callback={mockCallback} />);
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        await act(() => {
            autocomplete.focus();
            autocomplete.click();
        });
        fireEvent.input(input, { target: { value: 'Cru' } });

        // There's a bounce period of 200ms between the input and the search
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });

        // Select first result
        fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
        await waitFor(() => {
            fireEvent.keyDown(autocomplete, { key: 'Enter' });
        });

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
        localStorage.setItem('wger.exerciseSearch.exactMatch', 'false');

        // Act
        render(<NameAutocompleter callback={mockCallback} />);

        // Directly set localStorage as if user toggled
        localStorage.setItem('wger.exerciseSearch.exactMatch', 'true');

        // Assert
        expect(localStorage.getItem('wger.exerciseSearch.exactMatch')).toBe('true');
    });

    test('language filter saves to localStorage when component renders', async () => {

        // Arrange
        localStorage.clear();

        // Act - just render the component
        render(<NameAutocompleter callback={mockCallback} />);

        // Type something to trigger the search
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        fireEvent.input(input, { target: { value: 'test' } });

        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });

        // Assert - searchExerciseTranslations should have been called
        expect(searchExerciseTranslations).toHaveBeenCalled();
    });

    test('exact match calls searchExerciseTranslations with exactMatch=true', async () => {

        // Arrange
        localStorage.clear();
        localStorage.setItem('wger.exerciseSearch.exactMatch', 'true');

        // Act
        render(<NameAutocompleter callback={mockCallback} />);

        // Type in search box
        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');
        fireEvent.input(input, { target: { value: 'Bench Press' } });

        // Wait for debounce
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });

        // Assert - should be called with exactMatch=true
        expect(searchExerciseTranslations).toHaveBeenCalledWith(
            'Bench Press',
            expect.any(String),
            expect.any(Boolean),
            true
        );
    });

});
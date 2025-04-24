import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import React from 'react';
import { searchExerciseTranslations } from "services";
import { searchResponse } from "tests/exercises/searchResponse";

jest.mock("services");
const mockCallback = jest.fn();

describe("Test the NameAutocompleter component", () => {

    // Arrange
    beforeEach(() => {
        // @ts-ignore
        searchExerciseTranslations.mockImplementation(() => Promise.resolve(searchResponse));
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
        expect(searchExerciseTranslations).not.toBeCalled();
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
        expect(searchExerciseTranslations).toBeCalled();
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
        expect(mockCallback).lastCalledWith(searchResponse[0]);
    });
});

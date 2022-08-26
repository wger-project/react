import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { searchExerciseTranslations } from "services";

jest.mock("services");
const mockCallback = jest.fn();

describe("Test the NameAutocompleter component", () => {

    // Arrange
    const response = [{
        "value": "Crunches an Negativbank",
        "data": {
            "id": 1149,
            "base_id": 927,
            "name": "Crunches an Negativbank",
            "category": "Bauch",
            "image": null,
            "image_thumbnail": null
        }
    }, {
        "value": "Crunches am Seil",
        "data": {
            "id": 1213,
            "base_id": 979,
            "name": "Crunches am Seil",
            "category": "Brust",
            "image": null,
            "image_thumbnail": null
        }
    }];

    beforeEach(() => {
        // @ts-ignore
        searchExerciseTranslations.mockImplementation(() => Promise.resolve(response));
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
        expect(screen.queryByText("Crunches an Negati…")).not.toBeInTheDocument();
        expect(screen.queryByText("Bauch")).not.toBeInTheDocument();
        expect(screen.queryByText("Crunches am Seil")).not.toBeInTheDocument();
        expect(screen.queryByText("Brust")).not.toBeInTheDocument();

        // There's a bounce period of 200ms between the input and the search
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });
        expect(searchExerciseTranslations).toBeCalled();
        expect(screen.getByText("Crunches an Negati…")).toBeInTheDocument();
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
            // eslint-disable-next-line testing-library/no-wait-for-side-effects
            fireEvent.keyDown(autocomplete, { key: 'Enter' });
        });

        // Assert
        expect(mockCallback).lastCalledWith(response[0]);
    });
});

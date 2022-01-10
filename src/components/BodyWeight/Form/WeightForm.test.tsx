import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WeightEntry } from "components/BodyWeight/model";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import * as weightService from "services/weight";

jest.mock("services/weight");

describe("Test WeightForm component", () => {
    test('Passing an existing entry renders its values in the form', () => {

        // Arrange
        const weightEntry: WeightEntry = {
            id: 1,
            date: new Date('2021-12-10'),
            weight: 80
        };

        // Act
        render(<WeightForm weightEntry={weightEntry} />);

        // Assert
        expect(screen.getByDisplayValue('2021-12-10')).toBeInTheDocument();
        expect(screen.getByDisplayValue('80')).toBeInTheDocument();
        expect(screen.getByLabelText('date')).toBeInTheDocument();
        expect(screen.getByLabelText('weight')).toBeInTheDocument();
        expect(screen.getByText('submit')).toBeInTheDocument();
    });

    test('Editing an existing entry', async () => {

        // Arrange
        const weightEntry: WeightEntry = {
            id: 1,
            date: new Date('2021-12-10'),
            weight: 80
        };

        // Act
        await render(<WeightForm weightEntry={weightEntry} />);
        const button = screen.getByRole('button', { name: 'submit' });

        // Assert
        expect(button).toBeInTheDocument();
        fireEvent.click(button);
        await waitFor(() => {
            expect(weightService.updateWeight).toHaveBeenCalledTimes(1);
        });
    });

});

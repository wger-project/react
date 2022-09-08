import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WeightEntry } from "components/BodyWeight/model";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { createWeight, updateWeight } from "services";

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
            date: new Date('2022-02-28'),
            weight: 80
        };

        // Act
        await render(<WeightForm weightEntry={weightEntry} />);
        const submitButton = screen.getByRole('button', { name: 'submit' });

        // Assert
        expect(submitButton).toBeInTheDocument();
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(updateWeight).toHaveBeenCalledTimes(1);
        });
    });

    test('Creating a new weight entry', async () => {

        // Arrange
        await render(<WeightForm />);
        const dateInput = await screen.findByLabelText('date');
        const weightInput = await screen.findByLabelText('weight');
        const submitButton = screen.getByRole('button', { name: 'submit' });

        // Act
        fireEvent.input(dateInput, { target: { value: '2022-02-28' } });
        fireEvent.input(weightInput, { target: { value: '80' } });

        // Assert
        expect(dateInput).toBeInTheDocument();
        expect(weightInput).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(createWeight).toHaveBeenCalledTimes(1);
        });
    });

});

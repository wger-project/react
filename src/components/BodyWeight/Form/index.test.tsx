import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeightEntry } from "components/BodyWeight/model";
import { WeightForm } from "components/BodyWeight/Form/index";

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

});

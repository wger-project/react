import React from 'react';
import { render, screen } from '@testing-library/react';
import { MuscleFilter } from "components/Exercises/Filter/MuscleFilter";
import { Muscle } from "components/Exercises/models/muscle";

describe("Test the CategoryFilter component", () => {
    test('renders without crashing', async () => {

        // Arrange
        const data = [
            new Muscle(2, "Anterior deltoid", "Shoulders", true),
            new Muscle(1, "Biceps brachii", "Biceps", false),
        ];

        // Act
        render(<MuscleFilter muscles={data} selectedMuscles={[]} setSelectedMuscles={() => {
        }} />);

        // Assert
        const cat1Element = await screen.findByText("Anterior deltoid");
        expect(cat1Element).toBeInTheDocument();

        const cat2Element = await screen.findByText("Biceps brachii");
        expect(cat2Element).toBeInTheDocument();
    });

});

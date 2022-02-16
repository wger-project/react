import React from 'react';
import { render, screen } from '@testing-library/react';
import { Equipment } from "components/Exercises/models/equipment";
import { EquipmentFilter } from "components/Exercises/Filter/EquipmentFilter";

describe("Test the CategoryFilter component", () => {
    test('renders without crashing', async () => {

        // Arrange
        const data = [
            new Equipment(1, "Bench"),
            new Equipment(99, "Kettlebell"),
            new Equipment(101, "Dumbbell"),
        ];

        // Act
        render(<EquipmentFilter equipment={data} selectedEquipment={[]} setSelectedEquipment={() => {
        }} />);

        // Assert
        const cat1Element = await screen.findByText("Bench");
        expect(cat1Element).toBeInTheDocument();

        const cat2Element = await screen.findByText("Kettlebell");
        expect(cat2Element).toBeInTheDocument();

        const cat3Element = await screen.findByText("Dumbbell");
        expect(cat3Element).toBeInTheDocument();
    });

});

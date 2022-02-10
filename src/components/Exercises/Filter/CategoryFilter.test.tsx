import React from 'react';
import { render, screen } from '@testing-library/react';
import { Category } from "components/Exercises/models/category";
import { CategoryFilter } from "components/Exercises/Filter/CategoryFilter";

describe("Test the CategoryFilter component", () => {
    test('renders without crashing', async () => {

        // Arrange
        const data = [
            new Category(10, "Abs"),
            new Category(8, "Arms"),
            new Category(12, "Back"),
        ];

        // Act
        render(<CategoryFilter categories={data} />);

        // Assert
        const cat1Element = await screen.findByText("Abs");
        expect(cat1Element).toBeInTheDocument();

        const cat2Element = await screen.findByText("Arms");
        expect(cat2Element).toBeInTheDocument();

        const cat3Element = await screen.findByText("Back");
        expect(cat3Element).toBeInTheDocument();
    });

});

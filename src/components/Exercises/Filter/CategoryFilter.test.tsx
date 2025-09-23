import { render, screen } from '@testing-library/react';
import { CategoryFilter } from "components/Exercises/Filter/CategoryFilter";
import { Category } from "components/Exercises/models/category";
import { useCategoriesQuery } from "components/Exercises/queries";
import React from 'react';
import { ExerciseFiltersContext } from './ExerciseFiltersContext';


jest.mock("components/Exercises/queries");
const mockeCategoryQuery = useCategoriesQuery as jest.Mock;

describe("Test the CategoryFilter component", () => {

    beforeEach(() => {
        mockeCategoryQuery.mockImplementation(() => (
            {
                isLoading: false,
                data: [
                    new Category(10, "Abs"),
                    new Category(8, "Arms"),
                    new Category(12, "Back"),
                ]
            }
        ));
    });

    test('renders without crashing', async () => {

        // Arrange
        const noop = () => void 0;

        // Act
        render(
            <ExerciseFiltersContext.Provider value={{
                selectedEquipment: [],
                setSelectedEquipment: noop,
                selectedMuscles: [],
                setSelectedMuscles: noop,
                selectedCategories: [],
                setSelectedCategories: noop
            }}>
                <CategoryFilter />
            </ExerciseFiltersContext.Provider>
        );

        // Assert
        const cat1Element = await screen.findByText("Abs");
        expect(cat1Element).toBeInTheDocument();

        const cat2Element = await screen.findByText("Arms");
        expect(cat2Element).toBeInTheDocument();

        const cat3Element = await screen.findByText("Back");
        expect(cat3Element).toBeInTheDocument();
    });

});

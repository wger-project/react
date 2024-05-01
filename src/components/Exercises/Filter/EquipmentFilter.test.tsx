import { render, screen } from '@testing-library/react';
import { EquipmentFilter } from "components/Exercises/Filter/EquipmentFilter";
import { Equipment } from "components/Exercises/models/equipment";
import { useEquipmentQuery } from "components/Exercises/queries";
import React from 'react';
import { ExerciseFiltersContext } from "./ExerciseFiltersContext";


jest.mock("components/Exercises/queries");
const mockedEquipmentQuery = useEquipmentQuery as jest.Mock;

describe("Test the CategoryFilter component", () => {
    beforeEach(() => {
        mockedEquipmentQuery.mockImplementation(() => (
            {
                isLoading: false,
                data: [
                    new Equipment(1, "Bench"),
                    new Equipment(99, "Kettlebell"),
                    new Equipment(101, "Dumbbell"),
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
                <EquipmentFilter />
            </ExerciseFiltersContext.Provider>);

        // Assert
        const cat1Element = await screen.findByText("server.bench");
        expect(cat1Element).toBeInTheDocument();

        const cat2Element = await screen.findByText("server.kettlebell");
        expect(cat2Element).toBeInTheDocument();

        const cat3Element = await screen.findByText("server.dumbbell");
        expect(cat3Element).toBeInTheDocument();
    });

});

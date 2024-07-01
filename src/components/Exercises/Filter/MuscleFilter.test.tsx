import { render, screen } from '@testing-library/react';
import { MuscleFilter } from "components/Exercises/Filter/MuscleFilter";
import { Muscle } from "components/Exercises/models/muscle";
import { useMusclesQuery } from "components/Exercises/queries";
import React from 'react';
import { ExerciseFiltersContext } from './ExerciseFiltersContext';

jest.mock("components/Exercises/queries");
const mockedMuscleQuery = useMusclesQuery as jest.Mock;

describe("Test the CategoryFilter component", () => {
    beforeEach(() => {
        mockedMuscleQuery.mockImplementation(() => (
            {
                isLoading: false,
                data: [
                    new Muscle(2, "Anterior deltoid", "Shoulders", true),
                    new Muscle(1, "Biceps brachii", "Biceps", false),
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
                <MuscleFilter />
            </ExerciseFiltersContext.Provider>
        );

        // Assert
        const cat1Element = await screen.findByText("Anterior deltoid");
        expect(cat1Element).toBeInTheDocument();

        const cat2Element = await screen.findByText("Biceps brachii");
        expect(cat2Element).toBeInTheDocument();
    });
});

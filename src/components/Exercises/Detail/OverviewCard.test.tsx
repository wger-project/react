import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";
import { Category } from "components/Exercises/models/category";
import { Equipment } from "components/Exercises/models/equipment";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { Language } from "components/Exercises/models/language";


describe("Test the exercise overview card component", () => {

    // Arrange
    const exerciseTranslation1 = new ExerciseTranslation(111,
        '583281c7-2362-48e7-95d5-8fd6c455e0fb',
        'Squats',
        'Do a squat',
        2
    );
    const exerciseTranslation2 = new ExerciseTranslation(9,
        'dae6f6ed-9408-4e62-a59a-1a33f4e8ab36',
        'Kniebeuge',
        'Kniebeuge machen',
        1
    );
    const category = new Category(10, "Abs");
    const equipment1 = new Equipment(10, "Kettlebell");
    const equipment2 = new Equipment(1, "Test 123");
    const exerciseBase = new ExerciseBase(
        345,
        "c788d643-150a-4ac7-97ef-84643c6419bf",
        category,
        [equipment1, equipment2],
        [],
        [],
        [],
        [],
        [],
        [
            exerciseTranslation1,
            exerciseTranslation2
        ]
    );


    test('Render the overview card, no language selected -> use english', () => {

        // Act
        render(<OverviewCard exerciseBase={exerciseBase} />);

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Abs')).toBeInTheDocument();
        expect(screen.getByText('Kettlebell')).toBeInTheDocument();
        expect(screen.getByText('Test 123')).toBeInTheDocument();
    });


    test('Render the overview card with an existing translation', async () => {

        // Arrange
        const language = new Language(1, "de", "Deutsch");

        // Act
        render(<OverviewCard exerciseBase={exerciseBase} language={language} />);

        // Assert
        expect(screen.queryByText('Squats')).not.toBeInTheDocument();
        expect(screen.getByText('Kniebeuge')).toBeInTheDocument();

        expect(screen.getByText('Abs')).toBeInTheDocument();
        expect(screen.getByText('Kettlebell')).toBeInTheDocument();
        expect(screen.getByText('Test 123')).toBeInTheDocument();
    });

    test('Render the overview card with a non existing translation -> fallback to english', async () => {

        // Arrange
        const language = new Language(3, "fr", "Français");

        // Act
        render(<OverviewCard exerciseBase={exerciseBase} language={language} />);

        // Assert
        expect(screen.queryByText('Kniebeuge')).not.toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Abs')).toBeInTheDocument();
        expect(screen.getByText('Kettlebell')).toBeInTheDocument();
        expect(screen.getByText('Test 123')).toBeInTheDocument();
    });
});

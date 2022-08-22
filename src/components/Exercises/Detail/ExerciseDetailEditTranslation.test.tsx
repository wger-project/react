import React from 'react';
import { render, screen } from '@testing-library/react';
import { testExerciseSquats, testLanguageGerman } from "tests/exerciseTestdata";
import { ExerciseDetailEditTranslation } from "components/Exercises/Detail/ExerciseDetailEditTranslation";
import { editExerciseTranslation } from "services/exerciseTranslation";
import userEvent from "@testing-library/user-event";

jest.mock("services/exerciseTranslation");

describe("Component tests", () => {

    beforeEach(() => {
        // @ts-ignore
        editExerciseTranslation.mockImplementation(() => Promise.resolve(testExerciseSquats.translations[1]));
    });

    test('correctly renders the form', () => {

        // Act
        render(
            <ExerciseDetailEditTranslation
                exercise={testExerciseSquats}
                language={testLanguageGerman}
            />
        );

        // Assert
        expect(screen.getByText("Squats")).toBeInTheDocument();
        expect(screen.getByText("Do a squat")).toBeInTheDocument();

        expect(screen.getByDisplayValue("Kniebeuge")).toBeInTheDocument();
        expect(screen.getByText("Königsübung")).toBeInTheDocument();
        expect(screen.getByText("Beinverdicker")).toBeInTheDocument();
        expect(screen.getByText("Die Kniebeuge ist eine Übung zur Kräftigung der Oberschenkelmuskulatur")).toBeInTheDocument();
    });

    test('correctly updates the exercise', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <ExerciseDetailEditTranslation
                exercise={testExerciseSquats}
                language={testLanguageGerman}
            />
        );
        const name = screen.getByLabelText("name");
        await user.clear(name);
        await user.type(name, 'Mangalitza');

        const button = screen.getByText('save');
        await user.click(button);

        // Assert
        //screen.debug();
        //screen.logTestingPlaygroundURL();
        expect(editExerciseTranslation).toHaveBeenCalled();
        expect(editExerciseTranslation).toHaveBeenCalledWith(
            9,
            345,
            1,
            'Mangalitza',
            'Die Kniebeuge ist eine Übung zur Kräftigung der Oberschenkelmuskulatur'
        );
    });
});
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { testExerciseSquats, testLanguageFrench, testLanguageGerman } from "tests/exerciseTestdata";
import { ExerciseDetailEditTranslation } from "components/Exercises/Detail/ExerciseDetailEditTranslation";
import userEvent from "@testing-library/user-event";
import { addExerciseTranslation, deleteAlias, editExerciseTranslation, postAlias } from "services";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";

jest.mock("services");

describe("Exercise translation edit tests", () => {

    beforeEach(() => {
        // @ts-ignore
        editExerciseTranslation.mockImplementation(() => Promise.resolve(testExerciseSquats.translations[1]));

        // @ts-ignore
        addExerciseTranslation.mockImplementation(() => Promise.resolve(
            new ExerciseTranslation(
                300,
                '409f4b97-a56d-4852-85b2-834ba18b7ccc',
                'Sanglier',
                "Le sanglier d'Europe, est une espèce de mammifères de la famille des Suidés",
                3,
            )
        ));

        // @ts-ignore
        deleteAlias.mockImplementation(() => Promise.resolve({ status: 204 }));
        // @ts-ignore
        postAlias.mockImplementation(() => Promise.resolve(
            {
                status: 204,
                data: {
                    id: 123,
                    name: 'Foo',
                }
            }
        ));
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

        // Always show base data in English
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Do a squat')).toBeInTheDocument();

        // Show the translation
        expect(screen.getByDisplayValue('Kniebeuge')).toBeInTheDocument();
        expect(screen.getByText('Königsübung')).toBeInTheDocument();
        expect(screen.getByText('Beinverdicker')).toBeInTheDocument();
        expect(screen.getByText('Die Kniebeuge ist eine Übung zur Kräftigung der Oberschenkelmuskulatur')).toBeInTheDocument();
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
        const name = screen.getByLabelText('name');
        await user.clear(name);
        await user.type(name, 'Mangalitza');

        const button = screen.getByText('save');
        await user.click(button);

        // Assert
        //screen.debug();
        //screen.logTestingPlaygroundURL();
        expect(addExerciseTranslation).not.toHaveBeenCalled();
        expect(editExerciseTranslation).toHaveBeenCalledWith(
            9,
            345,
            1,
            'Mangalitza',
            'Die Kniebeuge ist eine Übung zur Kräftigung der Oberschenkelmuskulatur'
        );
    });

    test('correctly updates the aliases', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <ExerciseDetailEditTranslation
                exercise={testExerciseSquats}
                language={testLanguageGerman}
            />
        );
        // Remove one alias
        const button = screen.getByRole('button', { name: 'Beinverdicker' });
        const cancelIcon = within(button).getByTestId('CancelIcon');
        await user.click(cancelIcon);

        // Add a new one
        const aliasInput = screen.getByRole('combobox');
        await user.click(aliasInput);
        await user.type(aliasInput, 'another name');
        await user.keyboard('{enter}');

        const save = screen.getByText('save');
        await user.click(save);

        // Assert
        expect(deleteAlias).toHaveBeenCalledWith(2);
        expect(postAlias).toHaveBeenCalledWith(9, 'another name');
    });

    test('creates a new translation if the language is not available', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <ExerciseDetailEditTranslation
                exercise={testExerciseSquats}
                language={testLanguageFrench}
            />
        );

        // Enter description
        const name = screen.getByLabelText('name');
        await user.type(name, 'Sanglier');

        const description = screen.getByLabelText('description');
        await user.type(description, "Le sanglier d'Europe, est une espèce de mammifères de la famille des Suidés");

        // Add a new alias
        const aliasInput = screen.getByRole('combobox');
        await user.click(aliasInput);
        await user.type(aliasInput, "Sanglier d'Europe");
        await user.keyboard('{enter}');

        const button = screen.getByText('save');
        await user.click(button);

        // Assert
        expect(deleteAlias).not.toHaveBeenCalled();
        expect(postAlias).toHaveBeenCalledWith(
            300, // new translation id
            "Sanglier d'Europe"
        );

        expect(editExerciseTranslation).not.toHaveBeenCalled();
        expect(addExerciseTranslation).toHaveBeenCalledWith(345,
            3,
            'Sanglier',
            "Le sanglier d'Europe, est une espèce de mammifères de la famille des Suidés"
        );
    });
});
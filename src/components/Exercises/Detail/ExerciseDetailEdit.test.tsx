import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { ExerciseDetailEdit } from "components/Exercises/Detail/ExerciseDetailEdit";
import {
    useAddTranslationQuery,
    useCategoriesQuery,
    useEditTranslationQuery,
    useEquipmentQuery,
    useExerciseQuery,
    useMusclesQuery
} from "components/Exercises/queries";
import { usePermissionQuery } from "components/User/queries/permission";
import { useProfileQuery } from "components/User/queries/profile";
import React from 'react';
import { deleteAlias, editTranslation, postAlias } from "services";
import {
    testCategories,
    testEquipment,
    testExerciseSquats,
    testLanguageFrench,
    testLanguageGerman,
    testMuscles
} from "tests/exerciseTestdata";
import { testQueryClient } from "tests/queryClient";
import { testProfileDataVerified } from "tests/userTestdata";

// It seems we run into a timeout when running the tests on GitHub actions
jest.setTimeout(15000);

jest.mock("services");
jest.mock("components/User/queries/permission");
jest.mock("components/User/queries/profile");
jest.mock("components/Exercises/queries");

describe("Exercise translation edit tests", () => {

    const editTranslationMutateMock: jest.Mock = jest.fn();
    const addTranslationMutateMock: jest.Mock = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();

        editTranslationMutateMock.mockResolvedValue(testExerciseSquats.translations[0]);
        addTranslationMutateMock.mockResolvedValue(testExerciseSquats.translations[1]);

        // @ts-ignore
        useExerciseQuery.mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testExerciseSquats
        }));

        // @ts-ignore
        useAddTranslationQuery.mockImplementation(() => ({
            isPending: false,
            mutateAsync: addTranslationMutateMock
        }));

        // @ts-ignore
        useEditTranslationQuery.mockImplementation(() => ({
            isPending: false,
            mutateAsync: editTranslationMutateMock
        }));

        // @ts-ignore
        editTranslation.mockImplementation(() => Promise.resolve(testExerciseSquats.translations[1]));

        // @ts-ignore
        useProfileQuery.mockImplementation(() => Promise.resolve(testProfileDataVerified));

        // @ts-ignore
        // addTranslation.mockImplementation(() => Promise.resolve(
        //     new Translation(
        //         300,
        //         '409f4b97-a56d-4852-85b2-834ba18b7ccc',
        //         'Sanglier',
        //         "Le sanglier d'Europe, est une espèce de mammifères de la famille des Suidés",
        //         3,
        //     )
        // ));

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

        // @ts-ignore
        usePermissionQuery.mockImplementation(() => Promise.resolve({ isSuccess: true, data: true }));

        // @ts-ignore
        useCategoriesQuery.mockImplementation(() => Promise.resolve({ isSuccess: true, data: testCategories }));

        // @ts-ignore
        useEquipmentQuery.mockImplementation(() => Promise.resolve({ isSuccess: true, data: testEquipment }));

        // @ts-ignore
        useMusclesQuery.mockImplementation(() => Promise.resolve({ isSuccess: true, data: testMuscles }));
    });

    test('correctly renders the form', () => {
        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <ExerciseDetailEdit
                    exerciseId={345}
                    language={testLanguageGerman}
                />
            </QueryClientProvider>
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
            <QueryClientProvider client={testQueryClient}>
                <ExerciseDetailEdit
                    exerciseId={345}
                    language={testLanguageGerman}
                />
            </QueryClientProvider>
        );
        const name = screen.getByLabelText('name');
        await user.clear(name);
        await user.type(name, 'Mangalitza');

        const button = screen.getByText('save');
        await user.click(button);

        // Assert
        //screen.debug();
        //screen.logTestingPlaygroundURL();
        expect(addTranslationMutateMock).not.toHaveBeenCalled();
        expect(editTranslationMutateMock).toHaveBeenCalledWith({
            exerciseId: 345,
            id: 9,
            languageId: 1,
            author: "",
            description: "Die Kniebeuge ist eine Übung zur Kräftigung der Oberschenkelmuskulatur",
            name: "Mangalitza"
        });
    });

    test('correctly updates the aliases', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <ExerciseDetailEdit
                    exerciseId={345}
                    language={testLanguageGerman}
                />
            </QueryClientProvider>
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
        expect(postAlias).toHaveBeenCalledWith(111, 'another name');
    });


    test('creates a new translation if the language is not available', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <ExerciseDetailEdit
                    exerciseId={345}
                    language={testLanguageFrench}
                />
            </QueryClientProvider>
        );

        // Enter description
        const name = screen.getByLabelText('name');
        await user.type(name, 'Sanglier');

        window.focus = () => {
        };

        const wrapper = screen.getByTestId('jodit-editor');

        //const textarea = container.querySelector('textarea');
        //await user.click(textarea!);
        //await user.type(textarea!, "Le sanglier d'Europe, est une espèce de mammifères de la famille des Suidés");
        //await user.keyboard("Le sanglier d'Europe, est une espèce de mammifères de la famille des Suidés");


        // Add a new alias
        const aliasInput = screen.getByRole('combobox');
        await user.click(aliasInput);
        await user.type(aliasInput, "Sanglier d'Europe");
        await user.keyboard('{enter}');

        const button = screen.getByText('save');
        await user.click(button);

        // Assert
        expect(deleteAlias).not.toHaveBeenCalled();

        // TODO: fix tests, see https://github.com/wger-project/react/issues/404
        /*
        expect(postAlias).toHaveBeenCalledWith(
            300, // new translation id
            "Sanglier d'Europe"
        );
        */

        expect(editTranslation).not.toHaveBeenCalled();
        /*
        expect(addExerciseTranslation).toHaveBeenCalledWith(345,
            3,
            'Sanglier',
            "Le sanglier d'Europe, est une espèce de mammifères de la famille des Suidés"
        );
        */
    });
});
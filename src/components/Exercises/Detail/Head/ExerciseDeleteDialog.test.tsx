import { act, render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { ExerciseDeleteDialog } from "components/Exercises/Detail/Head/ExerciseDeleteDialog";
import React from 'react';
import { MemoryRouter, Routes } from "react-router";
import { Route } from "react-router-dom";
import { deleteExerciseBase, deleteExerciseTranslation, getExerciseBase, searchExerciseTranslations } from "services";
import { searchResponse } from "tests/exercises/searchResponse";
import { testExerciseBenchPress, testExerciseSquats, testLanguageGerman } from "tests/exerciseTestdata";

jest.mock("services");

describe("Test the ExerciseDeleteDialog component", () => {

    const onCloseMock = jest.fn();
    const onChangeLanguageMock = jest.fn();

    // Arrange
    beforeEach(() => {
        // @ts-ignore
        searchExerciseTranslations.mockImplementation(() => Promise.resolve(searchResponse));

        // @ts-ignore
        getExerciseBase.mockImplementation(() => Promise.resolve(testExerciseBenchPress));
    });

    function renderWidget() {
        render(
            <MemoryRouter initialEntries={['/overview/exercises/9']}>
                <Routes>
                    <Route path="overview/exercises/:baseID" element={
                        <ExerciseDeleteDialog
                            onClose={onCloseMock}
                            onChangeLanguage={onChangeLanguageMock}
                            currentExercise={testExerciseSquats}
                            currentLanguage={testLanguageGerman}
                        />
                    } />
                </Routes>
            </MemoryRouter>
        );
    }


    test('correctly deletes the current translation', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderWidget();

        // Assert
        await user.click(screen.getByTestId('button-delete-translation'));
        expect(deleteExerciseTranslation).toHaveBeenCalledWith(9);
        expect(deleteExerciseBase).not.toHaveBeenCalled();
    });

    test('correctly deletes the whole exercise', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderWidget();

        // Assert
        await user.click(screen.getByTestId('button-delete-all'));
        expect(deleteExerciseBase).toHaveBeenCalledWith(345);
        expect(deleteExerciseTranslation).not.toHaveBeenCalled();
    });


    test('correctly sets a replacement with the autocompleter', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        renderWidget();

        const autocomplete = screen.getByTestId('autocomplete');
        await user.click(autocomplete);

        // Assert
        expect(searchExerciseTranslations).not.toBeCalled();
        await user.type(autocomplete, 'Cru');

        expect(screen.getByText("exercises.noReplacementSelected")).toBeInTheDocument();

        // There's a bounce period of 200ms between the input and the search
        await act(async () => {
            await new Promise((r) => setTimeout(r, 250));
        });
        await user.click(screen.getByTestId('autocompleter-result-1149'));
        screen.logTestingPlaygroundURL();
        expect(getExerciseBase).toHaveBeenCalledWith(998);
        expect(screen.queryByText("exercises.noReplacementSelected")).not.toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("2 (abcdef-150a-4ac7-97ef-84643c6419bf)")).toBeInTheDocument();

        await user.click(screen.getByTestId('button-delete-and-replace'));
        expect(deleteExerciseBase).toHaveBeenCalledWith(345, "abcdef-150a-4ac7-97ef-84643c6419bf");
        expect(deleteExerciseTranslation).not.toHaveBeenCalled();

        screen.logTestingPlaygroundURL();
    });

    test('correctly sets a replacement manually setting the ID', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        renderWidget();

        // Assert
        await user.type(screen.getByRole('textbox'), '111');
        expect(screen.getByText("exercises.noReplacementSelected")).toBeInTheDocument();
        await user.click(screen.getByText("exercises.noReplacementSelected"));

        expect(getExerciseBase).toHaveBeenCalledWith(111);
        expect(screen.queryByText("exercises.noReplacementSelected")).not.toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("2 (abcdef-150a-4ac7-97ef-84643c6419bf)")).toBeInTheDocument();

        await user.click(screen.getByTestId('button-delete-and-replace'));
        expect(deleteExerciseBase).toHaveBeenCalledWith(345, "abcdef-150a-4ac7-97ef-84643c6419bf");
        expect(deleteExerciseTranslation).not.toHaveBeenCalled();
    });
});

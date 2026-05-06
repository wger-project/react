import { ExerciseDeleteDialog } from "@/components/Exercises/Detail/Head/ExerciseDeleteDialog";
import { deleteExercise, deleteExerciseTranslation, getExercise, searchExerciseTranslations } from "@/services";
import { searchResponse } from "@/tests/exercises/searchResponse";
import { testExerciseBenchPress, testExerciseSquats, testLanguageGerman } from "@/tests/exerciseTestdata";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from 'react';
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Mock } from 'vitest';

vi.mock("@/services");

describe("Test the ExerciseDeleteDialog component", () => {

    const onCloseMock = vi.fn();
    const onChangeLanguageMock = vi.fn();

    // Arrange
    beforeEach(() => {
        vi.resetAllMocks();

        (searchExerciseTranslations as Mock).mockImplementation(() => Promise.resolve(searchResponse));
        (getExercise as Mock).mockImplementation(() => Promise.resolve(testExerciseBenchPress));
        (deleteExercise as Mock).mockImplementation(() => Promise.resolve(204));
    });

    function renderWidget() {
        render(
            <MemoryRouter initialEntries={['/overview/exercises/9']}>
                <Routes>
                    <Route path="overview/exercises/:exerciseId" element={
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
        expect(deleteExercise).not.toHaveBeenCalled();
    });

    test('correctly deletes the whole exercise', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderWidget();

        // Assert
        await user.click(screen.getByTestId('button-delete-all'));
        expect(deleteExercise).toHaveBeenCalledWith(345);
        expect(deleteExerciseTranslation).not.toHaveBeenCalled();
    });


    test('correctly sets a replacement with the autocompleter', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        renderWidget();

        const autocomplete = screen.getByTestId('autocomplete');
        const input = within(autocomplete).getByRole('combobox');

        // Assert
        expect(searchExerciseTranslations).not.toHaveBeenCalled();
        await user.type(input, 'Cru');

        expect(screen.getByText("exercises.noReplacementSelected")).toBeInTheDocument();

        await waitFor(() => expect(searchExerciseTranslations).toHaveBeenCalled());
        await user.click(screen.getByTestId('autocompleter-result-998'));
        expect(getExercise).toHaveBeenCalledWith(998);
        expect(screen.queryByText("exercises.noReplacementSelected")).not.toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("2 (abcdef-150a-4ac7-97ef-84643c6419bf)")).toBeInTheDocument();

        await user.click(screen.getByTestId('button-delete-and-replace'));
        expect(deleteExercise).toHaveBeenCalledWith(345, {
            replacementUUID: "abcdef-150a-4ac7-97ef-84643c6419bf",
            transferMedia: true,
            transferTranslations: true,
        });
        expect(deleteExerciseTranslation).not.toHaveBeenCalled();
    });

    test('passes both transfer flags as false when both checkboxes are unchecked', async () => {
        const user = userEvent.setup();
        renderWidget();

        await user.type(screen.getByRole('textbox'), '111');
        await user.click(screen.getByText("exercises.noReplacementSelected"));

        await user.click(screen.getByLabelText("exercises.transferMediaLabel"));
        await user.click(screen.getByLabelText("exercises.transferTranslationsLabel"));

        await user.click(screen.getByTestId('button-delete-and-replace'));

        expect(deleteExercise).toHaveBeenCalledWith(345, {
            replacementUUID: "abcdef-150a-4ac7-97ef-84643c6419bf",
            transferMedia: false,
            transferTranslations: false,
        });
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

        expect(getExercise).toHaveBeenCalledWith(111);
        expect(screen.queryByText("exercises.noReplacementSelected")).not.toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("2 (abcdef-150a-4ac7-97ef-84643c6419bf)")).toBeInTheDocument();

        await user.click(screen.getByTestId('button-delete-and-replace'));
        expect(deleteExercise).toHaveBeenCalledWith(345, {
            replacementUUID: "abcdef-150a-4ac7-97ef-84643c6419bf",
            transferMedia: true,
            transferTranslations: true,
        });
        expect(deleteExerciseTranslation).not.toHaveBeenCalled();
    });
});

import { ExerciseDeleteDialog } from "@/components/Exercises/screens/Detail/Head/ExerciseDeleteDialog";
import {
    useDeleteExerciseQuery,
    useDeleteExerciseTranslationQuery,
    useFetchExerciseQuery,
    useSearchExerciseTranslationsQuery,
} from "@/components/Exercises/queries";
import { searchExerciseTranslations } from "@/components/Exercises/api/exerciseTranslation";
import { searchResponse } from "@/tests/exercises/searchResponse";
import { testExerciseBenchPress, testExerciseSquats, testLanguageGerman } from "@/tests/exerciseTestdata";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from 'react';
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Mock } from 'vitest';

vi.mock("@/components/Exercises/api/exerciseTranslation");
vi.mock("@/components/Exercises/queries");

describe("Test the ExerciseDeleteDialog component", () => {

    const onCloseMock = vi.fn();
    const onChangeLanguageMock = vi.fn();

    let deleteExerciseMock: Mock;
    let deleteTranslationMock: Mock;
    let fetchExerciseMock: Mock;

    // Arrange
    beforeEach(() => {
        vi.resetAllMocks();

        (searchExerciseTranslations as Mock).mockImplementation(() => Promise.resolve(searchResponse));

        deleteExerciseMock = vi.fn().mockResolvedValue(204);
        deleteTranslationMock = vi.fn().mockResolvedValue(204);
        fetchExerciseMock = vi.fn().mockResolvedValue(testExerciseBenchPress);

        (useDeleteExerciseQuery as Mock).mockImplementation(() => ({ mutateAsync: deleteExerciseMock }));
        (useDeleteExerciseTranslationQuery as Mock).mockImplementation(() => ({ mutateAsync: deleteTranslationMock }));
        (useFetchExerciseQuery as Mock).mockImplementation(() => fetchExerciseMock);
        (useSearchExerciseTranslationsQuery as Mock).mockImplementation(() => searchExerciseTranslations);
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
        expect(deleteTranslationMock).toHaveBeenCalledWith(9);
        expect(deleteExerciseMock).not.toHaveBeenCalled();
    });

    test('correctly deletes the whole exercise', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderWidget();

        // Assert
        await user.click(screen.getByTestId('button-delete-all'));
        // No replacement options — mutateAsync() called with no arg.
        expect(deleteExerciseMock).toHaveBeenCalledWith();
        expect(deleteTranslationMock).not.toHaveBeenCalled();
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
        expect(fetchExerciseMock).toHaveBeenCalledWith(998);
        expect(screen.queryByText("exercises.noReplacementSelected")).not.toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("2 (abcdef-150a-4ac7-97ef-84643c6419bf)")).toBeInTheDocument();

        await user.click(screen.getByTestId('button-delete-and-replace'));
        expect(deleteExerciseMock).toHaveBeenCalledWith({
            replacementUUID: "abcdef-150a-4ac7-97ef-84643c6419bf",
            transferMedia: true,
            transferTranslations: true,
        });
        expect(deleteTranslationMock).not.toHaveBeenCalled();
    });

    test('passes both transfer flags as false when both checkboxes are unchecked', async () => {
        const user = userEvent.setup();
        renderWidget();

        await user.type(screen.getByRole('textbox'), '111');
        await user.click(screen.getByText("exercises.noReplacementSelected"));

        await user.click(screen.getByLabelText("exercises.transferMediaLabel"));
        await user.click(screen.getByLabelText("exercises.transferTranslationsLabel"));

        await user.click(screen.getByTestId('button-delete-and-replace'));

        expect(deleteExerciseMock).toHaveBeenCalledWith({
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

        expect(fetchExerciseMock).toHaveBeenCalledWith(111);
        expect(screen.queryByText("exercises.noReplacementSelected")).not.toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("2 (abcdef-150a-4ac7-97ef-84643c6419bf)")).toBeInTheDocument();

        await user.click(screen.getByTestId('button-delete-and-replace'));
        expect(deleteExerciseMock).toHaveBeenCalledWith({
            replacementUUID: "abcdef-150a-4ac7-97ef-84643c6419bf",
            transferMedia: true,
            transferTranslations: true,
        });
        expect(deleteTranslationMock).not.toHaveBeenCalled();
    });
});

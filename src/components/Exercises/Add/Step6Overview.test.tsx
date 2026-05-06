import { Step6Overview } from "@/components/Exercises/Add/Step6Overview";
import { ImageFormData } from "@/components/Exercises/models/exercise";
import { ImageStyle } from "@/components/Exercises/models/image";
import {
    useAddExerciseFullQuery,
    useAddExerciseImageQuery,
    useCategoriesQuery,
    useEquipmentQuery,
    useLanguageQuery,
    useMusclesQuery,
} from "@/components/Exercises/queries";
import { useProfileQuery } from "@/components/User";
import { useExerciseSubmissionStateValue } from "@/state";
import { testCategories, testEquipment, testLanguages, testMuscles } from "@/tests/exerciseTestdata";
import { testProfileDataVerified } from "@/tests/userTestdata";
import { ENGLISH_LANGUAGE_ID } from "@/utils/consts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Mock } from "vitest";

vi.mock("@/components/Exercises/queries");
vi.mock("@/components/User/queries/profile");
vi.mock("@/state");

const mockOnContinue = vi.fn();
const mockOnBack = vi.fn();
const mockedUseCategoriesQuery = useCategoriesQuery as Mock;
const mockedMuscleQuery = useMusclesQuery as Mock;
const mockedUseEquipmentQuery = useEquipmentQuery as Mock;
const mockedLanguageQuery = useLanguageQuery as Mock;
const mockedUseExerciseStateValue = useExerciseSubmissionStateValue as Mock;
const mockedUseProfileQuery = useProfileQuery as Mock;
const addFullExerciseMutation = useAddExerciseFullQuery as Mock;
const addImageMutation = useAddExerciseImageQuery as Mock;

const queryClient = new QueryClient();

const baseState = {
    category: 1,
    muscles: [2],
    musclesSecondary: [],
    variationGroup: null as string | null,
    newVariationExerciseId: null as number | null,
    languageId: 3,
    equipment: [2],

    nameEn: "A new exercise",
    descriptionEn: "This very nice exercise will blow your mind",
    alternativeNamesEn: [],
    notesEn: [],

    nameI18n: "un excellent exercice",
    alternativeNamesI18n: [],
    descriptionI18n: "Ce très bel exercice va vous époustoufler",
    notesI18n: [],

    images: [] as ImageFormData[],
};

function renderStep() {
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/exercises/9"]}>
                <Routes>
                    <Route
                        path="exercises/:exerciseId"
                        element={<Step6Overview onContinue={mockOnContinue} onBack={mockOnBack} />}
                    />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
}

describe("Test the add exercise step 6 component", () => {
    beforeEach(() => {
        mockedUseCategoriesQuery.mockImplementation(() => ({ isLoading: false, data: testCategories }));
        mockedMuscleQuery.mockImplementation(() => ({ isLoading: false, data: testMuscles }));
        mockedUseEquipmentQuery.mockImplementation(() => ({ isLoading: false, data: testEquipment }));
        mockedLanguageQuery.mockImplementation(() => ({ isLoading: false, data: testLanguages }));
        mockedUseProfileQuery.mockImplementation(() => ({ isLoading: false, data: testProfileDataVerified }));
        addFullExerciseMutation.mockImplementation(() => ({
            isIdle: true,
            isSuccess: false,
            isPending: false,
            isError: false
        }));
        addImageMutation.mockImplementation(() => ({ mutateAsync: vi.fn().mockResolvedValue({ id: 1 }) }));

        mockedUseExerciseStateValue.mockImplementation(() => [baseState]);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("Smoketest: renders the EN and translated overviews", () => {
        renderStep();

        expect(screen.getByText("A new exercise")).toBeInTheDocument();
        expect(screen.getByText("This very nice exercise will blow your mind")).toBeInTheDocument();

        expect(screen.getByText("Arms")).toBeInTheDocument();
        expect(screen.getByText("Dumbbell")).toBeInTheDocument();
        expect(screen.getByText("exercises.step1HeaderBasics")).toBeInTheDocument();
        expect(screen.getByText(/Musculus dacttilaris/i)).toBeInTheDocument();

        expect(screen.getByText("un excellent exercice")).toBeInTheDocument();
        expect(screen.getByText("Ce très bel exercice va vous époustoufler")).toBeInTheDocument();
    });

    test("shows the loading placeholder while one of the dependent queries is loading", () => {
        mockedUseCategoriesQuery.mockImplementation(() => ({ isLoading: true, data: undefined }));

        renderStep();

        // The loading placeholder uses CircularProgress, which renders role="progressbar".
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    test("clicking 'submit exercise' triggers mutateAsync with the expected payload", async () => {
        const mutateAsync = vi.fn().mockResolvedValue(42);
        addFullExerciseMutation.mockImplementation(() => ({
            isIdle: true,
            isSuccess: false,
            isPending: false,
            isError: false,
            mutateAsync,
        }));

        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("exercises.submitExercise"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledTimes(1);
        });

        const [payload] = mutateAsync.mock.calls[0];
        expect(payload).toMatchObject({
            exercise: {
                categoryId: baseState.category,
                equipmentIds: baseState.equipment,
                muscleIds: baseState.muscles,
                secondaryMuscleIds: baseState.musclesSecondary,
            },
            author: testProfileDataVerified.username,
            variationGroup: null,
            variationsConnectTo: null,
        });
        // English translation always comes first
        expect(payload.translations[0]).toMatchObject({
            language: ENGLISH_LANGUAGE_ID,
            name: baseState.nameEn,
            description: baseState.descriptionEn,
        });
        // The second-language translation is added when languageId is set
        expect(payload.translations).toHaveLength(2);
        expect(payload.translations[1]).toMatchObject({
            language: baseState.languageId,
            name: baseState.nameI18n,
            description: baseState.descriptionI18n,
        });
    });

    test("when no second language is set, only the EN translation is sent", async () => {
        const mutateAsync = vi.fn().mockResolvedValue(42);
        addFullExerciseMutation.mockImplementation(() => ({
            isIdle: true, isSuccess: false, isPending: false, isError: false, mutateAsync,
        }));
        mockedUseExerciseStateValue.mockImplementation(() => [
            { ...baseState, languageId: null },
        ]);

        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("exercises.submitExercise"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalled();
        });
        const [payload] = mutateAsync.mock.calls[0];
        expect(payload.translations).toHaveLength(1);
        expect(payload.translations[0].language).toBe(ENGLISH_LANGUAGE_ID);
    });

    test("after the exercise is created, each image in state is uploaded individually", async () => {
        const file1 = new File([new Uint8Array([1])], "img1.png", { type: "image/png" });
        const file2 = new File([new Uint8Array([2])], "img2.png", { type: "image/png" });
        const image1: ImageFormData = {
            url: "blob://1",
            file: file1,
            author: "alice",
            authorUrl: "",
            title: "img one",
            derivativeSourceUrl: "",
            objectUrl: "",
            style: ImageStyle.PHOTO,
        };
        const image2: ImageFormData = { ...image1, url: "blob://2", file: file2, title: "img two" };

        const mutateAsync = vi.fn().mockResolvedValue(99);
        addFullExerciseMutation.mockImplementation(() => ({
            isIdle: true, isSuccess: false, isPending: false, isError: false, mutateAsync,
        }));
        const addImageMutateAsync = vi.fn().mockResolvedValue({ id: 1 });
        addImageMutation.mockImplementation(() => ({ mutateAsync: addImageMutateAsync }));

        mockedUseExerciseStateValue.mockImplementation(() => [
            { ...baseState, images: [image1, image2] },
        ]);

        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("exercises.submitExercise"));

        await waitFor(() => {
            expect(addImageMutateAsync).toHaveBeenCalledTimes(2);
        });
        // The exerciseId returned from the mutation is forwarded to each image upload
        expect(addImageMutateAsync).toHaveBeenNthCalledWith(1, {
            exerciseId: 99,
            image: file1,
            imageData: image1,
        });
        expect(addImageMutateAsync).toHaveBeenNthCalledWith(2, {
            exerciseId: 99,
            image: file2,
            imageData: image2,
        });
    });

    test("passes the variation group through to the mutation when set", async () => {
        const mutateAsync = vi.fn().mockResolvedValue(42);
        addFullExerciseMutation.mockImplementation(() => ({
            isIdle: true, isSuccess: false, isPending: false, isError: false, mutateAsync,
        }));
        mockedUseExerciseStateValue.mockImplementation(() => [
            { ...baseState, variationGroup: "abc-123", newVariationExerciseId: null },
        ]);

        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("exercises.submitExercise"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalled();
        });
        expect(mutateAsync.mock.calls[0][0]).toMatchObject({
            variationGroup: "abc-123",
            variationsConnectTo: null,
        });
    });

    test("after success: shows the success alert and the 'see details' button instead of submit/back", () => {
        addFullExerciseMutation.mockImplementation(() => ({
            isIdle: false,
            isSuccess: true,
            isPending: false,
            isError: false,
            data: 42,
            mutateAsync: vi.fn(),
        }));

        renderStep();

        expect(screen.getByText("success")).toBeInTheDocument();
        expect(screen.getByText("seeDetails")).toBeInTheDocument();
        expect(screen.queryByText("exercises.submitExercise")).not.toBeInTheDocument();
        expect(screen.queryByText("goBack")).not.toBeInTheDocument();
    });

    test("the submit button is disabled when the mutation is pending", () => {
        addFullExerciseMutation.mockImplementation(() => ({
            isIdle: false, isSuccess: false, isPending: true, isError: false, mutateAsync: vi.fn(),
        }));

        renderStep();

        expect(screen.getByRole("button", { name: /exercises\.submitExercise/i })).toBeDisabled();
    });

    test("the submit button is disabled when the mutation has errored", () => {
        addFullExerciseMutation.mockImplementation(() => ({
            isIdle: false,
            isSuccess: false,
            isPending: false,
            isError: true,
            error: { message: "boom", response: { data: {} } },
            mutateAsync: vi.fn(),
        }));

        renderStep();

        expect(screen.getByRole("button", { name: /exercises\.submitExercise/i })).toBeDisabled();
    });

    test("clicking 'go back' calls onBack while the form is still idle", async () => {
        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("goBack"));
        expect(mockOnBack).toHaveBeenCalled();
    });
});

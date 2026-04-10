import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { ExerciseDetailEdit } from "components/Exercises/Detail/ExerciseDetailEdit";
import {
    useAddExerciseImageQuery,
    useAddTranslationQuery,
    useCategoriesQuery,
    useDeleteExerciseImageQuery,
    useEditExerciseImageQuery,
    useEditTranslationQuery,
    useEquipmentQuery,
    useExerciseQuery,
    useMusclesQuery
} from "components/Exercises/queries";
import { usePermissionQuery } from "components/User/queries/permission";
import { useProfileQuery } from "components/User/queries/profile";
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
import { ExerciseImage } from "../models/image";
import { Exercise } from "../models/exercise";
import { WgerPermissions } from "permissions";

// It seems we run into a timeout when running the tests on GitHub actions
jest.setTimeout(15000);

jest.mock("services");
jest.mock("components/User/queries/permission");
jest.mock("components/User/queries/profile");
jest.mock("components/Exercises/queries");

const asPromiseHookResult = <T extends object>(value: T): T => {
    return Object.assign(Promise.resolve(value), value) as unknown as T;
};

describe("Exercise translation edit tests", () => {

    const editTranslationMutateMock: jest.Mock = jest.fn();
    const addTranslationMutateMock: jest.Mock = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();

        editTranslationMutateMock.mockResolvedValue(testExerciseSquats.translations[0]);
        addTranslationMutateMock.mockResolvedValue(testExerciseSquats.translations[1]);

        (useExerciseQuery as jest.Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testExerciseSquats
        }));
        (useAddTranslationQuery as jest.Mock).mockImplementation(() => ({
            isPending: false,
            mutateAsync: addTranslationMutateMock
        }));
        (useEditTranslationQuery as jest.Mock).mockImplementation(() => ({
            isPending: false,
            mutateAsync: editTranslationMutateMock
        }));
        (editTranslation as jest.Mock).mockImplementation(() => Promise.resolve(testExerciseSquats.translations[1]));
        (useProfileQuery as jest.Mock).mockImplementation(() => Promise.resolve(testProfileDataVerified));

        (useEditExerciseImageQuery as jest.Mock).mockImplementation(() => ({
            isError: false,
            isPending: false,
            mutateAsync: jest.fn(),
        }));

        (useAddExerciseImageQuery as jest.Mock).mockImplementation(() => ({
            isError: false,
            isPending: false,
            mutate: jest.fn(),
            mutateAsync: jest.fn(),
        }));

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

        (deleteAlias as jest.Mock).mockImplementation(() => Promise.resolve({ status: 204 }));
        (postAlias as jest.Mock).mockImplementation(() => Promise.resolve(
            {
                status: 204,
                data: {
                    id: 123,
                    name: 'Foo',
                }
            }
        ));
        (usePermissionQuery as jest.Mock).mockImplementation(() => Promise.resolve({ isSuccess: true, data: true }));
        (useCategoriesQuery as jest.Mock).mockImplementation(() => Promise.resolve({
            isSuccess: true,
            data: testCategories
        }));
        (useEquipmentQuery as jest.Mock).mockImplementation(() => Promise.resolve({
            isSuccess: true,
            data: testEquipment
        }));
        (useMusclesQuery as jest.Mock).mockImplementation(() => Promise.resolve({
            isSuccess: true,
            data: testMuscles
        }));
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
            description: "",
            descriptionSource: "Die Kniebeuge ist eine Übung zur Kräftigung der Oberschenkelmuskulatur",
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

        // const wrapper = screen.getByTestId('jodit-editor');

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

describe("Exercise image tests", () => {
    const editImageMutateMock: jest.Mock = jest.fn();
    const addImageMutateMock: jest.Mock = jest.fn();
    const deleteImageMutateMock: jest.Mock = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();

        editImageMutateMock.mockResolvedValue({});
        addImageMutateMock.mockResolvedValue({});
        deleteImageMutateMock.mockResolvedValue({});

        (useAddTranslationQuery as jest.Mock).mockImplementation(() => ({
            isPending: false,
            mutateAsync: jest.fn()
        }));
        (useEditTranslationQuery as jest.Mock).mockImplementation(() => ({
            isPending: false,
            mutateAsync: jest.fn()
        }));

        (useEditExerciseImageQuery as jest.Mock).mockImplementation(() => ({
            isError: false,
            isPending: false,
            mutateAsync: editImageMutateMock
        }));
        (useAddExerciseImageQuery as jest.Mock).mockImplementation(() => asPromiseHookResult({
            isError: false,
            isPending: false,
            mutate: addImageMutateMock,
            mutateAsync: addImageMutateMock
        }));
        (useDeleteExerciseImageQuery as jest.Mock).mockImplementation(() => asPromiseHookResult({
            isError: false,
            isPending: false,
            mutate: deleteImageMutateMock,
            mutateAsync: deleteImageMutateMock
        }));

        (useMusclesQuery as jest.Mock).mockImplementation(() => asPromiseHookResult({
            isLoading: false,
            isSuccess: true,
            data: testMuscles
        }));
        (useProfileQuery as jest.Mock).mockImplementation(() => asPromiseHookResult({
            isLoading: false,
            isSuccess: true,
            data: testProfileDataVerified
        }));
        (usePermissionQuery as jest.Mock).mockImplementation((permission: string) => {
            const imagePermission =
                permission === WgerPermissions.ADD_IMAGE
                || permission === WgerPermissions.DELETE_IMAGE;

            return asPromiseHookResult({
                isLoading: false,
                isSuccess: true,
                data: imagePermission
            });
        });
    });

    test("edits an existing image and submits patch mutation", async () => {
        const user = userEvent.setup();

        const image = new ExerciseImage(
            77,
            "img-uuid-77",
            "https://example.com/squat.jpg",
            true,
            "Old title",
            "Old author",
            "https://old-author.example",
            "https://old-object.example",
            "https://old-derivative.example",
            4
        );

        const exerciseWithImage = new Exercise({
            ...testExerciseSquats,
            images: [image]
        });

        (useExerciseQuery as jest.Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: exerciseWithImage,
        }));

        render(
            <QueryClientProvider client={testQueryClient}>
                <ExerciseDetailEdit exerciseId={345} language={testLanguageGerman} />
            </QueryClientProvider>
        );

        // Open image edit modal
        await user.click(screen.getByTestId("edit-image-77"));

        // change fields in the modal
        const getModalInput = async (name: string) => {
            return await waitFor(() => {
                const el = document.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
                expect(el).not.toBeNull();
                return el as HTMLInputElement;
            });
        };

        // Title
        const titleInput = await getModalInput("title");
        await user.clear(titleInput);
        await user.type(titleInput, "Updated title");
        // ObjectURL
        const objectUrlInput = await getModalInput("objectUrl");
        await user.clear(objectUrlInput);
        await user.type(objectUrlInput, "https://updatedObjecturl.com");
        // Author
        const authorInput = await getModalInput("author");
        await user.clear(authorInput);
        await user.type(authorInput, "Updated author");
        // Author URL
        const authorURLInput = await getModalInput("authorUrl");
        await user.clear(authorURLInput);
        await user.type(authorURLInput, "https://updatedAutorurl.com");
        // DerivativeSourceURL
        const derivativeURLInput = await getModalInput("derivativeSourceUrl");
        await user.clear(derivativeURLInput);
        await user.type(derivativeURLInput, "https://updated-derivative.com");

        const clickStyleByValue = async (value: string) => {
            const styleGroup = await waitFor(() => screen.getByRole("group", { name: "text alignment" }));
            const styleButton = styleGroup.querySelector(`button[value="${value}"]`) as HTMLButtonElement | null;
            expect(styleButton).not.toBeNull();
            await user.click(styleButton!);
        };

        // Style
        await clickStyleByValue("2");

        // Submit modal
        const submitButton = screen.getByTestId("submit-edit-image-form");
        await user.click(submitButton);

        expect(editImageMutateMock).toHaveBeenCalledWith({
            imageId: 77,
            image: undefined,
            imageData: expect.objectContaining({
                url: "https://example.com/squat.jpg",
                title: "Updated title",
                author: "Updated author",
                authorUrl: "https://updatedAutorurl.com",
                objectUrl: "https://updatedObjecturl.com",
                derivativeSourceUrl: "https://updated-derivative.com",
                style: 2,
            }),
        });
    });
});

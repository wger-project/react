import { deleteExerciseImage, patchExerciseImage, postExerciseImage, } from "@/components/Exercises/api/image";
import { ExerciseImage, ImageStyle } from "@/components/Exercises/models/image";
import axios from "axios";
import type { Mock } from 'vitest';

vi.mock("axios");


describe("Image service API tests", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });


    test('POST a new exercise image', async () => {

        // Arrange
        const response = {
            "id": 1,
            "uuid": "004bb79f-36bf-4c48-8c00-d863d724717c",
            "exercise": 101,
            "image": "https://wger.de/media/exercise-images/1070/004bb79f-36bf-4c48-8c00-d863d724717c.jpg",
            "is_main": true,
            "status": "1",
            "style": ImageStyle.THREE_D,
            "license_title": "image",
            "license_object_url": "https://object-url.com",
            "license_author": "Test user",
            "license_author_url": "https://author-url.com",
            "license_derivative_source_url": "https://derivative-source-url.com"
        };
        const image = new ExerciseImage(
            1,
            "004bb79f-36bf-4c48-8c00-d863d724717c",
            "https://wger.de/media/exercise-images/1070/004bb79f-36bf-4c48-8c00-d863d724717c.jpg",
            true,
            "image",
            "Test user",
            "https://author-url.com",
            "https://object-url.com",
            "https://derivative-source-url.com",
            ImageStyle.THREE_D
        );

        (axios.post as Mock).mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await postExerciseImage(
            {
                exerciseId: 101,
                image: new File([], "test.jpg"),
                imageData: {
                    url: "http://example.com",
                    file: new File([], "test.jpg"),
                    author: "Dr No",
                    authorUrl: "http://dr.no",
                    title: "top title",
                    objectUrl: "",
                    derivativeSourceUrl: "",
                    style: ImageStyle.THREE_D,
                }
            }
        );

        // Assert
        expect(axios.post).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalledWith(
            'https://example.com/api/v2/exerciseimage/',
            expect.objectContaining({ "exercise": 101 }),
            expect.anything()
        );
        expect(result).toEqual(image);
    });

    test('DELETE an existing image', async () => {

        // Arrange
        (axios.delete as Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteExerciseImage(101);

        // Assert
        expect(axios.delete).toHaveBeenCalled();
        expect(axios.delete).toHaveBeenCalledWith(
            'https://example.com/api/v2/exerciseimage/101/',
            expect.anything()
        );
        expect(result).toEqual(204);
    });

    test('PATCH metadata only - no image key in the FormData when no new file is selected', async () => {
        const apiResponse = {
            id: 1,
            uuid: "004bb79f-36bf-4c48-8c00-d863d724717c",
            exercise: 101,
            image: "https://wger.de/media/img.jpg",
            is_main: true, // eslint-disable-line camelcase
            status: "1",
            style: ImageStyle.PHOTO,
            license_title: "updated title", // eslint-disable-line camelcase
            license_object_url: "https://obj", // eslint-disable-line camelcase
            license_author: "author", // eslint-disable-line camelcase
            license_author_url: "https://author", // eslint-disable-line camelcase
            license_derivative_source_url: "https://deriv", // eslint-disable-line camelcase
        };
        (axios.patch as Mock).mockResolvedValue({ data: apiResponse });

        const result = await patchExerciseImage({
            imageId: 1,
            // no `image` -> only metadata patch
            imageData: {
                url: "ignored-on-edit",
                file: new File([], "ignored.jpg"),
                title: "updated title",
                objectUrl: "https://obj",
                author: "author",
                authorUrl: "https://author",
                derivativeSourceUrl: "https://deriv",
                style: ImageStyle.PHOTO,
            },
        });

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, formData] = (axios.patch as Mock).mock.calls[0];
        expect(url).toBe("https://example.com/api/v2/exerciseimage/1/");
        // FormData was built with the metadata fields
        const fd = formData as FormData;
        expect(fd.get("license_title")).toBe("updated title");
        expect(fd.get("license_author")).toBe("author");
        expect(fd.get("style")).toBe(String(ImageStyle.PHOTO));
        // Crucially: no 'image' key, because no new file was given
        expect(fd.has("image")).toBe(false);
        expect(result).toBeInstanceOf(ExerciseImage);
        expect(result.id).toBe(1);
    });

    test('PATCH with a new file completes successfully and forwards the metadata', async () => {
        // Note: happy-dom's FormData implementation does not preserve File entries
        // reliably under introspection, so we only assert that the metadata fields
        // were appended (these go through the same code path as the file).
        const apiResponse = {
            id: 1,
            uuid: "004bb79f-36bf-4c48-8c00-d863d724717c",
            exercise: 101,
            image: "https://wger.de/media/img.jpg",
            is_main: true, // eslint-disable-line camelcase
            status: "1",
            style: ImageStyle.PHOTO,
            license_title: "t", // eslint-disable-line camelcase
            license_object_url: "", // eslint-disable-line camelcase
            license_author: "a", // eslint-disable-line camelcase
            license_author_url: "", // eslint-disable-line camelcase
            license_derivative_source_url: "", // eslint-disable-line camelcase
        };
        (axios.patch as Mock).mockResolvedValue({ data: apiResponse });

        const newFile = new File([new Uint8Array([1, 2, 3, 4])], "new.jpg", { type: "image/jpeg" });
        Object.defineProperty(newFile, "size", { value: 4 });
        const result = await patchExerciseImage({
            imageId: 1,
            image: newFile,
            imageData: {
                url: "blob://x",
                file: newFile,
                title: "t",
                objectUrl: "",
                author: "a",
                authorUrl: "",
                derivativeSourceUrl: "",
                style: ImageStyle.PHOTO,
            },
        });

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, formData] = (axios.patch as Mock).mock.calls[0];
        expect(url).toBe("https://example.com/api/v2/exerciseimage/1/");
        expect((formData as FormData).get("license_title")).toBe("t");
        expect((formData as FormData).get("license_author")).toBe("a");
        expect(result).toBeInstanceOf(ExerciseImage);
    });

    test('PATCH skips the image key when the file has size 0', async () => {
        // size === 0 is the "the user did not pick a real file" case in the UI
        (axios.patch as Mock).mockResolvedValue({
            data: {
                id: 1,
                uuid: "u",
                exercise: 101,
                image: "x",
                is_main: true, // eslint-disable-line camelcase
                status: "1",
                style: ImageStyle.PHOTO,
                license_title: "",
                license_object_url: "",
                license_author: "",
                license_author_url: "",
                license_derivative_source_url: "", // eslint-disable-line camelcase
            },
        });

        const emptyFile = new File([], "empty.jpg");
        await patchExerciseImage({
            imageId: 1,
            image: emptyFile,
            imageData: {
                url: "blob://x",
                file: emptyFile,
                title: "",
                objectUrl: "",
                author: "",
                authorUrl: "",
                derivativeSourceUrl: "",
                style: ImageStyle.PHOTO,
            },
        });

        const [, formData] = (axios.patch as Mock).mock.calls[0];
        expect((formData as FormData).has("image")).toBe(false);
    });

    test('PATCH re-throws on axios error (after logging it)', async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        });
        const error = Object.assign(new Error("boom"), {
            isAxiosError: true,
            response: { status: 400, data: { detail: "bad" } },
        });
        (axios.isAxiosError as unknown as Mock).mockReturnValue(true);
        (axios.patch as Mock).mockRejectedValue(error);

        await expect(
            patchExerciseImage({
                imageId: 1,
                imageData: {
                    url: "x", file: new File([], "x"), title: "", objectUrl: "",
                    author: "", authorUrl: "", derivativeSourceUrl: "",
                    style: ImageStyle.PHOTO,
                },
            })
        ).rejects.toThrow("boom");

        consoleErrorSpy.mockRestore();
    });
});

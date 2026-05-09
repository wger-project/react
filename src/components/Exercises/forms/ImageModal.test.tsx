import { ImageFormModal } from "@/components/Exercises/forms/ImageModal";
import { ImageFormData } from "@/components/Exercises/models/exercise";
import { ImageStyle } from "@/components/Exercises/models/image";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const emptyImage: ImageFormData = {
    url: "",
    file: undefined,
    author: "",
    authorUrl: "",
    title: "",
    objectUrl: "",
    derivativeSourceUrl: "",
    style: ImageStyle.PHOTO,
    isAi: false,
};

const editingImage: ImageFormData = {
    ...emptyImage,
    url: "https://example.com/squat.jpg",
    title: "An existing image",
};

describe("ImageFormModal", () => {
    beforeEach(() => {
        // jsdom doesn't define URL.createObjectURL; the dropzone calls it after picking a file
        if (!URL.createObjectURL) {
            URL.createObjectURL = vi.fn(() => "blob://mock");
        } else {
            vi.spyOn(URL, "createObjectURL").mockReturnValue("blob://mock");
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("does not render when image is null", () => {
        render(
            <ImageFormModal open={true} onClose={vi.fn()} image={null} onSubmit={vi.fn()} submitLabel="Add" />
        );
        expect(screen.queryByText("exercises.imageDetails")).not.toBeInTheDocument();
    });

    test("renders the dropzone placeholder when image has no URL", () => {
        render(
            <ImageFormModal open={true} onClose={vi.fn()} image={emptyImage} onSubmit={vi.fn()} submitLabel="Add" />
        );
        expect(screen.getByText("exercises.dropOrClickImage")).toBeInTheDocument();
        const dropzone = screen.getByTestId("image-dropzone");
        expect(dropzone.querySelector("img")).toBeNull();
    });

    test("renders the preview image when image.url is set", () => {
        render(
            <ImageFormModal open={true} onClose={vi.fn()} image={editingImage} onSubmit={vi.fn()} submitLabel="Save" />
        );
        const dropzone = screen.getByTestId("image-dropzone");
        const img = dropzone.querySelector("img");
        expect(img).not.toBeNull();
        expect(img!.src).toContain("https://example.com/squat.jpg");
        expect(screen.queryByText("exercises.dropOrClickImage")).not.toBeInTheDocument();
    });

    test("submit is disabled until an image is present", async () => {
        const user = userEvent.setup();
        render(
            <ImageFormModal open={true} onClose={vi.fn()} image={emptyImage} onSubmit={vi.fn()} submitLabel="Add" />
        );
        const submit = screen.getByTestId("submit-edit-image-form");
        expect(submit).toBeDisabled();

        const fileInput = screen.getByTestId("image-dropzone-input") as HTMLInputElement;
        const file = new File([new Uint8Array([1, 2, 3])], "img.png", { type: "image/png" });
        await user.upload(fileInput, file);

        expect(submit).not.toBeDisabled();
        expect(screen.getByTestId("image-dropzone").querySelector("img")).not.toBeNull();
    });

    test("submitting the form passes the picked file, license fields and AI flag", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(
            <ImageFormModal open={true} onClose={vi.fn()} image={emptyImage} onSubmit={onSubmit} submitLabel="Add" />
        );

        // Pick a file via the dropzone's hidden input
        const fileInput = screen.getByTestId("image-dropzone-input") as HTMLInputElement;
        const file = new File([new Uint8Array([1, 2, 3])], "img.png", { type: "image/png" });
        await user.upload(fileInput, file);

        // Toggle the AI checkbox
        await user.click(screen.getByTestId("image-is-ai-checkbox"));

        // Submit
        await user.click(screen.getByTestId("submit-edit-image-form"));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        const submittedValues = onSubmit.mock.calls[0][0] as ImageFormData;
        expect(submittedValues.file).toBe(file);
        expect(submittedValues.url).toBe("blob://mock");
        expect(submittedValues.isAi).toBe(true);
    });

    test("clicking the backdrop calls onClose", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <ImageFormModal open={true} onClose={onClose} image={editingImage} onSubmit={vi.fn()} submitLabel="Save" />
        );
        const backdrop = document.querySelector(".MuiBackdrop-root");
        expect(backdrop).not.toBeNull();
        await user.click(backdrop!);
        expect(onClose).toHaveBeenCalled();
    });

    test("non-image files are ignored by the dropzone", async () => {
        const user = userEvent.setup();
        render(
            <ImageFormModal open={true} onClose={vi.fn()} image={emptyImage} onSubmit={vi.fn()} submitLabel="Add" />
        );
        const fileInput = screen.getByTestId("image-dropzone-input") as HTMLInputElement;
        const notAnImage = new File(["hello"], "notes.txt", { type: "text/plain" });
        await user.upload(fileInput, notAnImage);

        // Dropzone still shows the placeholder, submit still disabled
        expect(screen.getByText("exercises.dropOrClickImage")).toBeInTheDocument();
        expect(screen.getByTestId("submit-edit-image-form")).toBeDisabled();
    });
});

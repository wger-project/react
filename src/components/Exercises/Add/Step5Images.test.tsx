import {
    exerciseSubmissionInitialState,
    ExerciseSubmissionStateContext
} from "@/components/Exercises/Add/state/exerciseSubmissionState";
import { Step5Images } from "@/components/Exercises/Add/Step5Images";
import { ImageFormData } from "@/components/Exercises/models/exercise";
import { ImageStyle } from "@/components/Exercises/models/image";
import { testQueryClient } from "@/tests/queryClient";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

const mockOnContinue = vi.fn();
const mockOnBack = vi.fn();

const initialImage: ImageFormData = {
    url: "blob://existing-image",
    file: new File([new Uint8Array([1, 2, 3])], "existing.png", { type: "image/png" }),
    author: "alice",
    authorUrl: "",
    title: "An existing image",
    derivativeSourceUrl: "",
    objectUrl: "",
    style: ImageStyle.PHOTO,
};

function renderStep(initialImages: ImageFormData[] = []) {
    const queryClient = new QueryClient();
    const dispatch = vi.fn();
    const state = { ...exerciseSubmissionInitialState, images: initialImages };
    render(
        <QueryClientProvider client={queryClient}>
            <ExerciseSubmissionStateContext.Provider value={[state, dispatch]}>
                <Step5Images onContinue={mockOnContinue} onBack={mockOnBack} />
            </ExerciseSubmissionStateContext.Provider>
        </QueryClientProvider>
    );
    return { dispatch };
}

describe("Test the add exercise step 5 component", () => {
    beforeEach(() => {
        // jsdom doesn't define URL.createObjectURL; the file-upload handler relies on it
        if (!URL.createObjectURL) {
            URL.createObjectURL = vi.fn(() => "blob://mock");
        } else {
            vi.spyOn(URL, "createObjectURL").mockReturnValue("blob://mock");
        }
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    test("renders the upload prompt and continue/back buttons", () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <Step5Images onContinue={mockOnContinue} onBack={mockOnBack} />
            </QueryClientProvider>
        );

        expect(screen.getByText("exercises.compatibleImagesCC")).toBeInTheDocument();
        expect(screen.getByText("forms.supportedImageFormats")).toBeInTheDocument();
        expect(screen.getByText("continue")).toBeInTheDocument();
        expect(screen.getByText("goBack")).toBeInTheDocument();
    });

    test("clicking continue calls onContinue", async () => {
        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("continue"));
        expect(mockOnContinue).toHaveBeenCalled();
    });

    test("clicking goBack calls onBack", async () => {
        const user = userEvent.setup();
        renderStep();

        await user.click(screen.getByText("goBack"));
        expect(mockOnBack).toHaveBeenCalled();
    });

    test("renders existing images from state with their title and author", () => {
        renderStep([initialImage]);

        expect(screen.getByText("An existing image")).toBeInTheDocument();
        expect(screen.getByText("alice")).toBeInTheDocument();
        // The img has alt="" so it's decorative and not in the a11y tree;
        // grab it by tag and check the src.
        const imgs = document.querySelectorAll("img");
        const matching = Array.from(imgs).find(i => i.src.includes(initialImage.url));
        expect(matching).toBeDefined();
    });

    test("uploading a file opens the image modal with the upload's title field", async () => {
        const user = userEvent.setup();
        renderStep();

        // Both inputs (camera + gallery) are display:none. We grab them by id.
        const fileInput = document.getElementById("image-input") as HTMLInputElement;
        expect(fileInput).not.toBeNull();

        const file = new File([new Uint8Array([4, 5, 6])], "new.png", { type: "image/png" });
        await user.upload(fileInput, file);

        // The modal title is rendered when an image is selected
        expect(await screen.findByText("exercises.imageDetails")).toBeInTheDocument();
    });

    test("file input with no file selected does nothing", async () => {
        renderStep();

        const fileInput = document.getElementById("image-input") as HTMLInputElement;

        // Manually fire a change event with no files (`userEvent.upload` requires a file).
        // Reset target.files to empty to exercise the early-return branch.
        Object.defineProperty(fileInput, "files", {
            value: [],
            configurable: true,
        });
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));

        // The modal heading should not appear
        expect(screen.queryByText("exercises.imageDetails")).not.toBeInTheDocument();
    });
});

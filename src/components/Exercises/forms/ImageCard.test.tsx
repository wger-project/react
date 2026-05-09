import { AddImageCard } from "@/components/Exercises/forms/ImageCard";
import { useAddExerciseImageQuery } from "@/components/Exercises/queries";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from 'vitest';

vi.mock("@/components/Exercises/queries");

describe("AddImageCard", () => {
    beforeEach(() => {
        (useAddExerciseImageQuery as Mock).mockImplementation(() => ({
            mutate: vi.fn(),
            isError: false,
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    test("clicking 'Add' opens the image modal", async () => {
        const user = userEvent.setup();
        render(<AddImageCard exerciseId={42} />);

        expect(screen.queryByText("exercises.imageDetails")).not.toBeInTheDocument();

        await user.click(screen.getByText("add"));

        expect(await screen.findByText("exercises.imageDetails")).toBeInTheDocument();
    });
});

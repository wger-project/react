import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { Step5Images } from "@/components/Exercises/Add/Step5Images";
import React from "react";
import { testQueryClient } from "@/tests/queryClient";


const mockOnContinue = vi.fn();
const mockOnBack = vi.fn();

describe("Test the add exercise step 5 component", () => {

    test("Smoketest", () => {
        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <Step5Images
                    onContinue={mockOnContinue}
                    onBack={mockOnBack}
                />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByText('exercises.compatibleImagesCC')).toBeInTheDocument();
    });

});

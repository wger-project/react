import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddExerciseStepper } from "@/components/Exercises/screens/Add/AddExerciseStepper";

vi.mock("@/components/Exercises/api/category");
vi.mock("@/components/Exercises/api/equipment");
vi.mock("@/components/Exercises/api/exercise");
vi.mock("@/components/Exercises/api/language");
vi.mock("@/components/Exercises/api/muscles");
vi.mock("@/components/User/api/profile");

describe("Test the add-exercise stepper component", () => {


    test("Renders without crashing", () => {
        // Act
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <AddExerciseStepper />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByText("exercises.step1HeaderBasics")).toBeInTheDocument();
        expect(screen.getByText("exercises.variations")).toBeInTheDocument();
        expect(screen.getByText("description")).toBeInTheDocument();
        expect(screen.getByText("translation")).toBeInTheDocument();
        expect(screen.getByText("images")).toBeInTheDocument();
        expect(screen.getByText("overview")).toBeInTheDocument();
    });
});

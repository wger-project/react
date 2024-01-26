import { render, screen } from "@testing-library/react";
import { OverviewCard } from "components/Exercises/Detail/OverviewCard";
import { Category } from "components/Exercises/models/category";
import { Equipment } from "components/Exercises/models/equipment";
import { Exercise } from "components/Exercises/models/exercise";
import { Language } from "components/Exercises/models/language";
import { Translation } from "components/Exercises/models/translation";
import React from "react";
import { BrowserRouter } from "react-router-dom";

describe("Test the exercise overview card component", () => {
    // Arrange
    const exerciseTranslation1 = new Translation(
        111,
        "583281c7-2362-48e7-95d5-8fd6c455e0fb",
        "Squats",
        "Do a squat",
        2
    );
    const exerciseTranslation2 = new Translation(
        9,
        "dae6f6ed-9408-4e62-a59a-1a33f4e8ab36",
        "Kniebeuge",
        "Kniebeuge machen",
        1
    );
    const category = new Category(10, "Abs");
    const equipment1 = new Equipment(10, "Kettlebell");
    const equipment2 = new Equipment(1, "Test 123");
    const exerciseBase = new Exercise(
        345,
        "c788d643-150a-4ac7-97ef-84643c6419bf",
        category,
        [equipment1, equipment2],
        [],
        [],
        [],
        null,
        [exerciseTranslation1, exerciseTranslation2]
    );

    test("Render the overview card, no language selected -> use english", () => {
        // Act
        // since  OverviewCard renders a Link, we need to wrap in a BrowserRouter
        render(
            <BrowserRouter>
                <OverviewCard exerciseBase={exerciseBase} />
            </BrowserRouter>
        );

        // Assert
        expect(screen.getByText("Squats")).toBeInTheDocument();
        expect(screen.getByText("server.abs")).toBeInTheDocument();
        expect(screen.getByText("server.kettlebell")).toBeInTheDocument();
        expect(screen.getByText("server.test_123")).toBeInTheDocument();
    });

    test("Render the overview card with an existing translation", async () => {
        // Arrange
        const language = new Language(1, "de", "Deutsch");

        // Act
        // since  OverviewCard renders a Link, we need to wrap in a BrowserRouter
        render(
            <BrowserRouter>
                <OverviewCard exerciseBase={exerciseBase} language={language} />
            </BrowserRouter>
        );

        // Assert
        expect(screen.queryByText("Squats")).not.toBeInTheDocument();
        expect(screen.getByText("Kniebeuge")).toBeInTheDocument();

        expect(screen.getByText("server.abs")).toBeInTheDocument();
        expect(screen.getByText("server.kettlebell")).toBeInTheDocument();
        expect(screen.getByText("server.test_123")).toBeInTheDocument();
    });

    test("Render the overview card with a non existing translation -> fallback to english", async () => {
        // Arrange
        const language = new Language(3, "fr", "Français");

        // Act
        // since  OverviewCard renders a Link, we need to wrap in a BrowserRouter
        render(
            <BrowserRouter>
                <OverviewCard exerciseBase={exerciseBase} language={language} />
            </BrowserRouter>
        );

        // Assert
        expect(screen.queryByText("Kniebeuge")).not.toBeInTheDocument();
        expect(screen.getByText("Squats")).toBeInTheDocument();
        expect(screen.getByText("server.abs")).toBeInTheDocument();
        expect(screen.getByText("server.kettlebell")).toBeInTheDocument();
        expect(screen.getByText("server.test_123")).toBeInTheDocument();
    });
});

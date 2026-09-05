import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { RouteErrorBoundary } from "./PageErrorBoundary";

const FailedPage = () => {
    throw new Error("Request failed with status code 403");
};

describe("RouteErrorBoundary", () => {
    test("shows an informative message when a page fails to render", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);

        render(
            <MemoryRouter>
                <RouteErrorBoundary>
                    <FailedPage />
                </RouteErrorBoundary>
            </MemoryRouter>
        );

        expect(screen.getByText("Unable to load this page")).toBeInTheDocument();
        expect(screen.getByText("Request failed with status code 403")).toBeInTheDocument();
    });
});

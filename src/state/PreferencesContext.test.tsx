// PreferencesContext.test.tsx
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { PreferencesProvider, usePreferences } from "./PreferencesContext";

// Helper component to consume context
const TestComponent: React.FC = () => {
    const prefs = usePreferences();
    return (
        <div>
            <span data-testid="showTraining">{prefs.showTraining ? "true" : "false"}</span>
            <button onClick={() => prefs.setShowTraining(false)}>Hide Training</button>
            <button onClick={() => prefs.setShowTraining(true)}>Show Training</button>
        </div>
    );
};

describe("PreferencesContext", () => {
    it("provides default values", () => {
        render(
            <PreferencesProvider>
                <TestComponent />
            </PreferencesProvider>
        );
        expect(screen.getByTestId("showTraining").textContent).toBe("true");
    });

    it("updates values with setter", () => {
        render(
            <PreferencesProvider>
                <TestComponent />
            </PreferencesProvider>
        );

        const hideButton = screen.getByText("Hide Training");
        const showButton = screen.getByText("Show Training");

        act(() => {
            hideButton.click();
        });
        expect(screen.getByTestId("showTraining").textContent).toBe("false");

        act(() => {
            showButton.click();
        });

        expect(screen.getByTestId("showTraining").textContent).toBe("true");
    });

    it("throws error if usePreferences used outside provider", () => {
        const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(() => render(<TestComponent />)).toThrow("usePreferences must be used within PreferencesProvider");
        consoleError.mockRestore();
    });

    it("toggles submenu correctly when main menu is hidden and restored", () => {
        const SubmenuTest: React.FC = () => {
            const prefs = usePreferences();
            return (
                <div>
                    <span data-testid="routine">{prefs.showRoutineOverview ? "true" : "false"}</span>
                    <button onClick={() => prefs.setShowTraining(false)}>Hide Training</button>
                    <button onClick={() => prefs.setShowTraining(true)}>Show Training</button>
                </div>
            );
        };

        render(
            <PreferencesProvider>
                <SubmenuTest />
            </PreferencesProvider>
        );

        const hideButton = screen.getByText("Hide Training");
        const showButton = screen.getByText("Show Training");

        act(() => {
            hideButton.click();
        });
        expect(screen.getByTestId("routine").textContent).toBe("false");

        act(() => {
            showButton.click();
        });
        expect(screen.getByTestId("routine").textContent).toBe("true");
    });
});

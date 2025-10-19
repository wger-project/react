// Preferences.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PreferencesProvider } from "state/PreferencesContext";
import { Preferences } from ".";

const renderWithProvider = (ui: React.ReactElement) => render(<PreferencesProvider>{ui}</PreferencesProvider>);

const getSwitchByLabel = (label: string) => {
    const listItem = screen.getByText(label).closest("li");
    if (!listItem) throw new Error(`No list item found for label: ${label}`);
    const input = listItem.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (!input) throw new Error(`No input found for label: ${label}`);
    return input;
};

// Using test doubles (mocks/stubs/fakes)
describe("Preferences component", () => {
    it("renders all submenu switches with correct default values", () => {
        renderWithProvider(<Preferences />);

        expect(getSwitchByLabel("Show Training").checked).toBe(true);
        expect(getSwitchByLabel("Show Body Weight").checked).toBe(true);
        expect(getSwitchByLabel("Show Measurements").checked).toBe(true);
        expect(getSwitchByLabel("Show Nutrition").checked).toBe(true);

        expect(getSwitchByLabel("Routine overview").checked).toBe(true);
        expect(getSwitchByLabel("Private template").checked).toBe(true);
        expect(getSwitchByLabel("Public template").checked).toBe(true);
        expect(getSwitchByLabel("Exercise overview").checked).toBe(true);
        expect(getSwitchByLabel("Contribute exercise").checked).toBe(true);
        expect(getSwitchByLabel("Calendar").checked).toBe(true);
    });

    it("toggles a main submenu switch", () => {
        renderWithProvider(<Preferences />);
        const trainingSwitch = getSwitchByLabel("Show Training");

        fireEvent.click(trainingSwitch);
        expect(trainingSwitch.checked).toBe(false);

        fireEvent.click(trainingSwitch);
        expect(trainingSwitch.checked).toBe(true);
    });

    it("toggles a training submenu switch", () => {
        renderWithProvider(<Preferences />);
        const routineSwitch = getSwitchByLabel("Routine overview");

        fireEvent.click(routineSwitch);
        expect(routineSwitch.checked).toBe(false);

        fireEvent.click(routineSwitch);
        expect(routineSwitch.checked).toBe(true);
    });

    it("prevents hiding last visible main submenu", () => {
        renderWithProvider(<Preferences />);

        const trainingSwitch = getSwitchByLabel("Show Training");
        const bodyWeightSwitch = getSwitchByLabel("Show Body Weight");
        const measurementsSwitch = getSwitchByLabel("Show Measurements");
        const nutritionSwitch = getSwitchByLabel("Show Nutrition");

        // Hide 3 of 4 menus
        fireEvent.click(bodyWeightSwitch);
        fireEvent.click(measurementsSwitch);
        fireEvent.click(nutritionSwitch);

        const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
        fireEvent.click(trainingSwitch); // should be blocked

        expect(trainingSwitch.checked).toBe(true);
        expect(alertMock).toHaveBeenCalledWith("At least one item must remain visible.");
        alertMock.mockRestore();
    });

    it("restores training submenu switches when main menu toggled", () => {
        renderWithProvider(<Preferences />);

        const trainingSwitch = getSwitchByLabel("Show Training");
        const routineSwitch = getSwitchByLabel("Routine overview");

        // Turn off a training submenu
        fireEvent.click(routineSwitch);
        expect(routineSwitch.checked).toBe(false);

        // Turn off main menu
        fireEvent.click(trainingSwitch);
        expect(trainingSwitch.checked).toBe(false);
        expect(routineSwitch.checked).toBe(false);

        // Turn main menu back on, should restore previous submenu state
        fireEvent.click(trainingSwitch);
        expect(trainingSwitch.checked).toBe(true);
        expect(routineSwitch.checked).toBe(false); // restored to previous state
    });
});

//Profiling
test("renders all submenu switches with correct default values", () => {
    const t0 = performance.now();

    renderWithProvider(<Preferences />);

    const t1 = performance.now();
    console.log("Render time:", t1 - t0, "ms");

    // rest of your test assertions
    expect(getSwitchByLabel("Show Training")).toBeInTheDocument();
    expect(getSwitchByLabel("Show Training")).toBeChecked();
    expect(getSwitchByLabel("Show Body Weight")).toBeChecked();
});

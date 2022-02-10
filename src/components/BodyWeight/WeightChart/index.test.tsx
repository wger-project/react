import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeightChart } from "./index";
import { WeightStateProvider } from 'state';
import { WeightEntry } from "components/BodyWeight/model";

describe("Test BodyWeight component", () => {
    test('renders without crashing', async () => {

        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 90, 2),
        ];

        // Act
        render(<WeightStateProvider><WeightChart weights={weightData} /></WeightStateProvider>);

        // Renders without crashing
    });

    test('errors get handled', () => {

        // Arrange
        const weightData: WeightEntry[] = [];

        // Act
        render(<WeightStateProvider><WeightChart weights={weightData} /></WeightStateProvider>);

        // Assert
        // No weights are found in the document
        const linkElement = screen.queryByText("80");
        expect(linkElement).toBeNull();

        const linkElement2 = screen.queryByText("90");
        expect(linkElement2).toBeNull();
    });
});

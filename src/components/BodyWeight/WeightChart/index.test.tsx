import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { WeightEntry } from "components/BodyWeight/model";
import React from 'react';
import { testQueryClient } from "tests/queryClient";
import { WeightChart } from "./index";

const { ResizeObserver } = window;

// See https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
beforeEach(() => {
    // @ts-ignore
    delete window.ResizeObserver;
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
    }));
});

afterEach(() => {
    window.ResizeObserver = ResizeObserver;
    jest.restoreAllMocks();
});


describe("Test BodyWeight component", () => {
    test('renders without crashing', async () => {

        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 90, 2),
        ];

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Renders without crashing
    });

    test('errors get handled', () => {

        // Arrange
        const weightData: WeightEntry[] = [];

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart weights={weightData} />
            </QueryClientProvider>
        );

        // Assert
        // No weights are found in the document
        const linkElement = screen.queryByText("80");
        expect(linkElement).toBeNull();

        const linkElement2 = screen.queryByText("90");
        expect(linkElement2).toBeNull();
    });
});

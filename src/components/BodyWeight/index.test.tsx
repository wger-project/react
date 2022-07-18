import React from 'react';
import { render, screen } from '@testing-library/react';
import { getWeights } from "services";
import { BodyWeight } from "./index";
import { WeightStateProvider } from 'state';
import { WeightEntry } from "components/BodyWeight/model";

const { ResizeObserver } = window;

jest.mock("services");
console.log = jest.fn();

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

        // @ts-ignore
        getWeights.mockImplementation(() => Promise.resolve(weightData));

        // Act
        render(<WeightStateProvider><BodyWeight /></WeightStateProvider>);

        // Assert
        expect(getWeights).toHaveBeenCalledTimes(1);

        // Both weights are found in th document
        const textElement = await screen.findByText("80");
        expect(textElement).toBeInTheDocument();

        const textElement2 = await screen.findByText("90");
        expect(textElement2).toBeInTheDocument();
    });

    test('errors get handled', () => {

        // Arrange
        // @ts-ignore
        getWeights.mockImplementation(() => {
            throw new Error('User not found');
        });

        // Act
        render(<WeightStateProvider><BodyWeight /></WeightStateProvider>);

        // Assert
        expect(getWeights).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledTimes(1);

        // No weights are found in th document
        const linkElement = screen.queryByText("80");
        expect(linkElement).toBeNull();

        const linkElement2 = screen.queryByText("90");
        expect(linkElement2).toBeNull();
    });
});

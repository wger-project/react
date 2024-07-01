import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { WeightEntry } from "components/BodyWeight/model";
import { getWeights } from "services";
import { testQueryClient } from "tests/queryClient";
import { BodyWeight } from "./index";

const { ResizeObserver } = window;

jest.mock("services");
console.log = jest.fn();


describe("Test BodyWeight component", () => {

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

    test('renders without crashing', async () => {

        // Arrange
        const weightData = [
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 90, 2),
        ];

        // @ts-ignore
        getWeights.mockImplementation(() => Promise.resolve(weightData));

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <BodyWeight />
            </QueryClientProvider>
        );

        // Assert
        expect(getWeights).toHaveBeenCalledTimes(1);

        // Both weights are found in th document
        const textElement = await screen.findByText("80");
        expect(textElement).toBeInTheDocument();

        const textElement2 = await screen.findByText("90");
        expect(textElement2).toBeInTheDocument();
    });
});

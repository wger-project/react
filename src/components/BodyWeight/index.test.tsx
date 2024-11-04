import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent } from '@testing-library/react';
import { WeightEntry } from "components/BodyWeight/model";
import { getWeights } from "services";
import { testQueryClient } from "tests/queryClient";
import { BodyWeight } from "./index";
import axios from "axios";
import { FilterType } from "./widgets/FilterButtons";

const { ResizeObserver } = window;

jest.mock('axios')
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

    // Arrange
    const weightData = [
        new WeightEntry(new Date('2021-12-10'), 80, 1),
        new WeightEntry(new Date('2021-12-20'), 90, 2),
    ];

    test('renders without crashing', async () => {

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


    test('changes filter and updates displayed data', async () => {

        // Mock the getWeights response based on the filter
        // @ts-ignore
        getWeights.mockImplementation((filter: FilterType) => {
            if (filter === 'lastYear') {
                return Promise.resolve(weightData);
            } else if (filter === 'lastMonth') {
                return Promise.resolve([]); 
            }
            return Promise.resolve([]);
        });
    
        render(
            <QueryClientProvider client={testQueryClient}>
                <BodyWeight />
            </QueryClientProvider>
        );
    
        // Initially should display data for last year
        expect(await screen.findByText("80")).toBeInTheDocument();
        expect(await screen.findByText("90")).toBeInTheDocument();
    
        // Change filter to 'lastMonth'
        const filterButton = screen.getByRole('button', { name: /Last Month/i });
        fireEvent.click(filterButton);
    
        // Expect getWeights to be called with 'lastMonth'
        expect(getWeights).toHaveBeenCalledWith('lastMonth');
    
        // Check that entries for last year are no longer in the document
        expect(screen.queryByText("80")).not.toBeInTheDocument();
        expect(screen.queryByText("90")).not.toBeInTheDocument();
    });
    

});

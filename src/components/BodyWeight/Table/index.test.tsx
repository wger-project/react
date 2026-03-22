import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { WeightEntry } from "components/BodyWeight/model";
import { BrowserRouter } from "react-router-dom";
import { testQueryClient } from "tests/queryClient";
import { WeightTable } from './index';

describe("Body weight test", () => {
    test('renders without crashing', async () => {

        const weightsData: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 80, 1),
            new WeightEntry(new Date('2021/12/20'), 90, 2),
        ];

        // since I used context api to provide state, also need it here
        render(
            <BrowserRouter>
                <QueryClientProvider client={testQueryClient}>
                    <WeightTable weights={weightsData} />
                </QueryClientProvider>
            </BrowserRouter>
        );


        // Both weights are found in th document
        const weightRow = await screen.findByText('80');
        expect(weightRow).toBeInTheDocument();

        const weightRow2 = await screen.findByText("90");
        expect(weightRow2).toBeInTheDocument();
    });

    test('displays total change column correctly', async () => {
        const weightsData: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 80, 1),
            new WeightEntry(new Date('2021/12/20'), 90, 2),
            new WeightEntry(new Date('2021/12/25'), 85, 3),
        ];

        render(
            <BrowserRouter>
                <QueryClientProvider client={testQueryClient}>
                    <WeightTable weights={weightsData} />
                </QueryClientProvider>
            </BrowserRouter>
        );

    // Wait for the table to load
        await screen.findByText('80');

        // Find all rows in the table
        const rows = screen.getAllByRole('row');
        
        // Skip header row (index 0), then check each data row
        // Row 1: totalChange is in the 4th column (index 3) and should be 0
        const firstRowCells = rows[1].querySelectorAll('td');
        expect(firstRowCells[3]).toHaveTextContent('0');
        
        // Row 2: totalChange should be 10
        const secondRowCells = rows[2].querySelectorAll('td');
        expect(secondRowCells[3]).toHaveTextContent('10');
        
        // Row 3: totalChange should be 5
        const thirdRowCells = rows[3].querySelectorAll('td');
        expect(thirdRowCells[3]).toHaveTextContent('5');
    });
});

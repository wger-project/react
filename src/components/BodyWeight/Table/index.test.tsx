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
});

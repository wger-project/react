import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeightTable } from './index';
import { WeightEntry } from "components/BodyWeight/model";

describe("Body weight test", () => {
    test('renders without crashing', async () => {

        const weightsData: WeightEntry[] = [
            new WeightEntry(new Date('2021/12/10'), 80, 1),
            new WeightEntry(new Date('2021/12/20'), 90, 2),
        ];

        const fetchNewWeights = () => {
            return weightsData;
        };

        // since I used context api to provide state, also need it here
        render(<WeightTable fetchNewWeights={fetchNewWeights} weights={weightsData}/>);

        // Both weights are found in th document
        const weightRow = await screen.findByText('80');
        expect(weightRow).toBeInTheDocument();

        const weightRow2 = await screen.findByText("90");
        expect(weightRow2).toBeInTheDocument();
    });
});

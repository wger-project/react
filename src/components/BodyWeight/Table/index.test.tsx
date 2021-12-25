import React from 'react';
import {render, screen} from '@testing-library/react';
import { WeightTable } from './index';
import { BodyWeightType } from 'types';

describe("Body weight test", () => {
    test('renders without crashing', async () => {

        const weightsData: BodyWeightType[] = [
            {id: 1, weight: '80', date: '2021/12/10'},
            {id: 2, weight: '90', date: '2021/11/20'},
        ];
    
        // since I used context api to provide state, also need it here
        render(<WeightTable weights={weightsData} />);
        
        // Both weights are found in th document
        const weightRow = await screen.findByText('80');
        expect(weightRow).toBeInTheDocument();
    
        const weightRow2 = await screen.findByText("90");
        expect(weightRow2).toBeInTheDocument();
    });
});

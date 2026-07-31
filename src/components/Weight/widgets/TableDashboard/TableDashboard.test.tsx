import { MeasurementEntry } from "@/components/Measurements";
import { makeWeightEntry } from "@/tests/weight/testData";
import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeightTableDashboard } from '@/components/Weight/widgets/TableDashboard/TableDashboard';

describe("Body weight test", () => {
    test('renders without crashing', async () => {

        const weightsData: MeasurementEntry[] = [
            makeWeightEntry(new Date('2021/12/10'), 80, { id: 'd-1' }),
            makeWeightEntry(new Date('2021/12/20'), 90, { id: 'd-2' }),
        ];

        // since I used context api to provide state, also need it here
        render(<WeightTableDashboard weights={weightsData} unit="kg" categoryUnit="kg" />);

        // Both weights are found in th document
        const weightRow = await screen.findByText('80');
        expect(weightRow).toBeInTheDocument();

        const weightRow2 = await screen.findByText("90");
        expect(weightRow2).toBeInTheDocument();
    });

    test('converts entries stored in other units to the display unit', async () => {

        const weightsData: MeasurementEntry[] = [
            makeWeightEntry(new Date('2021/12/10'), 80, { id: 'd-1', unit: 'kg' }),
            makeWeightEntry(new Date('2021/12/20'), 90, { id: 'd-2', unit: 'lb' }),
        ];

        render(<WeightTableDashboard weights={weightsData} unit="kg" categoryUnit="kg" />);

        expect(await screen.findByText('80')).toBeInTheDocument();
        expect(await screen.findByText('40.82')).toBeInTheDocument();
    });
});

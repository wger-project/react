import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { SlotEntryDetails } from 'components/WorkoutRoutines/Detail/SlotDetails';
import { Slot } from 'components/WorkoutRoutines/models/Slot';
import { SlotConfig } from "components/WorkoutRoutines/models/SlotConfig";
import React from 'react';
import { testQueryClient } from "tests/queryClient";

describe('SlotDetails Component', () => {

    const slotConfig = new SlotConfig(1, 2, 3, 4, 5, 6, 7, 8, 'test', 'normal',);
    const testSlot = new Slot(1, 2, 3, '', [slotConfig]);

    test('renders only sets, weight, and reps fields in simpleMode', () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SlotEntryDetails slot={testSlot} routineId={1} simpleMode={true} />
            </QueryClientProvider>
        );

        expect(screen.getByTestId('sets-field')).toBeInTheDocument();
        expect(screen.getByTestId('sets-field')).toBeInTheDocument();
        expect(screen.getByTestId('weight-field')).toBeInTheDocument();
        expect(screen.getByTestId('reps-field')).toBeInTheDocument();

        // Assert that other config fields are NOT rendered
        expect(screen.queryByTestId('max-weight-field')).not.toBeInTheDocument();
        expect(screen.queryByTestId('max-reps-field')).not.toBeInTheDocument();
        expect(screen.queryByTestId('rir-field')).not.toBeInTheDocument();
        expect(screen.queryByTestId('rest-field')).not.toBeInTheDocument();
        expect(screen.queryByTestId('max-rest-field')).not.toBeInTheDocument();
    });

    test('renders all config fields when not in simpleMode', () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SlotEntryDetails slot={testSlot} routineId={1} simpleMode={false} />
            </QueryClientProvider>
        );

        // Assert that all config fields are rendered
        expect(screen.getByTestId('sets-field')).toBeInTheDocument();
        expect(screen.getByTestId('weight-field')).toBeInTheDocument();
        expect(screen.getByTestId('max-weight-field')).toBeInTheDocument();
        expect(screen.getByTestId('reps-field')).toBeInTheDocument();
        expect(screen.getByTestId('max-reps-field')).toBeInTheDocument();
        expect(screen.getByTestId('rest-field')).toBeInTheDocument();
        expect(screen.getByTestId('max-rest-field')).toBeInTheDocument();
    });
});
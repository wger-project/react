import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    useAddMeasurementCategoryQuery,
    useCategoryEntryFlagsQuery,
    useMeasurementsCategoryQuery
} from "@/components/Measurements/queries";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { NewCategoryPicker } from "@/components/Measurements/widgets/MetricPicker";
import React from 'react';
import { TEST_MEASUREMENT_CATEGORY_1 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';
import { MemoryRouter, useLocation } from "react-router-dom";

vi.mock("@/components/Measurements/api/bodyWeight");

vi.mock("@/components/Measurements/queries");

/** Renders where the picker navigated to */
const LocationDisplay = () => <div data-testid="location">{useLocation().pathname}</div>;

describe("Test the NewCategoryPicker component", () => {
    const queryClient = new QueryClient();
    let mutate = vi.fn();

    beforeEach(() => {
        mutate = vi.fn();

        (useAddMeasurementCategoryQuery as Mock).mockImplementation(() => ({ mutate: mutate }));
        // read by the form the custom entry leads into
        (useCategoryEntryFlagsQuery as Mock).mockImplementation(() => ({ data: [] }));
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            data: [TEST_MEASUREMENT_CATEGORY_1]
        }));
    });

    const renderPicker = (closeFn?: () => void) => render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/en/measurement/']}>
                <NewCategoryPicker closeFn={closeFn} />
                <LocationDisplay />
            </MemoryRouter>
        </QueryClientProvider>
    );

    test('Neither body weight nor the components are offered', () => {
        // Body weight is the server's category and a component comes with its
        // group, so neither is something to start here

        // Act
        renderPicker();

        // Assert
        expect(screen.getByText('measurements.metricTypes.blood_pressure')).toBeInTheDocument();
        expect(screen.queryByText('measurements.metricTypes.body_weight')).toBeNull();
        expect(screen.queryByText('measurements.metricTypes.blood_pressure_systolic')).toBeNull();
        expect(screen.queryByText('measurements.metricTypes.sleep_deep')).toBeNull();
    });

    test('Picking a metric creates the category with the name and unit of its type', async () => {
        // Arrange
        const user = userEvent.setup();
        const closeFn = vi.fn();

        // Act
        renderPicker(closeFn);
        await user.click(screen.getByText('measurements.metricTypes.resting_heart_rate'));

        // Assert
        expect(mutate).toHaveBeenCalledWith(new MeasurementCategory(
            null,
            'Resting heart rate',
            'bpm',
            'resting_heart_rate',
        ), expect.anything());
    });

    test('The new category is opened once the server created it', async () => {
        // Arrange: react-query hands the created category to onSuccess
        const user = userEvent.setup();
        const closeFn = vi.fn();
        const created = new MeasurementCategory(
            'cccccccc-cccc-cccc-cccc-000000000099',
            'Distance',
            'km',
            'distance',
        );
        mutate.mockImplementation((_category, options) => options.onSuccess(created));

        // Act
        renderPicker(closeFn);
        await user.click(screen.getByText('measurements.metricTypes.distance'));

        // Assert
        expect(closeFn).toHaveBeenCalled();
        expect(screen.getByTestId('location')).toHaveTextContent(
            `/measurement/category/${created.id}`
        );
    });

    test('A metric that already has a category cannot be picked again', () => {
        // Arrange
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            data: [MeasurementCategory.clone(TEST_MEASUREMENT_CATEGORY_1, {
                metricType: 'heart_rate',
            })]
        }));

        // Act
        renderPicker();

        // Assert
        expect(screen.getByText('measurements.metricAlreadyTracked')).toBeInTheDocument();
        expect(screen.getByText('measurements.metricTypes.heart_rate').closest('[role="button"]'))
            .toHaveAttribute('aria-disabled', 'true');
    });

    test('A custom measurement leads into the form', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        renderPicker();
        await user.click(screen.getByText('measurements.customMeasurement'));

        // Assert
        expect(await screen.findByLabelText('name')).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });
});

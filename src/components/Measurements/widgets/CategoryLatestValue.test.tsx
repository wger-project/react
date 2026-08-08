import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { useLatestMeasurementEntriesQuery } from "@/components/Measurements/queries";
import {
    CategoryLatestValue,
    latestHeadline
} from "@/components/Measurements/widgets/CategoryLatestValue";
import React from 'react';
import { getTestQueryClient } from "@/tests/queryClient";
import { TEST_MEASUREMENT_CATEGORY_1 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries");

const entryFor = (categoryId: string, value: number, date: Date) =>
    new MeasurementEntry('11111111-1111-4111-8111-111111111111', categoryId, date, value, '');

const bloodPressureGroup = () => {
    const group = new MeasurementCategory('bp', 'Blood pressure', 'mmHg', 'blood_pressure');
    group.children = [
        new MeasurementCategory('sys', 'Systolic', 'mmHg', 'blood_pressure_systolic'),
        new MeasurementCategory('dia', 'Diastolic', 'mmHg', 'blood_pressure_diastolic'),
    ];
    return group;
};

const sleepGroup = () => {
    const group = new MeasurementCategory('sleep', 'Sleep', 'min', 'sleep');
    group.children = [
        new MeasurementCategory('total', 'Total sleep', 'min', 'sleep_total'),
        new MeasurementCategory('deep', 'Deep sleep', 'min', 'sleep_deep'),
    ];
    return group;
};

describe('latestHeadline', () => {

    test('a leaf reads as its newest entry', () => {
        const entries = [entryFor(TEST_MEASUREMENT_CATEGORY_1.id!, 42.5, new Date(2026, 7, 1))];

        expect(latestHeadline(TEST_MEASUREMENT_CATEGORY_1, entries, 'de')).toBe('42,5 cm');
    });

    test('a paired two-component reading is quoted high over low', () => {
        const date = new Date(2026, 7, 1, 8, 0);
        const entries = [
            entryFor('sys', 130, date),
            entryFor('dia', 82, date),
        ];

        expect(latestHeadline(bloodPressureGroup(), entries, 'de')).toBe('130/82 mmHg');
    });

    test('an unpaired half-reading shows no value', () => {
        const entries = [
            entryFor('sys', 130, new Date(2026, 7, 2, 8, 0)),
            entryFor('dia', 82, new Date(2026, 7, 1, 8, 0)),
        ];

        expect(latestHeadline(bloodPressureGroup(), entries, 'de')).toBeNull();
    });

    test('a group with a roll-up component reads as that component', () => {
        const date = new Date(2026, 7, 1);
        const entries = [
            entryFor('deep', 95, date),
            entryFor('total', 432, date),
        ];

        expect(latestHeadline(sleepGroup(), entries, 'de')).toBe('7:12 h');
    });
});

describe("Test the CategoryLatestValue component", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = (category: MeasurementCategory) => render(
        <QueryClientProvider client={getTestQueryClient()}>
            <CategoryLatestValue category={category} />
        </QueryClientProvider>
    );

    test('shows the newest value with how long ago it was measured', () => {

        // Arrange - measured today, so the phrasing holds in any test locale
        (useLatestMeasurementEntriesQuery as Mock).mockImplementation(() => ({
            data: [entryFor(TEST_MEASUREMENT_CATEGORY_1.id!, 42.5, new Date())]
        }));

        // Act
        renderComponent(TEST_MEASUREMENT_CATEGORY_1);

        // Assert - the decimal separator follows the runtime locale
        expect(useLatestMeasurementEntriesQuery).toHaveBeenCalledWith([TEST_MEASUREMENT_CATEGORY_1.id]);
        expect(screen.getByText(/42[.,]5 cm/)).toBeInTheDocument();
        expect(screen.getByText(/heute|today/i)).toBeInTheDocument();
    });

    test('a group asks for its components', () => {

        // Arrange - unpaired halves: the time still shows, a value would lie
        (useLatestMeasurementEntriesQuery as Mock).mockImplementation(() => ({
            data: [
                entryFor('sys', 130, new Date()),
                entryFor('dia', 82, new Date(2026, 6, 1)),
            ]
        }));

        // Act
        renderComponent(bloodPressureGroup());

        // Assert
        expect(useLatestMeasurementEntriesQuery).toHaveBeenCalledWith(['sys', 'dia']);
        expect(screen.queryByText(/mmHg/)).toBeNull();
        expect(screen.getByText(/heute|today/i)).toBeInTheDocument();
    });

    test('a group with a roll-up component asks for it alone', () => {

        // Arrange - the sibling stages can hold several rows per day, so the
        // roll-up is queried by itself
        (useLatestMeasurementEntriesQuery as Mock).mockImplementation(() => ({
            data: [entryFor('total', 432, new Date())]
        }));

        // Act
        renderComponent(sleepGroup());

        // Assert
        expect(useLatestMeasurementEntriesQuery).toHaveBeenCalledWith(['total']);
        expect(screen.getByText('7:12 h')).toBeInTheDocument();
    });

    test('renders nothing while there are no entries', () => {

        // Arrange
        (useLatestMeasurementEntriesQuery as Mock).mockImplementation(() => ({ data: [] }));

        // Act
        const { container } = renderComponent(TEST_MEASUREMENT_CATEGORY_1);

        // Assert
        expect(container).toBeEmptyDOMElement();
    });
});

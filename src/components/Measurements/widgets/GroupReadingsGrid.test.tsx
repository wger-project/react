import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { groupReadingPage } from "@/components/Measurements/charts/data";
import { useGroupReadingsQuery } from "@/components/Measurements/queries";
import { GroupReadingsGrid } from "@/components/Measurements/widgets/GroupReadingsGrid";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { getTestQueryClient } from "@/tests/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from 'react';
import { MemoryRouter } from "react-router-dom";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries");

const bloodPressure = () => {
    const group = new MeasurementCategory('g-1', 'Blood pressure', 'mmHg', 'blood_pressure');
    group.children = [
        new MeasurementCategory('c-sys', 'Systolic', 'mmHg', 'blood_pressure_systolic', false, 'g-1', 0),
        new MeasurementCategory('c-dia', 'Diastolic', 'mmHg', 'blood_pressure_diastolic', false, 'g-1', 1),
    ];
    return group;
};

const reading = (date: Date, high: number, low: number) => [
    new MeasurementEntry('e-sys', 'c-sys', date, high, ''),
    new MeasurementEntry('e-dia', 'c-dia', date, low, ''),
];

/** A full page of readings, the systolic value counting down from [high] */
const fullPage = (high: number) => Array.from(
    { length: PAGINATION_OPTIONS.pageSize },
    (_, index) => reading(new Date(2023, 1, 20 - index, 8, 0), high - index, 70),
).flat();

const fetchNextPage = vi.fn().mockResolvedValue({ data: [] });

/** The hook hands over the readings already cut into pages */
const mockPages = (pages: MeasurementEntry[][], hasNextPage: boolean = false) =>
    (useGroupReadingsQuery as Mock).mockImplementation(() => ({
        data: pages.map(entries => groupReadingPage(
            bloodPressure(),
            entries,
            PAGINATION_OPTIONS.pageSize,
            false,
        )),
        hasNextPage: hasNextPage,
        fetchNextPage: fetchNextPage,
        isFetching: false,
    }));

const renderGrid = () => render(
    <QueryClientProvider client={getTestQueryClient()}>
        <MemoryRouter>
            <GroupReadingsGrid group={bloodPressure()} range="lastMonth" />
        </MemoryRouter>
    </QueryClientProvider>
);

describe('GroupReadingsGrid', () => {

    afterEach(() => vi.restoreAllMocks());

    test('lists one row per reading, one column per component', () => {
        mockPages([[
            ...reading(new Date(2023, 1, 2, 8, 0), 130, 90),
            ...reading(new Date(2023, 1, 1, 8, 0), 120, 80),
        ]]);

        renderGrid();

        expect(screen.getAllByRole('row')).toHaveLength(3); // header plus two readings
        expect(screen.getByRole('gridcell', { name: '130 mmHg' })).toBeInTheDocument();
        expect(screen.getByRole('gridcell', { name: '90 mmHg' })).toBeInTheDocument();
        expect(screen.getByRole('gridcell', { name: '120 mmHg' })).toBeInTheDocument();
        expect(screen.getByRole('gridcell', { name: '80 mmHg' })).toBeInTheDocument();
    });

    test('the column headers lead to the component screens', () => {
        mockPages([reading(new Date(2023, 1, 1, 8, 0), 120, 80)]);

        renderGrid();

        // A typed category is named after its metric type, whose key the test
        // translator hands back untranslated
        expect(screen.getByRole('link', { name: /blood_pressure_systolic/ }))
            .toHaveAttribute('href', expect.stringContaining('c-sys'));
        expect(screen.getByRole('link', { name: /blood_pressure_diastolic/ }))
            .toHaveAttribute('href', expect.stringContaining('c-dia'));
    });

    test('the readings are shown, not edited: one row is several entries', async () => {
        mockPages([reading(new Date(2023, 1, 1, 8, 0), 120, 80)]);

        renderGrid();
        await userEvent.dblClick(screen.getByRole('gridcell', { name: '120 mmHg' }));

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });

    test('the next page shows other readings than the one before it', async () => {
        // A full page and a shorter one after it, which is where the chain ends
        mockPages([fullPage(200), [...reading(new Date(2023, 1, 2, 8, 0), 118, 70)]]);

        renderGrid();
        await userEvent.click(screen.getByRole('button', { name: /next page/i }));

        expect(screen.getByRole('gridcell', { name: '118 mmHg' })).toBeInTheDocument();
        expect(screen.queryByRole('gridcell', { name: '200 mmHg' })).not.toBeInTheDocument();
    });

    test('a page that is not there yet is fetched before it is shown', async () => {
        mockPages([fullPage(200)], true);

        renderGrid();
        await userEvent.click(screen.getByRole('button', { name: /next page/i }));

        expect(fetchNextPage).toHaveBeenCalled();
        // The fetch came back without the page, so the table kept its rows
        expect(screen.getByRole('gridcell', { name: '200 mmHg' })).toBeInTheDocument();
    });
});

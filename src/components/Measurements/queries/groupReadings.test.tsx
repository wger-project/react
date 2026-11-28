import { getGroupEntryPage } from "@/components/Measurements/api/measurements";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { useGroupReadingsQuery } from "@/components/Measurements/queries";
import { getTestQueryClient } from "@/tests/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from '@testing-library/react';
import React from "react";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/api/measurements");

const group = () => {
    const bloodPressure = new MeasurementCategory('g-1', 'Blood pressure', 'mmHg', 'blood_pressure');
    bloodPressure.children = [
        new MeasurementCategory('c-sys', 'Systolic', 'mmHg', 'blood_pressure_systolic', false, 'g-1', 0),
        new MeasurementCategory('c-dia', 'Diastolic', 'mmHg', 'blood_pressure_diastolic', false, 'g-1', 1),
    ];
    return bloodPressure;
};

/** A day's reading, as the two entries it is stored as */
const reading = (day: number) => [
    new MeasurementEntry('e-sys', 'c-sys', new Date(2023, 1, day, 8, 0), 120 + day, ''),
    new MeasurementEntry('e-dia', 'c-dia', new Date(2023, 1, day, 8, 0), 80 + day, ''),
];

const renderReadings = (pageSize: number) => {
    const client = getTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    // Spread rather than returned: the query result tracks which fields are
    // read during a render and only re-renders on those, and a bare hook reads
    // none of them. The widget reads them by rendering with them.
    return renderHook(() => ({ ...useGroupReadingsQuery(group(), pageSize) }), { wrapper });
};

describe("useGroupReadingsQuery", () => {

    beforeEach(() => vi.clearAllMocks());

    test('cuts the readings into pages and reports there is more', async () => {
        // Three readings' worth of entries for a page of two, i.e. the server
        // had more than the page holds
        (getGroupEntryPage as Mock).mockResolvedValue({
            entries: [...reading(9), ...reading(8), ...reading(7)],
            truncated: true,
        });

        const { result } = renderReadings(2);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data![0].readings.map(r => r.date)).toEqual([
            new Date(2023, 1, 9, 8, 0),
            new Date(2023, 1, 8, 8, 0),
        ]);
        expect(result.current.hasNextPage).toBe(true);
    });

    /**
     * A two-page history, answered by the cursor it is asked for rather than
     * by call order, so a repeated read cannot shift the pages.
     */
    const mockChain = () => (getGroupEntryPage as Mock).mockImplementation(
        (_ids: string[], _limit: number, before?: Date) => Promise.resolve(before === undefined
            ? { entries: [...reading(9), ...reading(8)], truncated: true }
            : { entries: [...reading(7), ...reading(6)], truncated: false })
    );

    test('the next page starts below the oldest reading of the one before it', async () => {
        mockChain();

        const { result } = renderReadings(1);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        await result.current.fetchNextPage();

        // The cursor is the oldest reading the first page kept, not the oldest
        // one it read: page 0 dropped the 8th as possibly half-read
        expect((getGroupEntryPage as Mock).mock.calls[1][2]).toEqual(new Date(2023, 1, 9, 8, 0));
    });

    test('a second page holds other readings than the first', async () => {
        mockChain();

        const { result } = renderReadings(1);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        await result.current.fetchNextPage();
        await waitFor(() => expect(result.current.data).toHaveLength(2));

        const dates = result.current.data!.map(page => page.readings[0].date);
        expect(dates).toEqual([new Date(2023, 1, 9, 8, 0), new Date(2023, 1, 7, 8, 0)]);
    });

    test('asks for a page plus the reading it is cut at', async () => {
        (getGroupEntryPage as Mock).mockResolvedValue({ entries: [], truncated: false });

        const { result } = renderReadings(10);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // (10 + 1) readings times the two components
        expect((getGroupEntryPage as Mock).mock.calls[0][1]).toBe(22);
    });
});

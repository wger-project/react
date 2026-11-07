import { ChartRange } from "@/components/Measurements/charts/range";
import { useRangePagination } from "@/components/Measurements/widgets/useRangePagination";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { act, renderHook } from '@testing-library/react';

describe('useRangePagination', () => {

    test('a range switch starts over at the first page', () => {
        const { result, rerender } = renderHook(
            ({ range }: { range: ChartRange }) => useRangePagination(range),
            { initialProps: { range: 'lastMonth' as ChartRange } }
        );
        expect(result.current[0]).toEqual({ page: 0, pageSize: PAGINATION_OPTIONS.pageSize });

        act(() => result.current[1](model => ({ ...model, page: 7 })));
        expect(result.current[0].page).toBe(7);

        rerender({ range: 'lastWeek' });
        expect(result.current[0].page).toBe(0);
        expect(result.current[0].pageSize).toBe(PAGINATION_OPTIONS.pageSize);
    });

    test('a rerender with the same range keeps the page', () => {
        const { result, rerender } = renderHook(
            ({ range }: { range: ChartRange }) => useRangePagination(range),
            { initialProps: { range: 'lastMonth' as ChartRange } }
        );
        act(() => result.current[1](model => ({ ...model, page: 3 })));

        rerender({ range: 'lastMonth' });

        expect(result.current[0].page).toBe(3);
    });
});

import { useEffect, useRef, useState } from "react";

/** Radius of a dot on a chart with room to spare */
export const MAX_DOT_RADIUS = 4;

/** Smallest dot that is still visible */
const MIN_DOT_RADIUS = 0.5;

/**
 * Widest a single bar gets, for charts with only a handful of entries.
 *
 * Unlike the dots, the width of a bar does not have to be computed: recharts
 * sizes bars to the band of the axis, which already is the available width
 * divided by how many bars share it. Only the upper bound is ours.
 */
export const MAX_BAR_WIDTH = 12;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Radius of the dots of a series with the given number of points.
 *
 * Mark size is in pixels, so it has to follow from how many marks share the
 * available space: fixed sizes look fine on demo data and turn a season of
 * readings into a solid block. Before the chart has been measured the width is
 * 0 and the marks start out at their largest.
 */
export const dotRadius = (availableWidth: number, markCount: number): number =>
    availableWidth <= 0 || markCount <= 0
        ? MAX_DOT_RADIUS
        : clamp(availableWidth / markCount / 2, MIN_DOT_RADIUS, MAX_DOT_RADIUS);

/**
 * The current width of the element the returned ref is put on, 0 until it has
 * been measured. Charts need it to size their marks.
 */
export const useChartWidth = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (element === null) {
            return;
        }

        const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return [ref, width] as const;
};

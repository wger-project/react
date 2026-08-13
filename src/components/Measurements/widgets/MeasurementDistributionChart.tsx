import { Box, Typography, useTheme } from "@mui/material";
import { buildHistogram, ValueCount } from "@/components/Measurements/charts/data";
import { valueOnly, valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartEmptyState } from "@/components/Measurements/widgets/ChartEmptyState";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Histogram of how often each value occurred: the values of the selected range
 * binned by size, with the median and the newest value marked.
 *
 * The one chart of the set without a time axis. It answers what is normal and
 * what is an outlier, which no chart over time shows, and the marked newest
 * value places today within that. Plain elements rather than recharts, whose
 * bar chart cannot place a marker line at an exact value on a band axis.
 */
export const MeasurementDistributionChart = (props: {
    values: ValueCount[],
    latest: number,
    unit: string,
    binWidth?: number,
    countsAreDays?: boolean,
}) => {
    const [t, i18n] = useTranslation();
    const theme = useTheme();
    const [selected, setSelected] = React.useState<number | null>(null);

    if (props.values.length === 0) {
        return <ChartEmptyState />;
    }

    const histogram = buildHistogram(props.values, props.latest, props.binWidth);
    const bins = histogram.counts.length;
    const maxCount = Math.max(...histogram.counts);
    const lowerEdgeOf = (bin: number): number => histogram.firstEdge + bin * histogram.binWidth;

    // A pick from before the data changed (a tap, then a range switch) could
    // point past the histogram, so it is dropped rather than read out of range
    const activeBin = selected !== null && selected < bins ? selected : null;

    /** Horizontal position of a value on the axis the bins tile, in percent */
    const positionOf = (value: number): string =>
        `${((value - histogram.firstEdge) / (bins * histogram.binWidth) * 100).toFixed(2)}%`;

    // The read-out line above the bars: the hovered bin as its range and
    // count, or the median and newest value while nothing is hovered, coloured
    // like their marker lines so the numbers say what the lines only place
    const readout = activeBin === null
        ? <>
            <Box component="span" sx={{ color: theme.palette.info.main }}>
                {t('measurements.distributionMedian')}
                : {valueWithUnit(histogram.median, props.unit, i18n.language)}
            </Box>
            {' · '}
            <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                {t('measurements.distributionLatest')}
                : {valueWithUnit(histogram.latest, props.unit, i18n.language)}
            </Box>
        </>
        : `${valueOnly(lowerEdgeOf(activeBin), props.unit, i18n.language)}`
        + `-${valueWithUnit(lowerEdgeOf(activeBin + 1), props.unit, i18n.language)}: `
        + t(
            props.countsAreDays
                ? 'measurements.distributionDayCount'
                : 'measurements.distributionEntryCount',
            { count: histogram.counts[activeBin] },
        );

    // Every k-th bin edge, labelled with its value: the edges are the round
    // numbers the bins were aligned to, so they are the natural ticks
    const labelEvery = Math.max(1, Math.ceil(bins / 4));
    const edgeLabels: number[] = [];
    for (let edge = 0; edge <= bins; edge += labelEvery) {
        edgeLabels.push(edge);
    }

    const markerStyle = {
        bottom: 0,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        width: '2px',
    } as const;

    return <Box sx={{ width: '90%' }}>
        <Typography variant="body2" sx={{ minHeight: '1.5em' }}>{readout}</Typography>
        <Box
            role="img"
            aria-label={t('measurements.chartTypes.distribution')}
            sx={{ height: 180, position: 'relative' }}>
            <Box sx={{
                alignItems: 'end',
                display: 'grid',
                gap: '1px',
                gridTemplateColumns: `repeat(${bins}, 1fr)`,
                height: '100%',
            }}>
                {/* The whole column takes the hover, so an empty bin can be read too */}
                {histogram.counts.map((count, bin) => <Box
                    key={lowerEdgeOf(bin)}
                    onMouseEnter={() => setSelected(bin)}
                    onMouseLeave={() => setSelected(null)}
                    sx={{ alignItems: 'flex-end', display: 'flex', height: '100%' }}>
                    <Box sx={{
                        backgroundColor: theme.palette.primary.main,
                        height: `${count / maxCount * 100}%`,
                        outline: bin === activeBin
                            ? `1px solid ${theme.palette.text.primary}`
                            : 'none',
                        width: '100%',
                    }} />
                </Box>)}
            </Box>
            {/* The markers sit at the exact value, not on a bin */}
            <Box sx={{
                ...markerStyle,
                backgroundColor: theme.palette.info.main,
                left: positionOf(histogram.median),
            }} />
            <Box sx={{
                ...markerStyle,
                backgroundColor: theme.palette.secondary.main,
                left: positionOf(histogram.latest),
            }} />
        </Box>
        <Box sx={{ height: '1.2em', position: 'relative' }}>
            {edgeLabels.map(edge => <Typography
                key={edge}
                sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                    left: positionOf(lowerEdgeOf(edge)),
                    position: 'absolute',
                    // The first and last labels stay inside the chart instead
                    // of being centred on its edge
                    transform: edge === 0
                        ? 'none'
                        : edge === bins ? 'translateX(-100%)' : 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                }}>
                {valueOnly(lowerEdgeOf(edge), props.unit, i18n.language)}
            </Typography>)}
        </Box>
    </Box>;
};

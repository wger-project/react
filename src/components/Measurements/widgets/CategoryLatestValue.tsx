import { Stack, Typography } from "@mui/material";
import { valueOnly, valueWithUnit } from "@/components/Measurements/charts/format";
import { isGroupTotalMetricType, MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { useLatestMeasurementEntriesQuery } from "@/components/Measurements/queries";
import { dateToRelative } from "@/core/lib/date";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * The value the newest entries of a category read as, null when they don't
 * read as one.
 *
 * A leaf is its newest entry. A group with a roll-up component (total sleep)
 * is that component's newest value. A two-component group whose newest
 * entries share a timestamp is that reading, quoted high over low the way a
 * blood pressure is written; an unpaired half would read as a whole reading,
 * so it shows nothing.
 */
export const latestHeadline = (
    category: MeasurementCategory,
    entries: MeasurementEntry[],
    locale: string,
): string | null => {
    const valueOf = (entry: MeasurementEntry) => entry.valueIn(category.unit, category.unit);

    if (!category.isGroup) {
        return valueWithUnit(valueOf(entries[0]), category.unit, locale);
    }

    const total = category.children.find(child => isGroupTotalMetricType(child.metricType));
    if (total !== undefined) {
        const entry = entries.find(e => e.category === total.id);
        return entry === undefined ? null : valueWithUnit(valueOf(entry), category.unit, locale);
    }

    if (category.children.length === 2
        && entries.length === 2
        && entries[0].date.getTime() === entries[1].date.getTime()) {
        const values = entries.map(valueOf);
        return `${valueOnly(Math.max(...values), category.unit, locale)}/`
            + valueWithUnit(Math.min(...values), category.unit, locale);
    }

    return null;
};

/**
 * The category's newest value and how long ago it was measured, for a card
 * header.
 *
 * The time stands on its own where the entries don't read as one value, and
 * for a category the health sync feeds only every now and then it is what
 * says an old-looking chart is not a broken one.
 */
export const CategoryLatestValue = ({ category }: { category: MeasurementCategory }) => {
    const [, i18n] = useTranslation();
    // A group with a roll-up component asks for that component alone: its
    // siblings can hold several rows per day (raw sleep segments), so the
    // newest-entries window across all of them may miss the roll-up.
    const total = category.children.find(child => isGroupTotalMetricType(child.metricType));
    const ids = total !== undefined
        ? [total.id!]
        : category.isGroup
            ? category.children.map(child => child.id!)
            : [category.id!];
    const query = useLatestMeasurementEntriesQuery(ids);
    const entries = query.data ?? [];

    if (entries.length === 0) {
        return null;
    }
    const headline = latestHeadline(category, entries, i18n.language);

    return (
        <Stack sx={{ alignItems: 'flex-end', px: 1 }}>
            {headline !== null && <Typography variant="h6" component="span">{headline}</Typography>}
            <Typography variant="caption" color="text.secondary">
                {dateToRelative(entries[0].date, i18n.language)}
            </Typography>
        </Stack>
    );
};

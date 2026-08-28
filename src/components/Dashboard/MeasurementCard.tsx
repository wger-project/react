import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { DashboardCard } from "@/components/Dashboard/DashboardCard";
import { EmptyCard } from "@/components/Dashboard/EmptyCard";
import {
    categoryDisplayName,
    CategoryForm,
    componentColor,
    componentPalette,
    chartQueryFor,
    DEFAULT_CHART_RANGE,
    groupChart,
    groupComponentPoints,
    MeasurementCategory,
    MeasurementChart,
    useLatestMeasurementEntriesQuery,
    useMeasurementBucketsQuery,
    useMeasurementEntriesQuery,
    useMeasurementsCategoryQuery,
    valueWithUnit
} from "@/components/Measurements";
import i18n from "@/i18n";
import { makeLink, WgerLink } from "@/core/lib/url";
import { Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";


/** Entries the table under each chart lists, at most */
const TABLE_ROWS = 5;

export const MeasurementCard = () => {
    const { t } = useTranslation();
    const categoryQuery = useMeasurementsCategoryQuery();

    if (categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    // The categories endpoint always returns an array, a new user simply gets an empty one
    return !categoryQuery.data?.length
        ? <EmptyCard
            title={t("measurements.measurements")}
            modalContent={<CategoryForm />}
            modalTitle={t("add")} />
        : <MeasurementCardContent categories={categoryQuery.data!} />;
};

const MeasurementCardContent = (props: { categories: MeasurementCategory[] }) => {
    const { t } = useTranslation();

    return (<>
        <DashboardCard
            title={t("measurements.measurements")}
            actions={
                <>
                    <Button
                        size="small"
                        href={makeLink(WgerLink.MEASUREMENT_OVERVIEW, i18n.language)}
                    >
                        {t("seeDetails")}
                    </Button>
                </>
            }
        >
            <CategoryCarousel categories={props.categories} />
        </DashboardCard>
    </>);
};


/**
 * The categories side by side, one at a time.
 *
 * Snap points do the paging, so a swipe always comes to rest on a category
 * rather than between two of them.
 */
const CategoryCarousel = (props: { categories: MeasurementCategory[] }) => {
    const { t } = useTranslation();
    const strip = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState(0);

    return (<>
        <Box
            ref={strip}
            onScroll={event => setCurrent(Math.round(
                event.currentTarget.scrollLeft / event.currentTarget.clientWidth
            ))}
            sx={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                // the dots are the visible position indicator
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            {props.categories.map(category =>
                <Box
                    key={category.id}
                    sx={{ flex: '0 0 100%', minWidth: 0, scrollSnapAlign: 'start' }}
                >
                    <MeasurementCardTableContent category={category} />
                </Box>
            )}
        </Box>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 1 }}>
            {props.categories.map((category, index) =>
                <Box
                    component="button"
                    key={category.id}
                    aria-current={index === current}
                    aria-label={categoryDisplayName(category, t)}
                    onClick={() => strip.current?.scrollTo({
                        left: index * strip.current.clientWidth,
                        behavior: 'smooth',
                    })}
                    sx={{
                        backgroundColor: index === current ? 'primary.main' : 'action.disabled',
                        border: 0,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        height: 10,
                        p: 0,
                        width: 10,
                    }}
                />
            )}
        </Stack>
    </>);
};


/**
 * One component of a group, with its latest reading.
 *
 * The dot ties the row to the component's line in the chart above, and is
 * left out where the chart draws something else than one line per component.
 */
const ComponentRow = (props: { component: MeasurementCategory, unit: string, color?: string }) => {
    const { t } = useTranslation();
    // The same read the category headers use, so the newest value of a
    // category is cached once rather than under a key per caller
    const latest = useLatestMeasurementEntriesQuery([props.component.id!]).data?.[0];

    return <TableRow>
        <TableCell>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {props.color !== undefined && <Box sx={{
                    backgroundColor: props.color,
                    borderRadius: '50%',
                    height: 12,
                    width: 12,
                }} />}
                <span>{categoryDisplayName(props.component, t)}</span>
            </Stack>
        </TableCell>
        <TableCell>
            {latest !== undefined
                ? valueWithUnit(latest.valueIn(props.unit, props.unit), props.unit, i18n.language)
                : '—'}
        </TableCell>
    </TableRow>;
};

const MeasurementCardTableContent = (props: { category: MeasurementCategory }) => {
    const { t } = useTranslation();

    // The dot ties a component row to its line in the chart above. A range is
    // a single bar, where the ends speak for themselves. The same derivation
    // the chart uses, so both decide over one span and one cached request.
    const { ids, level, filters } = chartQueryFor(props.category, DEFAULT_CHART_RANGE);
    const buckets = useMeasurementBucketsQuery(
        ids,
        level,
        filters,
        props.category.isGroup,
    ).data ?? [];
    const showComponentColors = props.category.isGroup
        && groupChart(props.category, groupComponentPoints(props.category, buckets)).kind
        === 'components';
    const palette = componentPalette(props.category.children.length);
    // A group lists its components instead, each of which reads its own
    const entries = useMeasurementEntriesQuery(
        props.category.id!,
        {},
        TABLE_ROWS,
        !props.category.isGroup,
    ).data ?? [];

    return (<>
        <Typography variant="h6" gutterBottom>
            {categoryDisplayName(props.category, t)}
        </Typography>
        <MeasurementChart category={props.category} />
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>{props.category.isGroup ? t('name') : t('date')}</TableCell>
                    <TableCell>{t('value')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.category.isGroup
                    // group parents hold no entries themselves, list the
                    // latest reading of each component instead
                    ? props.category.children.map((child, index) =>
                        <ComponentRow
                            key={`measurement-child-${child.id}`}
                            component={child}
                            unit={child.unit || props.category.unit}
                            color={showComponentColors ? componentColor(palette, index) : undefined} />)
                    : entries.map(entry => (
                        <TableRow key={`measurement-entry-${entry.id}`}>
                            <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                            <TableCell>
                                {valueWithUnit(
                                    entry.valueIn(props.category.unit, props.category.unit),
                                    props.category.unit,
                                    i18n.language,
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    </>);
};
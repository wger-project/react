import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { DashboardCard } from "@/components/Dashboard/DashboardCard";
import { EmptyCard } from "@/components/Dashboard/EmptyCard";
import {
    CategoryForm,
    componentColor,
    componentPalette,
    chartQueryFor,
    DEFAULT_CHART_RANGE,
    entryFilterFor,
    groupChart,
    groupComponentPoints,
    MeasurementCategory,
    MeasurementChart,
    useMeasurementBucketsQuery,
    useMeasurementsCategoryQuery,
    valueWithUnit
} from "@/components/Measurements";
import i18n from "@/i18n";
import { makeLink, WgerLink } from "@/core/lib/url";
import "slick-carousel/slick/slick.css";
import { Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick-theme.css";


export const MeasurementCard = () => {
    const { t } = useTranslation();
    // A year, like the body weight card next to it: the chart below covers
    // three months, the table under it wants the latest entries of a category
    // that may be measured only every few months. Fetching the full history
    // instead is what a synced account pays for, the sleep stages alone write
    // five entries a night
    const categoryQuery = useMeasurementsCategoryQuery({
        filtersetQueryEntries: entryFilterFor('lastYear'),
    });

    if (categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return categoryQuery.data === null
        ? <EmptyCard
            title={t("measurements.measurements")}
            modalContent={<CategoryForm />}
            modalTitle={t("add")} />
        : <MeasurementCardContent categories={categoryQuery.data!} />;
};

const MeasurementCardContent = (props: { categories: MeasurementCategory[] }) => {
    const { t } = useTranslation();

    // TODO: is there a better solution for this?
    // Workaround for react-slick import issue where it returns a module object
    // instead of the component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SlickSlider = (Slider as any).default ?? Slider;

    const settings: Settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
    };

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
            <div className="slider-container">
                <SlickSlider {...settings}>
                    {props.categories.map(c => <MeasurementCardTableContent key={c.id} category={c} />)}
                </SlickSlider>
            </div>
        </DashboardCard>
    </>);
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

    return (<>
        <Typography variant="h6" gutterBottom>
            {props.category.name}
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
                    ? props.category.children.map((child, index) => {
                        // entries arrive sorted by date descending
                        const latest = child.entries[0];
                        const unit = child.unit || props.category.unit;

                        return <TableRow key={`measurement-child-${child.id}`}>
                            <TableCell>
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                    {showComponentColors && <Box sx={{
                                        backgroundColor: componentColor(palette, index),
                                        borderRadius: '50%',
                                        height: 12,
                                        width: 12,
                                    }} />}
                                    <span>{child.name}</span>
                                </Stack>
                            </TableCell>
                            <TableCell>
                                {latest !== undefined
                                    ? valueWithUnit(latest.valueIn(unit, unit), unit, i18n.language)
                                    : '—'}
                            </TableCell>
                        </TableRow>;
                    })
                    : [...props.category.entries].slice(0, 5).map(entry => (
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
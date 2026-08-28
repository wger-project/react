import React from "react";
import {
    Box,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardHeader,
    IconButton,
    Stack,
    Tooltip,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import { useTranslation } from "react-i18next";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { useMeasurementsCategoryQuery } from "@/components/Measurements/queries";
import { categoryDisplayName, MeasurementCategory } from "@/components/Measurements/models/Category";
import { CategoryLatestValue } from "@/components/Measurements/widgets/CategoryLatestValue";
import { ChartRange } from "@/components/Measurements/charts/range";
import { setChartRange, useChartRange } from "@/components/Measurements/state/chartRange";
import { ChartRangeSelector } from "@/components/Measurements/widgets/ChartRangeSelector";
import { MeasurementChart } from "@/components/Measurements/widgets/MeasurementChart";
import { OverviewEmpty } from "@/core/ui/Widgets/OverviewEmpty";
import { AddMeasurementCategoryFab } from "@/components/Measurements/widgets/fab";
import { WgerContainerFullWidth } from "@/core/ui/Widgets/Container";
import { makeLink, WgerLink } from "@/core/lib/url";
import { Link } from "react-router-dom";
import { CategoryReorderList } from "@/components/Measurements/widgets/CategoryReorderList";
import {
    CalculationBadge,
    calculationSourceId,
    CalculationSource
} from "@/components/Measurements/widgets/CalculationMark";
import { EntryForm, GroupEntryForm } from "@/components/Measurements/widgets/EntryForm";
import { WgerModal } from "@/core/ui/Modals/WgerModal";


export const CategoryList = (props: {
    category: MeasurementCategory,
    range: ChartRange,
    /** Name of the category a calculated one reads, see CalculationSource */
    sourceName?: string,
}) => {

    const [t, i18n] = useTranslation();
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    return <>
        {/* The whole card is the way into the category; only the quick-add
          * button below stays a control of its own */}
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea
                component={Link}
                to={makeLink(WgerLink.MEASUREMENT_DETAIL, i18n.language, { id: props.category.id! })}>
                {/* The unit rides on the value; a category still without one
                  * shows it on its chart axis instead */}
                <CardHeader
                    title={<>
                        {categoryDisplayName(props.category, t)}
                        {' '}
                        <CalculationBadge category={props.category} />
                    </>}
                    subheader={<CalculationSource
                        category={props.category}
                        sourceName={props.sourceName}
                    />}
                    action={<CategoryLatestValue category={props.category} />}
                />
                <CardContent>
                    <MeasurementChart category={props.category} range={props.range} />
                </CardContent>
            </CardActionArea>
            {/* mt: auto pins the action row, so it aligns across a grid row of
              * cards with differently sized charts */}
            {/* The entries of a calculated category are the server's, adding
              * one by hand is refused */}
            <CardActions disableSpacing sx={{ justifyContent: "flex-end", mt: 'auto' }}>
                {!props.category.isCalculated && <IconButton onClick={handleOpenModal} aria-label={t('add')}>
                    <AddIcon />
                </IconButton>}
            </CardActions>
        </Card>
        <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal}>
            {props.category.isGroup
                ? <GroupEntryForm closeFn={handleCloseModal} group={props.category} />
                : <EntryForm closeFn={handleCloseModal} category={props.category} />}
        </WgerModal>
    </>;
};

export const MeasurementCategoryOverview = () => {
    const [t] = useTranslation();
    const [openReorderModal, setOpenReorderModal] = React.useState(false);
    // One range for all cards, shared with the other measurement screens:
    // picking it per card would put a row of buttons on every one of them
    const range = useChartRange();
    const categoryQuery = useMeasurementsCategoryQuery();

    return categoryQuery.isLoading
        ? <LoadingPlaceholder />
        : <>
            <WgerContainerFullWidth
                title={t("measurements.measurements")}
                optionsMenu={
                    <Tooltip title={t('measurements.reorderCategories')}>
                        <IconButton onClick={() => setOpenReorderModal(true)}>
                            <SortIcon />
                        </IconButton>
                    </Tooltip>
                }
                fab={<AddMeasurementCategoryFab isLoading={categoryQuery.isFetching} />}
            >
                <Stack spacing={2}>
                    {categoryQuery.data!.length === 0 && <OverviewEmpty />}
                    {categoryQuery.data!.length > 0
                        && <ChartRangeSelector value={range} onChange={setChartRange} />}
                    {/* min() keeps the column from forcing a horizontal scroll
                      * on screens narrower than one card */}
                    <Box sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))',
                    }}>
                        {categoryQuery.data!.map(c =>
                            <CategoryList
                                category={c}
                                key={c.id}
                                range={range}
                                sourceName={categoryQuery.data!.find(
                                    candidate => candidate.id === calculationSourceId(c)
                                )?.name}
                            />)}
                    </Box>
                </Stack>
            </WgerContainerFullWidth>
            <WgerModal
                title={t('measurements.reorderCategories')}
                isOpen={openReorderModal}
                closeFn={() => setOpenReorderModal(false)}>
                <CategoryReorderList categories={categoryQuery.data!} />
            </WgerModal>
        </>;
};

import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Stack, Tooltip, } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import { useTranslation } from "react-i18next";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { useMeasurementsCategoryQuery } from "@/components/Measurements/queries";
import { categoryDisplayName, MeasurementCategory } from "@/components/Measurements/models/Category";
import { ChartRange, DEFAULT_CHART_RANGE, entryFilterFor } from "@/components/Measurements/charts/range";
import { ChartRangeSelector } from "@/components/Measurements/widgets/ChartRangeSelector";
import { MeasurementChart } from "@/components/Measurements/widgets/MeasurementChart";
import { OverviewEmpty } from "@/core/ui/Widgets/OverviewEmpty";
import { AddMeasurementCategoryFab } from "@/components/Measurements/widgets/fab";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import { makeLink, WgerLink } from "@/core/lib/url";
import { Link } from "react-router-dom";
import { CategoryReorderList } from "@/components/Measurements/widgets/CategoryReorderList";
import { EntryForm, GroupEntryForm } from "@/components/Measurements/widgets/EntryForm";
import { WgerModal } from "@/core/ui/Modals/WgerModal";


export const CategoryList = (props: { category: MeasurementCategory, range: ChartRange }) => {

    const [t, i18n] = useTranslation();
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    return <>
        <Card>
            <CardHeader title={categoryDisplayName(props.category, t)} subheader={props.category.unit} />
            <CardContent>
                <MeasurementChart category={props.category} range={props.range} />
            </CardContent>
            <CardActions disableSpacing sx={{ justifyContent: "space-between" }}>
                <Button size="small">
                    <Link to={makeLink(WgerLink.MEASUREMENT_DETAIL, i18n.language, { id: props.category.id! })}>
                        {t("seeDetails")}
                    </Link>
                </Button>

                <IconButton onClick={handleOpenModal}>
                    <AddIcon />
                </IconButton>
            </CardActions>
        </Card>
        <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal}>
            {props.category.isGroup
                ? <GroupEntryForm closeFn={handleCloseModal} group={props.category} />
                : <EntryForm closeFn={handleCloseModal} categoryId={props.category.id!} />}
        </WgerModal>
    </>;
};

export const MeasurementCategoryOverview = () => {
    const [t] = useTranslation();
    const [openReorderModal, setOpenReorderModal] = React.useState(false);
    // One range for all cards: picking it per card would put a row of
    // buttons on every one of them
    const [range, setRange] = React.useState<ChartRange>(DEFAULT_CHART_RANGE);
    // Fetch what the range shows, rather than the whole history: this page
    // charts three months by default, and a synced account holds years
    const categoryQuery = useMeasurementsCategoryQuery({
        filtersetQueryEntries: entryFilterFor(range),
    });

    return categoryQuery.isLoading
        ? <LoadingPlaceholder />
        : <>
            <WgerContainerRightSidebar
                title={t("measurements.measurements")}
                optionsMenu={
                    <Tooltip title={t('measurements.reorderCategories')}>
                        <IconButton onClick={() => setOpenReorderModal(true)}>
                            <SortIcon />
                        </IconButton>
                    </Tooltip>
                }
                mainContent={<Stack spacing={2}>
                    {categoryQuery.data!.length === 0 && <OverviewEmpty />}
                    {categoryQuery.data!.length > 0
                        && <ChartRangeSelector value={range} onChange={setRange} />}
                    {categoryQuery.data!.map(c =>
                        <CategoryList category={c} key={c.id} range={range} />)}
                </Stack>
                }
                fab={<AddMeasurementCategoryFab />}
            />
            <WgerModal
                title={t('measurements.reorderCategories')}
                isOpen={openReorderModal}
                closeFn={() => setOpenReorderModal(false)}>
                <CategoryReorderList categories={categoryQuery.data!} />
            </WgerModal>
        </>;
};

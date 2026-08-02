import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerModal } from "@/core/ui/Modals/WgerModal";
import { EmptyCard } from "@/components/Dashboard/EmptyCard";
import { entryFilterFor, MeasurementEntry } from "@/components/Measurements";
import {
    useBodyWeightCategoryQuery,
    useBodyWeightQuery,
    useDisplayWeightUnit,
    WeightChart,
    WeightForm,
    WeightTableDashboard
} from "@/components/Weight";
import { makeLink, WgerLink } from "@/core/lib/url";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { useTranslation } from "react-i18next";
import { DashboardCard } from "./DashboardCard";

export const WeightCard = () => {
    const [t] = useTranslation();
    const weightyQuery = useBodyWeightQuery(entryFilterFor('lastYear'));

    if (weightyQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return weightyQuery.data?.length !== undefined && weightyQuery.data?.length > 0 ? (
        <WeightCardContent entries={weightyQuery.data} />
    ) : (
        <EmptyCard title={t("weight")} modalContent={<WeightForm />} />
    );
};
export const WeightCardContent = (props: { entries: MeasurementEntry[] }) => {
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const [t, i18n] = useTranslation();
    const displayUnit = useDisplayWeightUnit();
    const categoryQuery = useBodyWeightCategoryQuery();

    // Entries without their own unit fall back to the one of the category
    const categoryUnit = categoryQuery.data?.unit ?? 'kg';

    return (
        <>
            <DashboardCard
                title={t("weight")}
                subheader={"."}
                actions={
                    <>
                        <Button size="small" href={makeLink(WgerLink.WEIGHT_OVERVIEW, i18n.language)}>
                            {t("seeDetails")}
                        </Button>
                        <Tooltip title={t("addEntry")}>
                            <IconButton onClick={handleOpenModal}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                }
            >
                <WeightChart
                    weights={props.entries}
                    unit={displayUnit}
                    categoryUnit={categoryUnit}
                    height={200} />
                <Box sx={{ mt: 2 }}>
                    <WeightTableDashboard
                        weights={props.entries}
                        unit={displayUnit}
                        categoryUnit={categoryUnit} />
                </Box>
            </DashboardCard>

            <WgerModal title={t("add")} isOpen={openModal} closeFn={handleCloseModal}>
                <WeightForm closeFn={handleCloseModal} />
            </WgerModal>
        </>
    );
};

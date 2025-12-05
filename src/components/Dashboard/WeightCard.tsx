import AddIcon from "@mui/icons-material/Add";
import { Box, Button, IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WeightEntry } from "components/BodyWeight/model";
import { useBodyWeightQuery } from "components/BodyWeight/queries";
import { WeightTableDashboard } from "components/BodyWeight/TableDashboard/TableDashboard";
import { WeightChart } from "components/BodyWeight/WeightChart";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { EmptyCard } from "components/Dashboard/EmptyCard";
import React from "react";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";
import { DashboardCard } from "./DashboardCard";

export const WeightCard = () => {
    const [t] = useTranslation();
    const weightyQuery = useBodyWeightQuery("lastYear");

    if (weightyQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return weightyQuery.data?.length !== undefined && weightyQuery.data?.length > 0 ? (
        <WeightCardContent entries={weightyQuery.data} />
    ) : (
        <EmptyCard title={t("weight")} modalContent={<WeightForm />} />
    );
};
export const WeightCardContent = (props: { entries: WeightEntry[] }) => {
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const [t, i18n] = useTranslation();

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
                <WeightChart weights={props.entries} height={200} />
                <Box sx={{ mt: 2 }}>
                    <WeightTableDashboard weights={props.entries} />
                </Box>
            </DashboardCard>

            <WgerModal title={t("add")} isOpen={openModal} closeFn={handleCloseModal}>
                <WeightForm closeFn={handleCloseModal} />
            </WgerModal>
        </>
    );
};

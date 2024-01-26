import AddIcon from "@mui/icons-material/Add";
import { Button, Card, CardActions, CardContent, CardHeader, IconButton, } from '@mui/material';
import Tooltip from "@mui/material/Tooltip";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { OverviewDashboard } from "components/BodyWeight/OverviewDashboard/OverviewDashboard";
import { WgerModal } from "components/Core/Modals/WgerModal";
import React from 'react';
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";

export const WeightCard = () => {

    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const [t, i18n] = useTranslation();

    return (
        <div>
            <Card>
                <CardHeader title={t('weight')} />
                <CardContent>
                    <p>{t('currentWeight')}</p>
                    <OverviewDashboard />
                </CardContent>
                <CardActions sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}>
                    <Button size="small"
                            href={makeLink(WgerLink.WEIGHT_OVERVIEW, i18n.language)}>
                        {t('seeDetails')}
                    </Button>
                    <Tooltip title={t('addEntry')}>
                        <IconButton onClick={handleOpenModal}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </CardActions>
            </Card>
            <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal}>
                <WeightForm closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};
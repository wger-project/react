import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader, IconButton } from '@mui/material';
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WeightEntry } from "components/BodyWeight/model";
import { WeightTableDashboard } from "components/BodyWeight/TableDashboard/TableDashboard";
import { WeightChart } from "components/BodyWeight/WeightChart";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";
import WeightFilter from 'components/BodyWeight/WeightFilter';
import { useBodyWeightQuery } from 'components/BodyWeight/queries';
import { LoadingPlaceholder } from 'components/Core/LoadingWidget/LoadingWidget';
import { EmptyCard } from 'components/Dashboard/EmptyCard';

export const WeightCard = () => {
    const [t] = useTranslation();
    const weightyQuery = useBodyWeightQuery();

    return (
        <>
            {weightyQuery.isLoading
                ? <LoadingPlaceholder />
                : <>
                    {weightyQuery.data?.length !== undefined && weightyQuery.data?.length > 0
                        ? <WeightCardContent entries={weightyQuery.data} />
                        : <EmptyCard
                            title={t('weight')}
                            modalContent={<WeightForm />}
                        />}
                </>
            }
        </>
    );
};

export const WeightCardContent = (props: { entries: WeightEntry[] }) => {
    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const [t, i18n] = useTranslation();
    const [filteredData, setFilteredData] = useState<WeightEntry[]>(props.entries);

    useEffect(() => {
        setFilteredData(props.entries);
    }, [props.entries]);

    const handleFilter = (filter: string) => {
        const now = new Date();
        let filteredWeights: WeightEntry[] = [];
        switch (filter) {
            case 'year':
                filteredWeights = props.entries.filter((entry) =>
                    new Date(entry.date) >= new Date(now.setFullYear(now.getFullYear() - 1))
                );
                break;
            case 'sixMonths':
                filteredWeights = props.entries.filter((entry) =>
                    new Date(entry.date) >= new Date(now.setMonth(now.getMonth() - 6))
                );
                break;
            case 'month':
                filteredWeights = props.entries.filter((entry) =>
                    new Date(entry.date) >= new Date(now.setMonth(now.getMonth() - 1))
                );
                break;
            case 'all':
            default:
                filteredWeights = props.entries;
        }
        setFilteredData(filteredWeights);
    };

    return (
        <>
            <Card>
                <CardHeader
                    title={t('weight')}
                    subheader={'.'}
                />
                <CardContent sx={{ height: '500px', overflow: 'auto' }}>
                    <WeightFilter onFilter={handleFilter} />
                    <WeightChart weights={filteredData} height={200} />
                    <Box sx={{ mt: 2 }}>
                        <WeightTableDashboard weights={filteredData} />
                    </Box>
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
        </>
    );
};

import AddIcon from "@mui/icons-material/Add";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PhotoIcon from "@mui/icons-material/Photo";
import {
    Alert,
    Avatar,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Snackbar,
} from '@mui/material';
import Tooltip from "@mui/material/Tooltip";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import { useFetchLastNutritionalPlanIdQuery, useFetchNutritionalPlanDateQuery } from "components/Nutrition/queries";
import { useAddDiaryEntriesQuery } from "components/Nutrition/queries/diary";
import { NutritionalValuesDashboardChart } from "components/Nutrition/widgets/charts/NutritionalValuesDashboardChart";
import { NutritionDiaryEntryForm } from "components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { PlanForm } from "components/Nutrition/widgets/forms/PlanForm";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { SNACKBAR_AUTO_HIDE_DURATION } from "utils/consts";
import { dateTimeToLocaleHHMM, dateToYYYYMMDD } from "utils/date";
import { numberGramLocale } from "utils/numbers";
import { makeLink, WgerLink } from "utils/url";

const MealListItem = (props: { meal: Meal, planId: number }) => {
    const [t, i18n] = useTranslation();
    const addDiaryEntriesQuery = useAddDiaryEntriesQuery(props.planId);

    const [expandView, setExpandView] = useState(false);
    const [openSnackbar, setOpenSnackbar] = React.useState(false);

    const handleToggleExpand = () => setExpandView(!expandView);

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const handleAddDiaryEntry = (item: MealItem) => {
        const diaryData = [{
            plan: props.planId,
            meal: props.meal.id,
            mealItem: item.id,
            ingredient: item.ingredientId,
            // eslint-disable-next-line camelcase
            weight_unit: item.weightUnitId,
            datetime: (new Date()).toISOString(),
            amount: item.amount
        }];
        addDiaryEntriesQuery.mutate(diaryData);
        setOpenSnackbar(true);
    };

    const primaryHeader = props.meal.name ? props.meal.name : dateTimeToLocaleHHMM(props.meal.time, i18n.language);
    const secondaryHeader = props.meal.name ? dateTimeToLocaleHHMM(props.meal.time, i18n.language) : null;

    return <>
        <ListItemButton onClick={handleToggleExpand}>
            <ListItemIcon>
                {expandView ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
            <ListItemText primary={primaryHeader} secondary={secondaryHeader} />

        </ListItemButton>
        <Collapse in={expandView} timeout="auto" unmountOnExit>
            <List>
                {props.meal.items.map((item) => <ListItem key={item.id} secondaryAction={
                    <Tooltip title={t('nutrition.logThisMealItem')}>
                        <IconButton edge="end" onClick={() => handleAddDiaryEntry(item)}>
                            <HistoryEduIcon />
                        </IconButton>
                    </Tooltip>
                }>
                    <ListItemAvatar>
                        <Avatar
                            alt={item.ingredient?.name}
                            src={item.ingredient?.image?.url}
                            sx={{ width: 45, height: 45 }}
                        >
                            <PhotoIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={item.ingredient?.name}
                        secondary={numberGramLocale(item.amount, i18n.language)}
                    />
                </ListItem>)}
            </List>
        </Collapse>
        <Snackbar open={openSnackbar} autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                {t('nutrition.diaryEntrySaved')}
            </Alert>
        </Snackbar>
    </>;
};


export const NutritionCard = () => {

    const [t, i18n] = useTranslation();
    const lastPlanQuery = useFetchLastNutritionalPlanIdQuery();

    const planQuery = useFetchNutritionalPlanDateQuery(lastPlanQuery.data!, dateToYYYYMMDD(new Date()), lastPlanQuery.isSuccess);

    const [openLogModal, setOpenLogModal] = React.useState(false);
    const handleOpenLogModal = () => setOpenLogModal(true);
    const handleCloseLogModal = () => setOpenLogModal(false);

    const [openPlanModal, setOpenPlanModal] = React.useState(false);
    const handleOpenPlanModal = () => setOpenPlanModal(true);
    const handleClosePlanModal = () => setOpenPlanModal(false);

    return <>
        {planQuery.isLoading
            ? <LoadingPlaceholder />
            : <>
                {lastPlanQuery.data !== null
                    // Render the plan
                    ? <>
                        <Card>
                            <CardHeader
                                title={t('nutritionalPlan')}
                                subheader={planQuery.data?.description}
                                sx={{ paddingBottom: 0 }} />
                            <CardContent sx={{ paddingTop: 0 }}>
                                <List>
                                    {planQuery.data?.meals.map(meal =>
                                        <MealListItem meal={meal} planId={planQuery.data!.id} key={meal.id} />
                                    )}
                                </List>
                                <NutritionalValuesDashboardChart
                                    percentage={planQuery.data!.percentageValuesLoggedToday}
                                    planned={planQuery.data!.plannedNutritionalValues}
                                    logged={planQuery.data!.loggedNutritionalValuesToday}
                                />
                            </CardContent>
                            <CardActions sx={{
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                            }}>
                                <Button size="small"
                                        href={makeLink(WgerLink.NUTRITION_DETAIL, i18n.language, { id: planQuery.data!.id })}>
                                    {t('seeDetails')}
                                </Button>
                                <Tooltip title={t('nutrition.logThisMealItem')}>
                                    <IconButton onClick={handleOpenLogModal}>
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                        <WgerModal title={t('nutrition.addNutritionalDiary')}
                                   isOpen={openLogModal}
                                   closeFn={handleCloseLogModal}>
                            <NutritionDiaryEntryForm
                                closeFn={handleCloseLogModal}
                                planId={planQuery.data!.id}
                                meals={planQuery.data!.meals}
                            />
                        </WgerModal>
                    </>

                    // No plans available
                    : <>
                        <Card>
                            <CardHeader
                                title={t('nutritionalPlan')}
                                sx={{ paddingBottom: 0 }} />

                            <CardContent sx={{ paddingTop: 0 }}>
                                <OverviewEmpty />
                            </CardContent>

                            <CardActions>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={handleOpenPlanModal}>
                                    {t('add')}
                                </Button>
                            </CardActions>
                        </Card>
                        <WgerModal title={t('add')} isOpen={openPlanModal}
                                   closeFn={handleClosePlanModal}>
                            <PlanForm closeFn={handleClosePlanModal} />
                        </WgerModal>
                    </>}
            </>
        }
    </>;
};
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
import { EmptyCard } from "components/Dashboard/EmptyCard";
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { useFetchLastNutritionalPlanQuery } from "components/Nutrition/queries";
import { useAddDiaryEntriesQuery } from "components/Nutrition/queries/diary";
import { NutritionalValuesDashboardChart } from "components/Nutrition/widgets/charts/NutritionalValuesDashboardChart";
import { NutritionDiaryEntryForm } from "components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { PlanForm } from "components/Nutrition/widgets/forms/PlanForm";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { SNACKBAR_AUTO_HIDE_DURATION } from "utils/consts";
import { dateTimeToLocaleHHMM } from "utils/date";
import { numberGramLocale } from "utils/numbers";
import { makeLink, WgerLink } from "utils/url";


export const NutritionCard = () => {

    const [t] = useTranslation();
    const planQuery = useFetchLastNutritionalPlanQuery();

    if (planQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return planQuery.data !== null
        ? <NutritionCardContent plan={planQuery.data!} />
        : <EmptyCard
            title={t('nutritionalPlan')}
            modalContent={<PlanForm />}
            modalTitle={t('add')}
        />;
};

function NutritionCardContent(props: { plan: NutritionalPlan }) {
    const [t, i18n] = useTranslation();

    const [openLogModal, setOpenLogModal] = React.useState(false);
    const handleOpenLogModal = () => setOpenLogModal(true);
    const handleCloseLogModal = () => setOpenLogModal(false);


    return <>
        <Card>
            <CardHeader
                title={t('nutritionalPlan')}
                subheader={props.plan.description}
            />
            <CardContent sx={{ height: "500px", overflow: "auto" }}>
                <NutritionalValuesDashboardChart
                    percentage={props.plan.percentageValuesLoggedToday}
                    planned={props.plan.plannedNutritionalValues}
                    logged={props.plan.loggedNutritionalValuesToday}
                />
                <List>
                    {props.plan.meals.map(meal =>
                        <MealListItem meal={meal} planId={props.plan.id} key={meal.id} />
                    )}
                </List>
            </CardContent>
            <CardActions sx={{
                justifyContent: "space-between",
                alignItems: "flex-start",
            }}>
                <Button size="small"
                        href={makeLink(WgerLink.NUTRITION_DETAIL, i18n.language, { id: props.plan.id })}>
                    {t('seeDetails')}
                </Button>
                <Tooltip title={t('nutrition.logThisMealItem')}>
                    <IconButton onClick={handleOpenLogModal}>
                        <HistoryEduIcon />
                    </IconButton>
                </Tooltip>
            </CardActions>
        </Card>
        <WgerModal title={t('nutrition.addNutritionalDiary')}
                   isOpen={openLogModal}
                   closeFn={handleCloseLogModal}>
            <NutritionDiaryEntryForm
                closeFn={handleCloseLogModal}
                planId={props.plan.id}
                meals={props.plan.meals}
            />
        </WgerModal>
    </>;
}

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
        <ListItemButton onClick={handleToggleExpand} selected={expandView}>
            <ListItemIcon>
                {expandView ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
            <ListItemText primary={primaryHeader} secondary={secondaryHeader} />

        </ListItemButton>
        <Collapse in={expandView} timeout="auto" unmountOnExit>
            <List>
                {props.meal.items.map((item) =>
                    <ListItem key={item.id} secondaryAction={
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
                    </ListItem>
                )}
            </List>
        </Collapse>
        <Snackbar open={openSnackbar} autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                {t('nutrition.diaryEntrySaved')}
            </Alert>
        </Snackbar>
    </>;
};
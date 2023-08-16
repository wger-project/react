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
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import { useFetchNutritionalPlanDateQuery } from "components/Nutrition/queries";
import { useAddDiaryEntriesQuery } from "components/Nutrition/queries/diary";
import { NutritionalValuesDashboardChart } from "components/Nutrition/widgets/charts/NutritionalValuesDashboardChart";
import { NutritionDiaryEntryForm } from "components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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

    return <>
        <ListItemButton onClick={handleToggleExpand}>
            <ListItemIcon>
                {expandView ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
            <ListItemText primary={props.meal.name} secondary={dateTimeToLocaleHHMM(props.meal.time, i18n.language)} />

        </ListItemButton>
        <Collapse in={expandView} timeout="auto" unmountOnExit>
            <List>
                {props.meal.items.map((item) => <ListItem secondaryAction={
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


export const NutritionCard = (props: { planId: number }) => {

    const [t, i18n] = useTranslation();
    const planQuery = useFetchNutritionalPlanDateQuery(props.planId, dateToYYYYMMDD(new Date()));

    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    return <>
        {planQuery.isLoading
            ? <LoadingPlaceholder />
            : <>
                <Card>
                    <CardHeader title={t('nutritionalPlan')} subheader={planQuery.data?.description} />
                    <CardContent>
                        <List>
                            {planQuery.data!.meals.map(meal =>
                                <MealListItem meal={meal} planId={planQuery.data!.id} key={meal.id} />
                            )}
                        </List>
                        <NutritionalValuesDashboardChart
                            planned={planQuery.data!.plannedNutritionalValues}
                            logged={planQuery.data!.loggedNutritionalValuesToday}
                        />
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={handleOpenModal}>{t('nutrition.addNutritionalDiary')}</Button>
                        <Button size="small" component={Link}
                                to={makeLink(WgerLink.NUTRITION_DETAIL, i18n.language, { id: planQuery.data!.id })}>{t('seeDetails')}</Button>
                    </CardActions>
                </Card>
                <WgerModal title={t('nutrition.addNutritionalDiary')} isOpen={openModal} closeFn={handleCloseModal}>
                    <NutritionDiaryEntryForm
                        closeFn={handleCloseModal}
                        planId={planQuery.data!.id}
                        meals={planQuery.data!.meals}
                    />
                </WgerModal>
            </>}
    </>;
};
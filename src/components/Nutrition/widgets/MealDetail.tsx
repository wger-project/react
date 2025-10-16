import { Add } from "@mui/icons-material";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import PhotoIcon from "@mui/icons-material/Photo";
import {
    Avatar,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    useTheme
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import {
    NutritionalValuesPlannedLoggedChart
} from "components/Nutrition/widgets/charts/NutritionalValuesPlannedLoggedChart";
import { MealItemForm } from "components/Nutrition/widgets/forms/MealItemForm";
import { NutritionDiaryEntryForm } from "components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { IngredientDetailTable } from "components/Nutrition/widgets/IngredientDetailTable";
import { MealDetailDropdown } from "components/Nutrition/widgets/MealDetailDropdown";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const MealItemListItem = (props: { mealItem: MealItem, planId: number, mealId: number }) => {
    const [expandForm, setExpandForm] = useState(false);
    const handleToggleForm = () => setExpandForm(!expandForm);


    return <>
        <ListItem>
            <ListItemAvatar onClick={handleToggleForm} sx={{ '&:hover': { cursor: 'pointer' } }}>
                <Avatar
                    alt={props.mealItem.ingredient?.name}
                    src={props.mealItem.ingredient?.image?.url}
                    sx={{ width: 45, height: 45 }}
                >
                    <PhotoIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={`${props.mealItem.amountString} ${props.mealItem.ingredient?.name}`} />

        </ListItem>
        <Collapse in={expandForm} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
            <ListItem>
                <ListItemText>
                    <MealItemForm
                        planId={props.planId}
                        mealId={props.mealId}
                        item={props.mealItem}
                        closeFn={handleToggleForm}
                    />
                </ListItemText>
            </ListItem>
        </Collapse>
    </>;
};

export const MealDetail = (props: { meal: Meal, planId: number, onlyLogging: boolean }) => {
    const theme = useTheme();
    const [t] = useTranslation();
    const [expandViewStats, setExpandViewStats] = useState(false);
    const handleToggleExpandStats = () => setExpandViewStats(!expandViewStats);

    const [expandItemForm, setExpandItemForm] = useState(false);
    const handleToggleExpandItemForm = () => {
        setExpandItemForm(!expandItemForm);
        setExpandDiaryForm(false);
    };

    const [expandDiaryForm, setExpandDiaryForm] = useState(false);
    const handleToggleExpandDiaryForm = () => {
        setExpandDiaryForm(!expandDiaryForm);
        setExpandItemForm(false);
    };

    return <Card>
        <CardHeader
            sx={{ bgcolor: theme.palette.grey["300"] }}
            action={<MealDetailDropdown
                meal={props.meal}
                planId={props.planId}
                onlyLogging={props.onlyLogging}
                isExpanded={expandViewStats}
                handleExpanded={handleToggleExpandStats}
            />}
            title={props.meal.name}
            subheader={props.meal.timeHHMMLocale}
        />
        <CardContent sx={{ paddingY: 0 }}>
            <Collapse in={expandViewStats} timeout="auto" unmountOnExit>
                {!props.onlyLogging && <IngredientDetailTable
                    showSum={props.meal.isRealMeal}
                    items={props.meal.items}
                    values={props.meal.plannedNutritionalValues}
                />}

                <Typography gutterBottom variant="h6" sx={{ my: 2 }}>
                    {t('nutrition.loggedToday')}
                </Typography>

                {!props.meal.plannedNutritionalValues.isEmpty &&
                    <NutritionalValuesPlannedLoggedChart
                        logged={props.meal.loggedNutritionalValuesToday}
                        planned={props.meal.plannedNutritionalValues}
                    />}

                <IngredientDetailTable
                    showSum={props.meal.isRealMeal}
                    items={props.meal.diaryEntriesToday}
                    values={props.meal.loggedNutritionalValuesToday}
                />

            </Collapse>

            {!expandViewStats &&
                <List>
                    {props.meal.items.map((item) => (
                        <MealItemListItem
                            mealItem={item}
                            planId={props.planId}
                            mealId={props.meal.id!}
                            key={item.id}
                        />
                    ))}
                </List>}

        </CardContent>
        <CardActions>
            {!props.onlyLogging && <Tooltip title={t('nutrition.addMealItem')}>
                <IconButton onClick={handleToggleExpandItemForm}>
                    <Add />
                </IconButton>
            </Tooltip>}

            <Tooltip title={t('nutrition.addNutritionalDiary')}>
                <IconButton onClick={handleToggleExpandDiaryForm}>
                    <HistoryEduIcon />
                </IconButton>
            </Tooltip>
        </CardActions>

        <Collapse in={expandItemForm} timeout="auto" unmountOnExit>
            <CardContent sx={{ paddingY: 0 }}>
                <p><b>{t('nutrition.addMealItem')}</b></p>
                <MealItemForm
                    planId={props.planId}
                    mealId={props.meal.id!}
                    closeFn={handleToggleExpandItemForm} />
            </CardContent>
        </Collapse>
        <Collapse in={expandDiaryForm} timeout="auto" unmountOnExit>
            <CardContent sx={{ paddingY: 0 }}>
                <p><b>{t('nutrition.addNutritionalDiary')}</b></p>
                <NutritionDiaryEntryForm
                    closeFn={handleToggleExpandDiaryForm}
                    planId={props.planId}
                    mealId={props.meal.isRealMeal ? props.meal.id : null} />
            </CardContent>
        </Collapse>

    </Card>;
};
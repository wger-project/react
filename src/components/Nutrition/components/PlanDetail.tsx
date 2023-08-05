import { Add } from "@mui/icons-material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import { PSEUDO_MEAL_ID } from "components/Nutrition/models/nutritionalPlan";
import { useFetchNutritionalPlanQuery } from "components/Nutrition/queries";
import { MacrosPieChart } from "components/Nutrition/widgets/charts/MacrosPieChart";
import { NutritionalValuesDashboardChart } from "components/Nutrition/widgets/charts/NutritionalValuesDashboardChart";
import {
    NutritionalValuesPlannedLoggedChart
} from "components/Nutrition/widgets/charts/NutritionalValuesPlannedLoggedChart";
import { NutritionDiaryChart } from "components/Nutrition/widgets/charts/NutritionDiaryChart";
import { DiaryOverview } from "components/Nutrition/widgets/DiaryOverview";
import { AddNutritionDiaryEntryFab } from "components/Nutrition/widgets/Fab";
import { MealForm } from "components/Nutrition/widgets/forms/MealForm";
import { MealItemForm } from "components/Nutrition/widgets/forms/MealItemForm";
import { NutritionDiaryEntryForm } from "components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { MealDetailDropdown } from "components/Nutrition/widgets/MealDetailDropdown";
import { NutritionalValuesTable } from "components/Nutrition/widgets/NutritionalValuesTable";
import { PlanDetailDropdown } from "components/Nutrition/widgets/PlanDetailDropdown";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";


const MealItemListItem = (props: { mealItem: MealItem, planId: number, mealId: number }) => {
    const [expandForm, setExpandForm] = useState(false);
    const handleToggleForm = () => setExpandForm(!expandForm);


    return <>
        <ListItem>
            <ListItemAvatar onClick={handleToggleForm}>
                <Avatar>
                    {/*{props.mealItem.ingredient?.image ?*/}
                    {/*    <Avatar alt="" src={`${SERVER_URL}${option.data.image}`} variant="rounded" />*/}
                    {/*    : <PhotoIcon fontSize="large" />}*/}
                    {/*<ImageIcon />*/}
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

const IngredientTableRow = (props: { item: MealItem | DiaryEntry }) => {
    const [t] = useTranslation();


    return <TableRow key={props.item.id}>
        <TableCell sx={{ pr: 0 }}>
            <Avatar>
                <PhotoIcon />
            </Avatar>
        </TableCell>
        <TableCell>
            {props.item.amountString} {props.item.ingredient?.name}
        </TableCell>
        <TableCell align={'right'}>
            {t('nutrition.valueEnergyKcalKj', {
                kcal: props.item.nutritionalValues.energy.toFixed(),
                kj: props.item.nutritionalValues.energyKj.toFixed()
            })}
        </TableCell>
        <TableCell align="right">
            {t('nutrition.valueUnitG', { value: props.item.nutritionalValues.carbohydrates.toFixed() })}
        </TableCell>
        <TableCell align="right">
            {t('nutrition.valueUnitG', { value: props.item.nutritionalValues.fat.toFixed() })}
        </TableCell>
        <TableCell align="right">
            {t('nutrition.valueUnitG', { value: props.item.nutritionalValues.protein.toFixed() })}
        </TableCell>
    </TableRow>;
};

const MealDetail = (props: { meal: Meal, planId: number }) => {
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
            action={props.meal.id !== PSEUDO_MEAL_ID && <MealDetailDropdown meal={props.meal} planId={props.planId} />}
            title={props.meal.name}
            subheader={props.meal.timeHHMM}
        />
        <CardContent sx={{ paddingY: 0 }}>
            <Collapse in={expandViewStats} timeout="auto" unmountOnExit>
                {/*<Typography gutterBottom variant="h6">*/}
                {/*    {t('nutrition.planned')}*/}
                {/*</Typography>*/}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell align={'right'}>{t('nutrition.energy')}</TableCell>
                                <TableCell align="right">{t('nutrition.protein')}</TableCell>
                                <TableCell align="right">{t('nutrition.carbohydrates')}</TableCell>
                                <TableCell align="right">{t('nutrition.fat')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.meal.items.map((item) => (
                                <IngredientTableRow item={item} key={item.id} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography gutterBottom variant="h6" sx={{ my: 2 }}>
                    {t('nutrition.loggedToday')}
                </Typography>

                {!props.meal.nutritionalValues.isEmpty &&
                    <NutritionalValuesPlannedLoggedChart
                        logged={props.meal.nutritionalValues}
                        planned={props.meal.nutritionalValuesDiaryToday}
                    />}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell align={'right'}>{t('nutrition.energy')}</TableCell>
                                <TableCell align="right">{t('nutrition.protein')}</TableCell>
                                <TableCell align="right">{t('nutrition.carbohydrates')}</TableCell>
                                <TableCell align="right">{t('nutrition.fat')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.meal.diaryEntriesToday.map((item) => (
                                <IngredientTableRow item={item} key={item.id} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Collapse>

            {!expandViewStats &&
                <List>
                    {props.meal.items.map((item) => (
                        <MealItemListItem
                            mealItem={item}
                            planId={props.planId}
                            mealId={props.meal.id}
                            key={item.id}
                        />
                    ))}
                </List>}

        </CardContent>
        <CardActions>
            <IconButton onClick={handleToggleExpandStats}>
                {expandViewStats ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>

            {props.meal.id !== PSEUDO_MEAL_ID && <Tooltip title={t('nutrition.addMeal')}>
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
                    mealId={props.meal.id}
                    closeFn={handleToggleExpandItemForm} />
            </CardContent>
        </Collapse>
        <Collapse in={expandDiaryForm} timeout="auto" unmountOnExit>
            <CardContent sx={{ paddingY: 0 }}>
                <p><b>{t('nutrition.addNutritionalDiary')}</b></p>
                <NutritionDiaryEntryForm
                    closeFn={handleToggleExpandDiaryForm}
                    planId={props.planId}
                    mealId={props.meal.id !== PSEUDO_MEAL_ID ? props.meal.id : null} />
            </CardContent>
        </Collapse>

    </Card>;
};


export const PlanDetail = () => {
    const [t] = useTranslation();
    const params = useParams<{ planId: string }>();
    const planId = parseInt(params.planId!);
    const planQuery = useFetchNutritionalPlanQuery(planId);
    const [expandedForm, setExpandedForm] = useState(false);
    const handleToggleExpandedForm = () => setExpandedForm(!expandedForm);

    return planQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={planQuery.data!.description}
            optionsMenu={<PlanDetailDropdown plan={planQuery.data!} />}
            mainContent={<>
                <Stack spacing={2}>
                    <Typography gutterBottom variant="h4">
                        {t('nutrition.planned')}
                    </Typography>
                    {planQuery.data!.meals.map(meal =>
                        <MealDetail meal={meal} planId={planQuery.data!.id} key={meal.id} />
                    )}
                    <MealDetail meal={planQuery.data!.pseudoMealOthers} planId={planQuery.data!.id} key={-1} />

                    <Tooltip title={t('nutrition.addMeal')}>
                        <IconButton onClick={handleToggleExpandedForm}>
                            <Add />
                        </IconButton>
                    </Tooltip>

                    <Collapse in={expandedForm} timeout="auto" unmountOnExit>
                        <p><b>{t('nutrition.addMeal')}</b></p>
                        <MealForm planId={planQuery.data!.id} closeFn={handleToggleExpandedForm} />
                    </Collapse>

                    <Typography gutterBottom variant="h5">
                        {t('nutrition.nutritionalData')}
                    </Typography>
                    <NutritionalValuesTable values={planQuery.data!.plannedNutritionalValues} />
                    <MacrosPieChart data={planQuery.data!.plannedNutritionalValues} />

                    <Typography gutterBottom variant="h4">
                        {t('nutrition.logged')}
                    </Typography>
                    <NutritionDiaryChart
                        planned={planQuery.data!.plannedNutritionalValues}
                        today={planQuery.data!.loggedNutritionalValuesToday}
                        avg7Days={planQuery.data!.loggedNutritionalValues7DayAvg}
                    />
                    <DiaryOverview
                        entries={planQuery.data!.groupDiaryEntries}
                        planValues={planQuery.data!.plannedNutritionalValues}
                    />
                </Stack>
            </>}
            sideBar={<NutritionalValuesDashboardChart
                planned={planQuery.data!.plannedNutritionalValues}
                logged={planQuery.data!.loggedNutritionalValuesToday}
            />}
            fab={<AddNutritionDiaryEntryFab plan={planQuery.data!} />}
        />;
};
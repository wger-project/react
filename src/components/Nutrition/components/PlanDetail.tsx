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
    Typography
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import { useFetchNutritionalPlanQuery } from "components/Nutrition/queries";
import { MacrosPieChart } from "components/Nutrition/widgets/charts/MacrosPieChart";
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


const MealItemListItem = (props: { mealItem: MealItem }) => {
    return <ListItem>
        <ListItemAvatar>
            <Avatar>
                {/*{props.mealItem.ingredient?.image ?*/}
                {/*    <Avatar alt="" src={`${SERVER_URL}${option.data.image}`} variant="rounded" />*/}
                {/*    : <PhotoIcon fontSize="large" />}*/}
                {/*<ImageIcon />*/}
                <PhotoIcon />
            </Avatar>
        </ListItemAvatar>
        <ListItemText primary={`${props.mealItem.amountString} ${props.mealItem.ingredient?.name}`} />
    </ListItem>;
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
    const [t] = useTranslation();
    const [expandViewStats, setExpandViewStats] = useState(false);
    const handleToggleExpandStats = () => setExpandViewStats(!expandViewStats);

    const [expandItemForm, setExpandItemForm] = useState(false);
    const handleToggleExpandItemForm = () => setExpandItemForm(!expandItemForm);

    const [expandDiaryForm, setExpandDiaryForm] = useState(false);
    const handleToggleExpandDiaryForm = () => setExpandDiaryForm(!expandDiaryForm);

    return <Card>
        <CardHeader
            sx={{ bgcolor: "lightgray" }}
            action={<MealDetailDropdown meal={props.meal} planId={props.planId} />}
            title={props.meal.name}
            subheader={props.meal.time}
        />
        <CardContent>
            <Collapse in={expandViewStats} timeout="auto" unmountOnExit>
                <Typography gutterBottom variant="h6">
                    {t('nutrition.planned')}
                </Typography>


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
                            key={item.id}
                        />
                    ))}
                </List>}

        </CardContent>
        <CardActions>
            <Tooltip title={t('add')}>
                <IconButton onClick={handleToggleExpandStats}>
                    {expandViewStats
                        ? <ExpandLessIcon />
                        : <ExpandMoreIcon />
                    }
                </IconButton>
            </Tooltip>

            <Tooltip title={t('add')}>
                <IconButton onClick={handleToggleExpandItemForm}>
                    <Add />
                </IconButton>
            </Tooltip>

            <Tooltip title={t('nutrition.addNutritionalDiary')}>
                <IconButton onClick={handleToggleExpandDiaryForm}>
                    <HistoryEduIcon />
                </IconButton>
            </Tooltip>
        </CardActions>
        <CardContent>
            <Collapse in={expandItemForm} timeout="auto" unmountOnExit>
                <MealItemForm planId={props.planId} mealId={props.meal.id} closeFn={handleToggleExpandItemForm} />
            </Collapse>
            <Collapse in={expandDiaryForm} timeout="auto" unmountOnExit>
                <NutritionDiaryEntryForm
                    closeFn={handleToggleExpandDiaryForm}
                    planId={props.planId}
                    mealId={props.meal.id} />
            </Collapse>
        </CardContent>

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
                    {planQuery.data!.meals.map(meal =>
                        <MealDetail meal={meal} planId={planQuery.data!.id} key={meal.id} />
                    )}
                    <MealDetail meal={planQuery.data!.pseudoMealOthers} planId={planQuery.data!.id} key={-1} />
                    <Tooltip title={t('add')}>
                        <IconButton onClick={handleToggleExpandedForm}>
                            <Add />
                        </IconButton>
                    </Tooltip>
                    <Collapse in={expandedForm} timeout="auto" unmountOnExit>
                        <CardContent>
                            <MealForm planId={planQuery.data!.id} closeFn={handleToggleExpandedForm} />
                        </CardContent>
                    </Collapse>

                    <Typography gutterBottom variant="h5">
                        {t('nutrition.nutritionalData')}
                    </Typography>
                    <NutritionalValuesTable values={planQuery.data!.nutritionalValues} />
                    <MacrosPieChart data={planQuery.data!.nutritionalValues} />
                    <Typography gutterBottom variant="h5">
                        {t('nutrition.nutritionalDiary')}
                    </Typography>

                    <NutritionDiaryChart
                        planned={planQuery.data!.nutritionalValues}
                        today={planQuery.data!.nutritionalValuesDiaryToday}
                        avg7Days={planQuery.data!.nutritionalValues7DayAvg}
                    />
                    <DiaryOverview
                        entries={planQuery.data!.groupDiaryEntries}
                        planValues={planQuery.data!.nutritionalValues}
                    />
                </Stack>
            </>}
            sideBar={<NutritionalValuesPlannedLoggedChart
                planned={planQuery.data!.nutritionalValues}
                logged={planQuery.data!.loggedNutritionalValues}
            />}
            fab={<AddNutritionDiaryEntryFab plan={planQuery.data!} />}
        />;
};
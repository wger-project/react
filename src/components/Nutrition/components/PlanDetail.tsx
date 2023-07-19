import { Add } from "@mui/icons-material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import { useFetchNutritionalPlanQuery } from "components/Nutrition/queries";
import { DiaryOverview } from "components/Nutrition/widgets/DiaryOverview";
import { AddNutritionDiaryEntryFab } from "components/Nutrition/widgets/Fab";
import { MacrosPieChart } from "components/Nutrition/widgets/MacrosPieChart";
import { NutritionalValuesPlannedLoggedChart } from "components/Nutrition/widgets/NutritionalValuesPlannedLoggedChart";
import { NutritionDiaryChart } from "components/Nutrition/widgets/NutritionDiaryChart";
import { PlanDetailDropdown } from "components/Nutrition/widgets/PlanDetailDropdown";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";


const NutritionalValuesTable = (props: { values: NutritionalValues }) => {
    const [t] = useTranslation();

    return <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>{t('nutrition.macronutrient')}</TableCell>
                    <TableCell align="right">{t('total')}</TableCell>
                    <TableCell align="right">{t('nutrition.percentEnergy')}</TableCell>
                    <TableCell align="right">{t('nutrition.gPerBodyKg')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>{t('nutrition.energy')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueEnergyKcalKj', {
                            kcal: props.values.energy.toFixed(),
                            kj: props.values.energyKj.toFixed()
                        })}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.protein')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.values.protein.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitPercent', { value: props.values.percent.protein.toFixed() })}
                    </TableCell>
                    <TableCell align="right">...</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.carbohydrates')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.values.carbohydrates.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitPercent', { value: props.values.percent.carbohydrates.toFixed() })}
                    </TableCell>
                    <TableCell align="right">...</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell sx={{ pl: 5 }}>{t('nutrition.ofWhichSugars')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.values.carbohydratesSugar.toFixed() })}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.fat')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.values.fat.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitPercent', { value: props.values.percent.fat.toFixed() })}
                    </TableCell>
                    <TableCell align="right">...</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell sx={{ pl: 5 }}>{t('nutrition.ofWhichSaturated')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.values.fatSaturated.toFixed() })}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>{t('nutrition.others')}</TableCell>
                    <TableCell> </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.fibres')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.values.fibres.toFixed() })}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.sodium')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.values.sodium.toFixed() })}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>;
};

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
        <TableCell>
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

const MealDetail = (props: { meal: Meal }) => {
    const [t] = useTranslation();
    const [expandedView, setExpandedView] = useState(false);
    const handleToggleExpandedView = () => setExpandedView(!expandedView);

    return <Card sx={{ minWidth: 275 }}>
        <CardHeader
            sx={{ bgcolor: "lightgray" }}
            action={
                <IconButton aria-label="settings" onClick={() => console.log(props.meal)}>
                    <MoreVertIcon />
                </IconButton>
            }
            title={props.meal.name}
            subheader={props.meal.time}
        />
        <CardContent>
            <Collapse in={expandedView} timeout="auto" unmountOnExit>
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

            {!expandedView &&
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
                <IconButton onClick={handleToggleExpandedView}>
                    {expandedView
                        ? <ExpandLessIcon />
                        : <ExpandMoreIcon />
                    }
                </IconButton>
            </Tooltip>

            <Tooltip title={t('add')}>
                <IconButton onClick={() => console.log(props)}>
                    <Add />
                </IconButton>

            </Tooltip>

            <Tooltip title={t('nutrition.addNutritionalDiary')}>
                <IconButton onClick={() => console.log(props)}>
                    <HistoryEduIcon />
                </IconButton>
            </Tooltip>
        </CardActions>
    </Card>;
};


export const PlanDetail = () => {
    const [t] = useTranslation();
    const params = useParams<{ planId: string }>();
    const planId = parseInt(params.planId!);
    const planQuery = useFetchNutritionalPlanQuery(planId);

    return planQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={planQuery.data!.description}
            optionsMenu={<PlanDetailDropdown plan={planQuery.data!} />}
            mainContent={
                <>
                    <Stack spacing={2}>
                        {planQuery.data!.meals.map(meal => <MealDetail meal={meal} key={meal.id} />)}
                        <MealDetail meal={planQuery.data!.pseudoMealOthers} key={-1} />
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
                </>
            }
            sideBar={<NutritionalValuesPlannedLoggedChart
                planned={planQuery.data!.nutritionalValues}
                logged={planQuery.data!.loggedNutritionalValues}
            />}
            fab={<AddNutritionDiaryEntryFab plan={planQuery.data!} />}
        />;
};
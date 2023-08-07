import PhotoIcon from "@mui/icons-material/Photo";
import { Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { MealItem } from "components/Nutrition/models/mealItem";
import { useTranslation } from "react-i18next";

const IngredientTableRow = (props: { item: MealItem | DiaryEntry }) => {
    const [t] = useTranslation();

    return <TableRow key={props.item.id}>
        <TableCell sx={{ paddingX: 1 }}>
            <Avatar>
                <PhotoIcon />
            </Avatar>
        </TableCell>
        <TableCell sx={{ paddingX: 1 }}>
            {props.item.amountString} {props.item.ingredient?.name}
        </TableCell>
        <TableCell align={'right'} sx={{ paddingX: 1 }}>
            {t('nutrition.valueEnergyKcalKj', {
                kcal: props.item.nutritionalValues.energy.toFixed(),
                kj: props.item.nutritionalValues.energyKj.toFixed()
            })}
        </TableCell>
        <TableCell align="right" sx={{ paddingX: 1 }}>
            {t('nutrition.valueUnitG', { value: props.item.nutritionalValues.protein.toFixed() })}
        </TableCell>
        <TableCell align="right" sx={{ paddingX: 1 }}>
            {t('nutrition.valueUnitG', { value: props.item.nutritionalValues.carbohydrates.toFixed() })}
        </TableCell>
        <TableCell align="right" sx={{ paddingX: 1 }}>
            {t('nutrition.valueUnitG', { value: props.item.nutritionalValues.fat.toFixed() })}
        </TableCell>
    </TableRow>;
};

export const IngredientDetailTable = (props: {
    items: MealItem[] | DiaryEntry[],
    values: NutritionalValues,
    isRealMeal: boolean
}) => {
    const [t] = useTranslation();

    return <TableContainer>
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
                {props.items.map((item) => (
                    <IngredientTableRow item={item} key={item.id} />
                ))}
                {props.isRealMeal && <TableRow>
                    <TableCell sx={{ paddingX: 1 }}> </TableCell>
                    <TableCell sx={{ paddingX: 1 }}>
                        Σ
                    </TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>
                        {t('nutrition.valueEnergyKcalKj', {
                            kcal: props.values.energy.toFixed(),
                            kj: props.values.energyKj.toFixed()
                        })}
                    </TableCell>
                    <TableCell align="right" sx={{ paddingX: 1 }}>
                        {t('nutrition.valueUnitG', { value: props.values.protein.toFixed() })}
                    </TableCell>
                    <TableCell align="right" sx={{ paddingX: 1 }}>
                        {t('nutrition.valueUnitG', { value: props.values.carbohydrates.toFixed() })}
                    </TableCell>
                    <TableCell align="right" sx={{ paddingX: 1 }}>
                        {t('nutrition.valueUnitG', { value: props.values.fat.toFixed() })}
                    </TableCell>
                </TableRow>}
            </TableBody>
        </Table>
    </TableContainer>;
};
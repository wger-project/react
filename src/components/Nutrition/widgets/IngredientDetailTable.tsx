import PhotoIcon from "@mui/icons-material/Photo";
import { Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { MealItem } from "components/Nutrition/models/mealItem";
import { useTranslation } from "react-i18next";
import { numberGramLocale, numberLocale } from "utils/numbers";

const IngredientTableRow = (props: { item: MealItem | DiaryEntry }) => {
    const [t, i18n] = useTranslation();

    return <TableRow key={props.item.id}>
        <TableCell sx={{ paddingX: 1 }}>
            <Avatar
                alt={props.item.ingredient?.name}
                src={props.item.ingredient?.image?.url}
                sx={{ width: 45, height: 45 }}
            >
                <PhotoIcon />
            </Avatar>

        </TableCell>
        <TableCell sx={{ paddingX: 1 }}>
            {props.item.amountString} {props.item.ingredient?.name}
        </TableCell>
        <TableCell align={'right'} sx={{ paddingX: 1 }}>
            {t('nutrition.valueEnergyKcalKj', {
                kcal: numberLocale(props.item.nutritionalValues.energy, i18n.language),
                kj: numberLocale(props.item.nutritionalValues.energyKj, i18n.language)
            })}
        </TableCell>
        <TableCell align="right" sx={{ paddingX: 1 }}>
            {numberGramLocale(props.item.nutritionalValues.protein, i18n.language)}
        </TableCell>
        <TableCell align="right" sx={{ paddingX: 1 }}>
            {numberGramLocale(props.item.nutritionalValues.carbohydrates, i18n.language)}
        </TableCell>
        <TableCell align="right" sx={{ paddingX: 1 }}>
            {numberGramLocale(props.item.nutritionalValues.fat, i18n.language)}
        </TableCell>
    </TableRow>;
};

export const IngredientDetailTable = (props: {
    items: MealItem[] | DiaryEntry[],
    values: NutritionalValues,
    showSum: boolean
}) => {
    const [t, i18n] = useTranslation();

    return <TableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>{t('nutrition.energy')}</TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>{t('nutrition.protein')}</TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>{t('nutrition.carbohydrates')}</TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>{t('nutrition.fat')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.items.map((item) => (
                    <IngredientTableRow item={item} key={item.id} />
                ))}
                {props.showSum && <TableRow>
                    <TableCell sx={{ paddingX: 1 }}> </TableCell>
                    <TableCell sx={{ paddingX: 1 }}>
                        Σ
                    </TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>
                        {t('nutrition.valueEnergyKcalKj', {
                            kcal: numberLocale(props.values.energy, i18n.language),
                            kj: numberLocale(props.values.energyKj, i18n.language)
                        })}
                    </TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>
                        {numberGramLocale(props.values.protein, i18n.language)}
                    </TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>
                        {numberGramLocale(props.values.carbohydrates, i18n.language)}
                    </TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>
                        {numberGramLocale(props.values.fat, i18n.language)}
                    </TableCell>
                </TableRow>}
            </TableBody>
        </Table>
    </TableContainer>;
};
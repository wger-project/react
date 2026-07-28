import PhotoIcon from "@mui/icons-material/Photo";
import { Avatar, Collapse, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "@/components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import { MealItem } from "@/components/Nutrition/models/mealItem";
import { NutritionDiaryEntryForm } from "@/components/Nutrition/widgets/forms/NutritionDiaryEntryForm";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { numberGramLocale, numberLocale } from "@/core/lib/numbers";

const IngredientTableRow = (props: { item: MealItem | DiaryEntry, planId?: string }) => {
    const [t, i18n] = useTranslation();
    const [expandForm, setExpandForm] = useState(false);

    const isEditable = props.planId !== undefined && props.item instanceof DiaryEntry;
    const handleToggleForm = () => {
        if (isEditable) {
            setExpandForm(!expandForm);
        }
    };
    const clickableSx = isEditable ? { '&:hover': { cursor: 'pointer' } } : {};

    return <>
        <TableRow key={props.item.id}>
            <TableCell onClick={handleToggleForm} sx={{ paddingX: 1, ...clickableSx }}>
                <Avatar
                    alt={props.item.ingredient?.name}
                    src={props.item.ingredient?.image?.url}
                    sx={{ width: 45, height: 45 }}
                >
                    <PhotoIcon />
                </Avatar>

            </TableCell>
            <TableCell onClick={handleToggleForm} sx={{ paddingX: 1, ...clickableSx }}>
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
        </TableRow>
        {isEditable && <TableRow>
            <TableCell colSpan={6} sx={{ paddingY: 0, ...(expandForm ? {} : { borderBottom: 'none' }) }}>
                <Collapse in={expandForm} timeout="auto" unmountOnExit sx={{ paddingY: 2 }}>
                    <NutritionDiaryEntryForm
                        planId={props.planId!}
                        entry={props.item as DiaryEntry}
                        closeFn={() => setExpandForm(false)}
                    />
                </Collapse>
            </TableCell>
        </TableRow>}
    </>;
};

export const IngredientDetailTable = (props: {
    items: MealItem[] | DiaryEntry[],
    values: NutritionalValues,
    showSum: boolean,
    // When given, diary entry rows can be expanded to an edit form
    planId?: string
}) => {
    const [t, i18n] = useTranslation();

    return <TableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell />
                    <TableCell />
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>{t('nutrition.energy')}</TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>{t('nutrition.protein')}</TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>{t('nutrition.carbohydrates')}</TableCell>
                    <TableCell align={'right'} sx={{ paddingX: 1 }}>{t('nutrition.fat')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.items.map((item) => (
                    <IngredientTableRow item={item} planId={props.planId} key={item.id} />
                ))}
                {props.showSum && <TableRow>
                    <TableCell sx={{ paddingX: 1 }}> </TableCell>
                    <TableCell sx={{ paddingX: 1 }}>
                        {t('total')}
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
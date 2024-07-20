import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { useTranslation } from "react-i18next";
import { numberGramLocale, numberLocale } from "utils/numbers";

export const LoggedPlannedNutritionalValuesTable = (props: {
    planned: NutritionalValues,
    logged: NutritionalValues
}) => {
    const [t, i18n] = useTranslation();

    return <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>{t('nutrition.macronutrient')}</TableCell>
                    <TableCell align="right">{t('nutrition.planned')}</TableCell>
                    <TableCell align="right">{t('nutrition.logged')}</TableCell>
                    <TableCell align="right">{t('nutrition.difference')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>{t('nutrition.energy')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueEnergyKcalKj', {
                            kcal: numberLocale(props.planned.energy, i18n.language),
                            kj: numberLocale(props.planned.energyKj, i18n.language)
                        })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueEnergyKcalKj', {
                            kcal: numberLocale(props.logged.energy, i18n.language),
                            kj: numberLocale(props.logged.energyKj, i18n.language)
                        })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueEnergyKcalKj', {
                            kcal: numberLocale(props.logged.energy - props.planned.energy, i18n.language),
                            kj: numberLocale(props.logged.energyKj - props.planned.energyKj, i18n.language)
                        })}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.protein')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.planned.protein, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.protein, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.protein - props.planned.protein, i18n.language)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.carbohydrates')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.planned.carbohydrates, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.carbohydrates, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.carbohydrates - props.planned.carbohydrates, i18n.language)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell sx={{ pl: 5 }}>{t('nutrition.ofWhichSugars')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.planned.carbohydratesSugar, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.carbohydratesSugar, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.carbohydratesSugar - props.planned.carbohydratesSugar, i18n.language)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.fat')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.planned.fat, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.fat, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.fat - props.planned.fat, i18n.language)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell sx={{ paddingLeft: 5 }}>{t('nutrition.ofWhichSaturated')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.planned.fatSaturated, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.fatSaturated, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.fatSaturated - props.planned.fatSaturated, i18n.language)}
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>{t('nutrition.others')}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.fibres')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.planned.fiber, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.fiber, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.fiber - props.planned.fiber, i18n.language)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.sodium')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.planned.sodium, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.sodium, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.logged.sodium - props.planned.sodium, i18n.language)}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>;
};
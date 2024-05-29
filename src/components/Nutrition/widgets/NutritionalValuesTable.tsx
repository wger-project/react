import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { useTranslation } from "react-i18next";
import { numberGramLocale, numberLocale, numberPercentLocale } from "utils/numbers";

export const NutritionalValuesTable = (props: { values: NutritionalValues }) => {
    const [t, i18n] = useTranslation();

    return <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>{t('nutrition.macronutrient')}</TableCell>
                    <TableCell align="right">{t('total')}</TableCell>
                    <TableCell align="right">{t('nutrition.percentEnergy')}</TableCell>
                    {/*<TableCell align="right">{t('nutrition.gPerBodyKg')}</TableCell>*/}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>{t('nutrition.energy')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueEnergyKcalKj', {
                            kcal: numberLocale(props.values.energy, i18n.language),
                            kj: numberLocale(props.values.energyKj, i18n.language)
                        })}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    {/*<TableCell align="right"></TableCell>*/}
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.protein')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.values.protein, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberPercentLocale(props.values.percent.protein, i18n.language)}
                    </TableCell>
                    {/*<TableCell align="right">...</TableCell>*/}
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.carbohydrates')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.values.carbohydrates, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberPercentLocale(props.values.percent.carbohydrates, i18n.language)}
                    </TableCell>
                    {/*<TableCell align="right">...</TableCell>*/}
                </TableRow>
                <TableRow>
                    <TableCell sx={{ pl: 5 }}>{t('nutrition.ofWhichSugars')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.values.carbohydratesSugar, i18n.language)}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    {/*<TableCell align="right"></TableCell>*/}
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.fat')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.values.fat, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                        {numberPercentLocale(props.values.percent.fat, i18n.language)}
                    </TableCell>
                    {/*<TableCell align="right">...</TableCell>*/}
                </TableRow>
                <TableRow>
                    <TableCell sx={{ pl: 5 }}>{t('nutrition.ofWhichSaturated')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.values.fatSaturated, i18n.language)}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    {/*<TableCell align="right"></TableCell>*/}
                </TableRow>

                <TableRow>
                    <TableCell>{t('nutrition.others')}</TableCell>
                    <TableCell> </TableCell>
                    <TableCell align="right"></TableCell>
                    {/*<TableCell align="right"></TableCell>*/}
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.fiber')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.values.fiber, i18n.language)}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    {/*<TableCell align="right"></TableCell>*/}
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.sodium')}</TableCell>
                    <TableCell align="right">
                        {numberGramLocale(props.values.sodium, i18n.language)}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    {/*<TableCell align="right"></TableCell>*/}
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>;
};
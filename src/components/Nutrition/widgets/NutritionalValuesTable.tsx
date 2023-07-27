import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { useTranslation } from "react-i18next";

export const NutritionalValuesTable = (props: { values: NutritionalValues }) => {
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
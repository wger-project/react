import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { useTranslation } from "react-i18next";

export const LoggedPlannedNutritionalValuesTable = (props: {
    planned: NutritionalValues,
    logged: NutritionalValues
}) => {
    const [t] = useTranslation();

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
                            kcal: props.planned.energy.toFixed(),
                            kj: props.planned.energyKj.toFixed()
                        })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueEnergyKcalKj', {
                            kcal: props.logged.energy.toFixed(),
                            kj: props.logged.energyKj.toFixed()
                        })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueEnergyKcalKj', {
                            kcal: (props.logged.energy - props.planned.energy).toFixed(),
                            kj: (props.logged.energyKj - props.planned.energyKj).toFixed()
                        })}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.protein')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.planned.protein.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.logged.protein.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: (props.logged.protein - props.planned.protein).toFixed() })}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.carbohydrates')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.planned.carbohydrates.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.logged.carbohydrates.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: (props.logged.carbohydrates - props.planned.carbohydrates).toFixed() })}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell sx={{ pl: 5 }}>{t('nutrition.ofWhichSugars')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.planned.carbohydratesSugar.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.logged.carbohydratesSugar.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: (props.logged.carbohydratesSugar - props.planned.carbohydratesSugar).toFixed() })}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.fat')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.planned.fat.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.logged.fat.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: (props.logged.fat - props.planned.fat).toFixed() })}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell sx={{ paddingLeft: 5 }}>{t('nutrition.ofWhichSaturated')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.planned.fatSaturated.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.logged.fatSaturated.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: (props.logged.fatSaturated - props.planned.fatSaturated).toFixed() })}
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
                        {t('nutrition.valueUnitG', { value: props.planned.fibres.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.logged.fibres.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: (props.logged.fibres - props.planned.fibres).toFixed() })}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>{t('nutrition.sodium')}</TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.planned.sodium.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: props.logged.sodium.toFixed() })}
                    </TableCell>
                    <TableCell align="right">
                        {t('nutrition.valueUnitG', { value: (props.logged.sodium - props.planned.sodium).toFixed() })}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>;
};
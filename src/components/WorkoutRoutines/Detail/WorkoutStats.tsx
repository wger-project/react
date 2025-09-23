import BarChartIcon from '@mui/icons-material/BarChart';
import {
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip as MuiTooltip,
    useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { SelectChangeEvent } from '@mui/material/Select';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { useLanguageQuery, useMusclesQuery } from "components/Exercises/queries";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { useRoutineStatsQuery } from "components/WorkoutRoutines/queries/routines";
import {
    DropdownOption,
    formatStatsData,
    getFullStatsData,
    StatGroupBy,
    StatsOptionDropdown,
    StatSubType,
    StatType
} from "components/WorkoutRoutines/widgets/RoutineStatistics";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getLanguageByShortName } from "services";
import { generateChartColors } from "utils/colors";
import { makeLink, WgerLink } from "utils/url";


export const WorkoutStats = () => {

    const theme = useTheme();
    const [t, i18n] = useTranslation();
    const params = useParams<{ routineId: string }>();

    const [selectedValueType, setSelectedValueType] = useState<StatType>(StatType.Volume);
    const [selectedValueSubType, setSelectedValueSubType] = useState<StatSubType>(StatSubType.Daily);
    const [selectedValueGroupBy, setSelectedValueGroupBy] = useState<StatGroupBy>(StatGroupBy.Exercises);

    const routineId = parseInt(params.routineId ?? '');
    if (Number.isNaN(routineId)) {
        return <p>Please pass an integer as the routine id.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const routineQuery = useRoutineDetailQuery(routineId);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const routineStatsQuery = useRoutineStatsQuery(routineId);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const musclesQuery = useMusclesQuery();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const languageQuery = useLanguageQuery();


    if (routineStatsQuery.isLoading || routineQuery.isLoading || musclesQuery.isLoading || languageQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    // TODO: find a better solution for this...
    const language = getLanguageByShortName(
        i18n.language,
        languageQuery.data!
    )!;

    const routine = routineQuery.data!;


    const dropdownOptionsType: DropdownOption[] = [
        { value: StatType.Volume, label: t('routines.volume') },
        { value: StatType.Sets, label: t('routines.sets') },
        { value: StatType.Intensity, label: t('routines.intensity') },
    ];

    const dropdownOptionsSubType: DropdownOption[] = [
        { value: StatSubType.Mesocycle, label: t('routines.currentRoutine') },
        { value: StatSubType.Weekly, label: t('routines.weekly') },
        { value: StatSubType.Iteration, label: t('routines.iteration') },
        { value: StatSubType.Daily, label: t('routines.daily') },
    ];
    const dropdownOptionsGroupBy: DropdownOption[] = [
        { value: StatGroupBy.Exercises, label: t('exercises.exercises') },
        { value: StatGroupBy.Muscles, label: t('exercises.muscles') },
        { value: StatGroupBy.Total, label: t('total') },
    ];

    const handleChangeType = (event: SelectChangeEvent) => {
        setSelectedValueType(event.target.value as StatType);
    };

    const handleChangeSubType = (event: SelectChangeEvent) => {
        setSelectedValueSubType(event.target.value as StatSubType);
    };

    const handleChangeGroupBy = (event: SelectChangeEvent) => {
        setSelectedValueGroupBy(event.target.value as StatGroupBy);
    };

    const statsData = getFullStatsData(
        routineStatsQuery.data!,
        selectedValueType,
        selectedValueSubType,
        selectedValueGroupBy,
        routine.exercises,
        musclesQuery.data!,
        language,
        i18n.language,
    );

    const chartData = formatStatsData(statsData);

    const renderStatistics = () => {


        return (
            <TableContainer>
                <Table size={"small"}>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            {statsData.headers.map(header => <TableCell
                                key={header}
                                sx={{ textAlign: 'right', }}
                            >{header}</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {statsData.data.map((row) => (
                            <TableRow key={row.key}>
                                <TableCell>{row.key}</TableCell>
                                {row.values.map((value, index) => (
                                    <TableCell
                                        key={index}
                                        sx={{ textAlign: 'right', }}
                                    >{value?.toFixed(selectedValueType === StatType.Intensity ? 2 : 0) || ""}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {selectedValueSubType !== StatSubType.Mesocycle && <TableRow>
                            <TableCell sx={{
                                fontWeight: 'bold',
                                backgroundColor: theme.palette.grey.A200
                            }}>{t("total")}</TableCell>
                            {statsData.headers.map(header => (
                                <TableCell key={header}
                                           sx={{
                                               fontWeight: 'bold',
                                               backgroundColor: theme.palette.grey.A200,
                                               textAlign: 'right',
                                           }}>
                                    {statsData.totals[header?.toString()]?.toFixed(selectedValueType === StatType.Intensity ? 2 : 0)}
                                </TableCell>
                            ))}
                        </TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>
        );

    };

    const colorGenerator = generateChartColors(chartData.length);

    return (
        <WgerContainerFullWidth
            title={`${t("routines.statsOverview")} - ${routine.name}`}
            backToUrl={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: routineId })}
            optionsMenu={
                <MuiTooltip title={t('routines.logsOverview')}>
                    <IconButton component="a"
                                href={makeLink(WgerLink.ROUTINE_LOGS_OVERVIEW, i18n.language, { id: routineId })}>
                        <BarChartIcon />
                    </IconButton>
                </MuiTooltip>
            }
        >
            <Grid container spacing={1}>
                <Grid size={2} offset={3}>
                    <StatsOptionDropdown
                        label={"type"}
                        options={dropdownOptionsType}
                        value={selectedValueType}
                        onChange={handleChangeType}
                    />
                </Grid>
                <Grid size={2}>
                    <StatsOptionDropdown
                        label={"sub type"}
                        options={dropdownOptionsSubType}
                        value={selectedValueSubType}
                        onChange={handleChangeSubType}
                    />
                </Grid>
                <Grid size={2}>
                    <StatsOptionDropdown
                        label={"group by"}
                        options={dropdownOptionsGroupBy}
                        value={selectedValueGroupBy}
                        onChange={handleChangeGroupBy}
                    />
                </Grid>

                <Grid size={12}>
                    <Box width="100%" height={400}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart width={500} height={300}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" type="category" allowDuplicatedCategory={false} />
                                <YAxis dataKey="value" />
                                <Tooltip
                                    formatter={(value: number) => Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)} />
                                <Legend
                                    layout={"vertical"}
                                    verticalAlign="middle"
                                    align="right"
                                    wrapperStyle={{ paddingLeft: "20px" }}
                                />
                                {chartData.map((s) => (
                                    <Line dataKey="value" data={s.data} name={s.name} key={s.name}
                                          stroke={colorGenerator.next()!.value!} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Grid>

                <Grid size={12}>
                    <Box height={20} />
                    {renderStatistics()}
                </Grid>
            </Grid>
        </WgerContainerFullWidth>
    );
};




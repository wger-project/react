import {
    Box,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { SelectChangeEvent } from '@mui/material/Select';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { useExercisesQuery, useLanguageQuery, useMusclesQuery } from "components/Exercises/queries";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import {
    DropdownOption,
    getFullStatsData,
    StatGroupBy,
    StatsOptionDropdown,
    StatSubType,
    StatType
} from "components/WorkoutRoutines/widgets/RoutineStatistics";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";


export const WorkoutStats = () => {

    const theme = useTheme();
    const [t, i18n] = useTranslation();
    const params = useParams<{ routineId: string }>();

    const [selectedValueType, setSelectedValueType] = useState<StatType>(StatType.Volume);
    const [selectedValueSubType, setSelectedValueSubType] = useState<StatSubType>(StatSubType.Daily);
    const [selectedValueGroupBy, setSelectedValueGroupBy] = useState<StatGroupBy>(StatGroupBy.Exercises);

    const routineId = parseInt(params.routineId!);
    if (Number.isNaN(routineId)) {
        return <p>Please pass an integer as the routine id.</p>;
    }

    const routineQuery = useRoutineDetailQuery(routineId);
    const musclesQuery = useMusclesQuery();

    // TODO: find a better solution than to load all exercises just to pick up a few...
    const exercisesQuery = useExercisesQuery();
    const languageQuery = useLanguageQuery();


    if (routineQuery.isLoading || musclesQuery.isLoading || exercisesQuery.isLoading || languageQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    // TODO: find a better solution for this...
    const language = getLanguageByShortName(
        i18n.language,
        languageQuery.data!
    )!;

    const routine = routineQuery.data!;


    const dropdownOptionsType: DropdownOption[] = [
        { value: StatType.Volume, label: 'Volume' },
        { value: StatType.Sets, label: 'Sets' },
    ];

    const dropdownOptionsSubType: DropdownOption[] = [
        { value: StatSubType.Mesocycle, label: 'Current routine' },
        { value: StatSubType.Weekly, label: 'Weekly' },
        { value: StatSubType.Iteration, label: 'Iteration' },
        { value: StatSubType.Daily, label: 'Daily' },
    ];
    const dropdownOptionsGroupBy: DropdownOption[] = [
        { value: StatGroupBy.Exercises, label: 'Exercises' },
        { value: StatGroupBy.Muscles, label: 'Muscles' },
        { value: StatGroupBy.Total, label: 'Total' },
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

    const renderStatistics = () => {

        const { headers, data, totals } = getFullStatsData(
            routine.stats,
            selectedValueType,
            selectedValueSubType,
            selectedValueGroupBy,

            exercisesQuery.data!,
            musclesQuery.data!,
            language,
            i18n.language,
            t as (a: string) => string,
        );


        return (
            <TableContainer>
                <Table size={"small"}>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            {headers.map(header => <TableCell
                                key={header}
                                sx={{ textAlign: 'right', }}
                            >{header}</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.key}>
                                <TableCell>{row.key}</TableCell>
                                {row.values.map((value, index) => (
                                    <TableCell key={index} sx={{ textAlign: 'right', }}>{value || ""}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {selectedValueSubType !== StatSubType.Mesocycle && <TableRow>
                            <TableCell sx={{
                                fontWeight: 'bold',

                                backgroundColor: theme.palette.grey.A200
                            }}>{t("total")}</TableCell>
                            {headers.map(header => (
                                <TableCell key={header}
                                           sx={{
                                               fontWeight: 'bold',
                                               backgroundColor: theme.palette.grey.A200,
                                               textAlign: 'right',
                                           }}>
                                    {totals[header.toString()]}
                                </TableCell>
                            ))}
                        </TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>
        );

    };

    return (<>
        <Container maxWidth="lg">
            <Typography variant={"h4"}>
                {t("routines.statsHeader")} - {routine.name}
            </Typography>
            <Box height={10} />

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
                    {renderStatistics()}
                </Grid>
            </Grid>
        </Container>
    </>);
};




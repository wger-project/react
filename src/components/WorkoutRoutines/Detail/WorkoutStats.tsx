import {
    Box,
    Container,
    FormControl,
    MenuItem,
    Select,
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
import InputLabel from '@mui/material/InputLabel';
import { SelectChangeEvent } from '@mui/material/Select';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { useExercisesQuery, useLanguageQuery, useMusclesQuery } from "components/Exercises/queries";
import { LogData } from "components/WorkoutRoutines/models/LogStats";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";
import { getTranslationKey } from "utils/strings";


const enum StatType {
    Volume = "volume",
    Sets = "sets",
}

const enum StatSubType {
    Mesocycle = 'mesocycle',
    Weekly = 'weekly',
    Iteration = 'iteration',
    Daily = 'daily'
}

const enum StatGroupBy {
    Exercises = 'exercises',
    Muscles = 'muscles',
    Total = 'total',
}


export const WorkoutStats = () => {

    const [selectedValueType, setSelectedValueType] = useState<StatType>(StatType.Volume);
    const [selectedValueSubType, setSelectedValueSubType] = useState<StatSubType>(StatSubType.Daily);
    const [selectedValueGroupBy, setSelectedValueGroupBy] = useState<StatGroupBy>(StatGroupBy.Exercises);
    const params = useParams<{ routineId: string }>();

    const routineId = parseInt(params.routineId!);
    if (Number.isNaN(routineId)) {
        return <p>Please pass an integer as the routine id.</p>;
    }


    const theme = useTheme();
    const [t, i18n] = useTranslation();
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
        const columnTotals: { [header: string]: number } = {};

        const statsData = routine.stats[selectedValueType];
        let dataToDisplay: { key: string | number; values: (number | undefined)[] }[] = [];
        let allHeaders: (string | number)[] = [];


        const getHeadersAndData = (groupBy: StatGroupBy, logData: LogData): {
            headers: (string | number)[];
            data: (number | undefined)[]
        } => {
            switch (groupBy) {
                case StatGroupBy.Exercises: {
                    const exercises = Object.keys(logData.exercises).map(e => exercisesQuery.data!.find(ex => ex.id === parseInt(e))?.getTranslation(language)?.name!);
                    // const exercises = Object.keys(logData.exercises).map(e => `exercise ${e}`);
                    const exercisesIds = Object.keys(logData.exercises).map(Number);
                    return { headers: exercises, data: exercisesIds.map(ex => logData.exercises[ex]) };
                }
                case StatGroupBy.Muscles: {
                    const muscles = Object.keys(logData.muscle).map(e => t(getTranslationKey(musclesQuery.data!.find(m => m.id === parseInt(e))?.nameEn!)));
                    // const muscles = Object.keys(logData.muscle).map(e =>  `muscle ${e}`);
                    const musclesIds = Object.keys(logData.muscle).map(Number);
                    return { headers: muscles, data: musclesIds.map(ms => logData.muscle[ms]) };

                }
                case StatGroupBy.Total:
                    return { headers: [t('total')], data: [logData.total] };

                default:
                    return { headers: [], data: [] };
            }
        };


        const getAllHeaders = (data: any) => {
            let headers: (string | number)[] = [];

            switch (selectedValueSubType) {
                case StatSubType.Mesocycle:
                    headers = getHeadersAndData(selectedValueGroupBy, statsData.mesocycle).headers;
                    break;
                case StatSubType.Iteration:
                    for (const iteration in statsData.iteration) {
                        headers = headers.concat(getHeadersAndData(selectedValueGroupBy, statsData.iteration[iteration]).headers);
                    }
                    break;
                case StatSubType.Weekly:
                    for (const week in statsData.weekly) {
                        headers = headers.concat(getHeadersAndData(selectedValueGroupBy, statsData.weekly[week]).headers);
                    }
                    break;
                case StatSubType.Daily:
                    for (const date in statsData.daily) {
                        headers = headers.concat(getHeadersAndData(selectedValueGroupBy, statsData.daily[date]).headers);
                    }
                    break;
            }

            // Create a set to remove duplicate values
            return [...new Set(headers)];

        };
        allHeaders = getAllHeaders(statsData);

        // Initialize column totals
        allHeaders.forEach(header => {
            columnTotals[header.toString()] = 0;
        });


        /*
         * Accumulates the totals within a loop
         */
        function calculateLoopSum(data: (number | undefined)[], logData: LogData) {
            const values = allHeaders.map(header => data[getHeadersAndData(selectedValueGroupBy, logData).headers.indexOf(header)]);
            values.forEach((value, index) => {
                if (typeof value === 'number' && typeof allHeaders[index] === 'string') {
                    columnTotals[allHeaders[index]] += value;
                } else if (typeof value === 'number' && typeof allHeaders[index] === 'number') {
                    columnTotals[allHeaders[index].toString()] += value; // handle number headers as well
                }
            });
        }

        //Data
        switch (selectedValueSubType) {
            case StatSubType.Mesocycle: {
                const { data } = getHeadersAndData(selectedValueGroupBy, statsData.mesocycle);
                dataToDisplay = [{
                    key: t("total"),
                    values: allHeaders.map(header => data[allHeaders.indexOf(header)])
                }];
                break;
            }
            case StatSubType.Iteration: {
                dataToDisplay = Object.entries(statsData.iteration).map(([iteration, logData]) => {
                    const { data } = getHeadersAndData(selectedValueGroupBy, logData);
                    calculateLoopSum(data, logData);

                    return {
                        key: `iteration ${iteration}`,
                        values: allHeaders.map(header => data[getHeadersAndData(selectedValueGroupBy, logData).headers.indexOf(header)])
                    };
                });
                break;
            }
            case StatSubType.Weekly: {
                dataToDisplay = Object.entries(statsData.weekly).map(([week, logData]) => {
                    const { data } = getHeadersAndData(selectedValueGroupBy, logData);
                    calculateLoopSum(data, logData);

                    return {
                        key: `week ${week}`,
                        values: allHeaders.map(header => data[getHeadersAndData(selectedValueGroupBy, logData).headers.indexOf(header)])
                    };
                });
                break;
            }
            case StatSubType.Daily: {
                dataToDisplay = Object.entries(statsData.daily).map(([date, logData]) => {
                    const { data } = getHeadersAndData(selectedValueGroupBy, logData);
                    calculateLoopSum(data, logData);

                    return {
                        key: new Date(date).toLocaleDateString(i18n.language),
                        values: allHeaders.map(header => data[getHeadersAndData(selectedValueGroupBy, logData).headers.indexOf(header)])
                    };
                });
                break;
            }
            default:
                return null;
        }


        return (
            <TableContainer>
                <Table size={"small"}>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            {allHeaders.map(header => <TableCell
                                key={header}
                                sx={{ textAlign: 'right', }}
                            >{header}</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataToDisplay.map((row) => (
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
                            {allHeaders.map(header => (
                                <TableCell key={header}
                                           sx={{
                                               fontWeight: 'bold',
                                               backgroundColor: theme.palette.grey.A200,
                                               textAlign: 'right',
                                           }}>
                                    {columnTotals[header.toString()]}
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


export interface DropdownOption {
    value: string | number;
    label: string;
}

interface DropdownProps {
    label: string;
    options: DropdownOption[];
    value: string;
    onChange: (event: SelectChangeEvent) => void;
}

export const StatsOptionDropdown: React.FC<DropdownProps> = ({ label, options, value, onChange }) => {

    return (
        <FormControl fullWidth>
            <InputLabel id={`${label}-label`}>{label}</InputLabel>
            <Select
                labelId={`${label}-label`}
                id={`${label}-select`}
                value={value}
                label={label}
                onChange={onChange}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};


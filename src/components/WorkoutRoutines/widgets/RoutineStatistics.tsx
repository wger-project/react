import { FormControl, MenuItem, Select } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import { SelectChangeEvent } from "@mui/material/Select";
import { Exercise } from "components/Exercises/models/exercise";
import { Language } from "components/Exercises/models/language";
import { Muscle } from "components/Exercises/models/muscle";
import { LogData, RoutineStatsData } from "components/WorkoutRoutines/models/LogStats";
import i18n from 'i18next';
import React from "react";
import { getTranslationKey } from "utils/strings";

export const enum StatType {
    Volume = "volume",
    Sets = "sets",
    Intensity = "intensity",
}

export const enum StatSubType {
    Mesocycle = 'mesocycle',
    Weekly = 'weekly',
    Iteration = 'iteration',
    Daily = 'daily'
}

export const enum StatGroupBy {
    Exercises = 'exercises',
    Muscles = 'muscles',
    Total = 'total',
}

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

interface FullStatsData {
    headers: string[],
    data: { key: string | number, values: (number | undefined)[] }[],
    totals: { [p: string]: number }
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

export function getHumanReadableHeaders(exerciseList: Exercise[], language: Language, muscleList: Muscle[], groupBy: StatGroupBy, logData: LogData,) {
    switch (groupBy) {
        case StatGroupBy.Exercises: {
            const exercises = Object.keys(logData.exercises).map(e => exerciseList.find(ex => ex.id === parseInt(e))?.getTranslation(language)?.name!);
            // const exercises = Object.keys(logData.exercises).map(e => `exercise ${e}`);
            const exercisesIds = Object.keys(logData.exercises).map(Number);
            return { headers: exercises, data: exercisesIds.map(ex => logData.exercises[ex]) };
        }
        case StatGroupBy.Muscles: {
            const muscles = Object.keys(logData.muscle).map(e => i18n.t(getTranslationKey(muscleList.find(m => m.id === parseInt(e))?.nameEn!)));
            // const muscles = Object.keys(logData.muscle).map(e =>  `muscle ${e}`);
            const musclesIds = Object.keys(logData.muscle).map(Number);
            return { headers: muscles, data: musclesIds.map(ms => logData.muscle[ms]) };

        }
        case StatGroupBy.Total:
            return { headers: [i18n.t('total')], data: [logData.total] };

        default:
            return { headers: [], data: [] };
    }
}

export const getFullStatsData = (
    stats: RoutineStatsData,
    selectedValueType: StatType,
    selectedValueSubType: StatSubType,
    selectedValueGroupBy: StatGroupBy,
    exerciseList: Exercise[],
    muscleList: Muscle[],
    language: Language,
    languageCode: string,
): FullStatsData => {
    const columnTotals: { [header: string]: number } = {};

    const statsData = stats[selectedValueType];
    let dataToDisplay: { key: string | number; values: (number | undefined)[] }[] = [];
    let allHeaders: string[] = [];

    const calculateStatsData = (groupBy: StatGroupBy, logData: LogData) => getHumanReadableHeaders(
        exerciseList,
        language,
        muscleList,
        groupBy,
        logData
    );


    const getAllHeaders = (data: any) => {
        let headers: string[] = [];

        switch (selectedValueSubType) {
            case StatSubType.Mesocycle:
                headers = calculateStatsData(selectedValueGroupBy, statsData.mesocycle).headers;
                break;
            case StatSubType.Iteration:
                for (const iteration in statsData.iteration) {
                    headers = headers.concat(calculateStatsData(selectedValueGroupBy, statsData.iteration[iteration]).headers);
                }
                break;
            case StatSubType.Weekly:
                for (const week in statsData.weekly) {
                    headers = headers.concat(calculateStatsData(selectedValueGroupBy, statsData.weekly[week]).headers);
                }
                break;
            case StatSubType.Daily:
                for (const date in statsData.daily) {
                    headers = headers.concat(calculateStatsData(selectedValueGroupBy, statsData.daily[date]).headers);
                }
                break;
        }

        // Create a set to remove duplicate values
        return [...new Set(headers)];
    };
    allHeaders = getAllHeaders(statsData);

    // Initialize column totals
    allHeaders.forEach(header => {
        columnTotals[header] = 0;
    });


    /*
     * Accumulates the totals within a loop
     */
    function calculateLoopSum(data: (number | undefined)[], logData: LogData) {
        const values = allHeaders.map(header => data[calculateStatsData(selectedValueGroupBy, logData).headers.indexOf(header)]);

        values.forEach((value, index) => {
            if (value === undefined) {
                return;
            }

            columnTotals[allHeaders[index]] += value;
        });
    }

    //Data
    switch (selectedValueSubType) {
        case StatSubType.Mesocycle: {
            const { data } = calculateStatsData(selectedValueGroupBy, statsData.mesocycle);

            dataToDisplay = [{
                key: i18n.t("total"),
                values: allHeaders.map(header => data[allHeaders.indexOf(header)])
            }];
            break;
        }
        case StatSubType.Iteration: {
            dataToDisplay = Object.entries(statsData.iteration).map(([iteration, logData]) => {
                const { data } = calculateStatsData(selectedValueGroupBy, logData);
                calculateLoopSum(data, logData);

                return {
                    key: `iteration ${iteration}`,
                    values: allHeaders.map(header => data[calculateStatsData(selectedValueGroupBy, logData).headers.indexOf(header)])
                };
            });
            break;
        }
        case StatSubType.Weekly: {
            dataToDisplay = Object.entries(statsData.weekly).map(([week, logData]) => {
                const { data } = calculateStatsData(selectedValueGroupBy, logData);
                calculateLoopSum(data, logData);

                return {
                    key: `week ${week}`,
                    values: allHeaders.map(header => data[calculateStatsData(selectedValueGroupBy, logData).headers.indexOf(header)])
                };
            });
            break;
        }
        case StatSubType.Daily: {
            dataToDisplay = Object.entries(statsData.daily).map(([date, logData]) => {
                const { data } = calculateStatsData(selectedValueGroupBy, logData);
                calculateLoopSum(data, logData);

                return {
                    key: new Date(date).toLocaleDateString(languageCode),
                    values: allHeaders.map(header => data[calculateStatsData(selectedValueGroupBy, logData).headers.indexOf(header)])
                };
            });
            break;
        }
    }

    return { headers: allHeaders, data: dataToDisplay, totals: columnTotals };
};

interface StatsChartData {
    name: string,
    data: { category: string, value: number | undefined }[];
}

/*
 * Converts the data from getFullStatsData to a format that can be directly
 * used by the recharts library
 */
export function formatStatsData(fullStatsData: FullStatsData): StatsChartData[] {
    const formattedData: StatsChartData[] = [];

    fullStatsData.headers.forEach((header) => {
        formattedData.push({ name: header, data: [] });
    });

    fullStatsData.data.forEach((row) => {
        row.values.forEach((value, index) => {
            const header = fullStatsData.headers[index];

            if (header) {
                formattedData.find(item => item.name === header)?.data.push({
                    category: row.key.toString(),
                    value: value
                });
            }
        });
    });

    return formattedData;
}
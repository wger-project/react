import { Box, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useBodyWeightQuery } from "components/BodyWeight/queries";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { useProfileQuery } from "components/User/queries/profile";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";

const bmiRanges = [
    { range: "obese", color: "#FF5733", min: 30, max: 100 },
    { range: "overweight", color: "#FFC107", min: 25, max: 30 },
    { range: "normal", color: "#90EE90", min: 18.5, max: 25 },
    { range: "underweight", color: "#FFC300", min: 0, max: 18.5 },
];

const getRangeColor = (name: string) => {
    const range = bmiRanges.find((bmiRange) => bmiRange.range === name);
    return range ? range.color : 'gray';
};

export const BmiCalculator = () => {
    const [t] = useTranslation();

    const weightQuery = useBodyWeightQuery();
    const profileQuery = useProfileQuery();

    const [height, setHeight] = useState<number | null>();
    const [weight, setWeight] = useState<number | null>();

    // Set default weight from last weight entry
    useEffect(() => {
        if (weightQuery.data && weightQuery.data.length > 0) {
            const lastWeightEntry = weightQuery.data[0];
            const weightInKg = profileQuery.data?.useMetric
                ? lastWeightEntry.weight
                : lastWeightEntry.weight * 0.453592; // Convert lb to kg
            setWeight(weightInKg);
        }
    }, [weightQuery.data, profileQuery.data]);

    useEffect(() => {
        if (profileQuery.data?.height) {
            setHeight(profileQuery.data.height);
        }
    }, [profileQuery.data]);


    const calculateBMI = () => {
        if (height && weight) {
            const heightInMeters = height / 100;
            return weight / (heightInMeters * heightInMeters);
        }
        return null;
    };

    const bmi = calculateBMI();

    if (weightQuery.isLoading || profileQuery.isLoading) {
        return <LoadingPlaceholder />;
    }


    // Generate chart data with BMI values for different heights
    const chartData: { height: number; [key: string]: number }[] = [];
    for (let h = 140; h <= 220; h += 10) {
        const heightInMeters = h / 100;
        const dataPoint: { height: number; [key: string]: number } = { height: h };
        let cumulativeWeight = 0;

        bmiRanges.forEach((range, index) => {
            const bmiValue = range.max > 100 ? 100 : range.max;
            let weightForRange =
                bmiValue * heightInMeters * heightInMeters - cumulativeWeight;

            // Cap the weightForRange at 150kg
            weightForRange = Math.min(weightForRange, 150 - cumulativeWeight);

            // Correctly set the data point for the stacked area chart
            if (index === 0) {
                dataPoint[range.range] = weightForRange;
            } else {
                dataPoint[range.range] =
                    dataPoint[bmiRanges[index - 1].range] + weightForRange;
            }

            cumulativeWeight = Math.min(bmiValue * heightInMeters * heightInMeters, 150); // Cap cumulative weight as well
        });
        chartData.push(dataPoint);
    }


    return (
        <WgerContainerRightSidebar
            title={t('bmi.calculator')}
            mainContent={<>
                <Stack spacing={2}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t('height')}
                                fullWidth
                                slotProps={{
                                    input: { endAdornment: <Typography>{t('cm')}</Typography> }
                                }}
                                type="number"
                                value={height ?? ""}
                                onChange={(e) => setHeight(parseFloat(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t('weight')}
                                slotProps={{
                                    input: { endAdornment: <Typography>{t('server.kg')}</Typography> }
                                }}
                                fullWidth
                                type="number"
                                value={weight ?? ""}
                                onChange={(e) => setWeight(parseFloat(e.target.value))}
                            />
                        </Grid>
                    </Grid>


                    {bmi !== null && <Typography variant="h6">
                        {t('bmi.result', { value: bmi.toFixed(1) })}
                    </Typography>
                    }
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData}>
                            <XAxis
                                dataKey="height"
                                type="number"
                                domain={[140, 220]}
                                unit="cm"
                            />
                            <YAxis
                                domain={[40, 150]}
                                tickFormatter={(value) => Math.round(value).toString()} // Format as integers
                                unit="kg"
                            />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip
                                // @ts-ignore
                                formatter={(value, name) => [Math.round(value as number), t('bmi.' + (name as string))]}
                            />

                            {bmiRanges.map((range) => (
                                <Area
                                    key={range.range}
                                    type="monotone"
                                    dataKey={range.range}
                                    stroke={"black"}
                                    // stroke={range.color}
                                    fill={range.color}
                                    fillOpacity={0.8}
                                />
                            ))}

                            {bmi !== null &&
                                <ReferenceDot
                                    x={height!}
                                    y={weight!}
                                    r={8}
                                    fill="black"
                                    stroke="none"
                                />}

                        </AreaChart>
                    </ResponsiveContainer>
                    <Stack direction={"row"} justifyContent="center">
                        <Box
                            height={20}
                            width={20}
                            sx={{ backgroundColor: getRangeColor('obese') }} />
                        {t('bmi.obese')}

                        <Box
                            height={20}
                            width={20}
                            sx={{ backgroundColor: getRangeColor('overweight'), marginLeft: 2 }} />
                        {t('bmi.overweight')}

                        <Box
                            height={20}
                            width={20}
                            sx={{ backgroundColor: getRangeColor('normal'), marginLeft: 2 }} />
                        {t('bmi.normal')}

                        <Box
                            height={20}
                            width={20}
                            sx={{ backgroundColor: getRangeColor('underweight'), marginLeft: 2 }} />
                        {t('bmi.underweight')}
                    </Stack>

                </Stack>
            </>}
        />
    );
};
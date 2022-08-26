import React from "react";
import { Box, Container, Stack, Step, StepContent, StepLabel, Stepper, Typography, } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Step1Basics } from "components/Exercises/Add/Step1Basics";
import { Step2Variations } from "components/Exercises/Add/Step2Variations";
import { Step3Description } from "components/Exercises/Add/Step3Description";
import { Step4Translations } from "components/Exercises/Add/Step4Translations";
import { Step5Images } from "components/Exercises/Add/Step5Images";
import { Step6Overview } from "components/Exercises/Add/Step6Overview";
import * as exerciseState from "state";

export type StepProps = {
    onContinue?: () => void;
    onBack?: React.MouseEventHandler<HTMLButtonElement>;
};

export const AddExerciseStepper = () => {
    const [t] = useTranslation();
    const [activeStep, setActiveStep] = React.useState(0);

    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };
    
    return (
        <exerciseState.ExerciseStateProvider>
            <Container maxWidth="md">
                <Stack direction={"row"}>
                    <Typography gutterBottom variant="h3" component="div">
                        {t("exercises.contributeExercise")}
                    </Typography>
                </Stack>
                <Box>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        <Step key={1}>
                            <StepLabel>{t("exercises.step1HeaderBasics")}</StepLabel>
                            <StepContent>
                                <Step1Basics
                                    onContinue={handleNext}
                                />
                            </StepContent>
                        </Step>
                        <Step key={2}>
                            <StepLabel>{t("exercises.variations")}</StepLabel>
                            <StepContent>
                                <Step2Variations
                                    onContinue={handleNext}
                                    onBack={handleBack}
                                />
                            </StepContent>
                        </Step>
                        <Step key={3}>
                            <StepLabel>{t("description")}</StepLabel>
                            <StepContent>
                                <Step3Description
                                    onContinue={handleNext}
                                    onBack={handleBack}
                                />
                            </StepContent>
                        </Step>
                        <Step key={4}>
                            <StepLabel>{t("translation")}</StepLabel>
                            <StepContent>
                                <Step4Translations
                                    onContinue={handleNext}
                                    onBack={handleBack}
                                />
                            </StepContent>
                        </Step>
                        <Step key={5}>
                            <StepLabel>{t("images")}</StepLabel>
                            <StepContent>
                                <Step5Images
                                    onContinue={handleNext}
                                    onBack={handleBack}
                                />
                            </StepContent>
                        </Step>
                        <Step key={6}>
                            <StepLabel>{t("overview")}</StepLabel>
                            <StepContent>
                                <Step6Overview
                                    onBack={handleBack}
                                />
                            </StepContent>
                        </Step>
                    </Stepper>
                </Box>
            </Container>
        </exerciseState.ExerciseStateProvider>
    );
};

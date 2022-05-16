import React from 'react';
import { Box, Button, Container, Paper, Stack, Step, StepContent, StepLabel, Stepper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Step1Basics } from "components/Exercises/Add/Step1Basics";
import { Step2Variations } from "components/Exercises/Add/Step2Variations";
import { Step3Description } from "components/Exercises/Add/Step3Description";
import { Step4Translations } from "components/Exercises/Add/Step4Translations";
import { Step5Images } from "components/Exercises/Add/Step5Images";


export const AddExerciseStepper = () => {

    const [t] = useTranslation();
    const [activeStep, setActiveStep] = React.useState(0);
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };


    return (
        <Container maxWidth="lg">
            <Stack direction={'row'}>
                <Typography gutterBottom variant="h3" component="div">
                    {t('exercises.contribute-exercise')}
                </Typography>
            </Stack>
            <Box>
                <Typography gutterBottom variant="h5" component="div">
                    {t('exercises.contribute-exercise-description')}
                </Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                    <Step key={1}>
                        <StepLabel>
                            Basics in English
                        </StepLabel>
                        <StepContent>
                            <Step1Basics onContinue={handleNext} onBack={handleBack} />
                        </StepContent>
                    </Step>
                    <Step key={2}>
                        <StepLabel>
                            Variations
                        </StepLabel>
                        <StepContent>
                            <Step2Variations onContinue={handleNext} onBack={handleBack} />
                        </StepContent>
                    </Step>
                    <Step key={3}>
                        <StepLabel>
                            Description
                        </StepLabel>
                        <StepContent>
                            <Step3Description onContinue={handleNext} onBack={handleBack} />
                        </StepContent>
                    </Step>
                    <Step key={4}>
                        <StepLabel>
                            Translation
                        </StepLabel>
                        <StepContent>
                            <Step4Translations onContinue={handleNext} onBack={handleBack} />
                        </StepContent>
                    </Step>
                    <Step key={5}>
                        <StepLabel>
                            Images
                        </StepLabel>
                        <StepContent>
                            <Step5Images onContinue={handleNext} onBack={handleBack} />
                        </StepContent>
                    </Step>

                </Stepper>
                {activeStep === 5 && (
                    <Paper square sx={{ p: 3 }}>
                        <Typography>Exercise was successfully submitted!</Typography>
                        <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                            Reset
                        </Button>
                    </Paper>
                )}
            </Box>
        </Container>
    );
};
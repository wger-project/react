import React from "react";
import {
	Box,
	Button,
	Container,
	Paper,
	Stack,
	Step,
	StepContent,
	StepLabel,
	Stepper,
	Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Step1Basics } from "components/Exercises/Add/Step1Basics";
import { Step2Variations } from "components/Exercises/Add/Step2Variations";
import { Step3Description } from "components/Exercises/Add/Step3Description";
import { Step4Translations } from "components/Exercises/Add/Step4Translations";
import { Step5Images } from "components/Exercises/Add/Step5Images";
import { addExerciseDataType } from "components/Exercises/models/exerciseBase";

export const AddExerciseStepper = () => {
    const [t] = useTranslation();
    const [activeStep, setActiveStep] = React.useState(0);

    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const emptyExerciseData = {
        nameEn: "",
        descriptionEn: "",
        alternativeNamesEn: [],
        category: "",
        muscles: [],
        musclesSecondary: [],
        variationId: null,
        languageId: null,
        nameTranslation: "",
        alternativeNamesTranslation: [],
        descriptionTranslation: "",
        images: [],
    };
    const [newExerciseData, setNewExerciseData] =
        React.useState<addExerciseDataType>(emptyExerciseData);

    return (
        <Container maxWidth="md">
            <Stack direction={"row"}>
                <Typography gutterBottom variant="h3" component="div">
                    {t("exercises.contribute-exercise")}
                </Typography>
            </Stack>

            <Stack>
                <Paper sx={{ p: 1, bgcolor: "lightgray" }}>
                    <Typography gutterBottom variant="h5" component="div">
                        Debug submitted data
                    </Typography>
                    <ul>
                        <li>Name EN: {newExerciseData!.nameEn}</li>
                        <li>Description EN: {newExerciseData!.descriptionEn}</li>
                        <li>
                            Alternative names EN:{" "}
                            {newExerciseData!.alternativeNamesEn.join(", ")}
                        </li>
                        <li>Description EN: {newExerciseData!.descriptionEn}</li>
                        <li>Category ID: {newExerciseData!.category}</li>
                        <li>Muscles: {newExerciseData!.muscles}</li>
                        <li>Muscles secondary: {newExerciseData!.musclesSecondary}</li>
                        <li>Variation ID: {newExerciseData!.variationId}</li>
                        <li>Language ID: {newExerciseData!.languageId}</li>
                        <li>Name translation: {newExerciseData!.nameTranslation}</li>
                        <li>
                            Description translation: {newExerciseData!.descriptionTranslation}
                        </li>
                        <li>
                            Alternative names translation:{" "}
                            {newExerciseData!.alternativeNamesTranslation}
                        </li>
                        <li>Images: {newExerciseData!.images}</li>
                    </ul>
                </Paper>
            </Stack>
            <Box>
                <Typography gutterBottom variant="h5" component="div">
                    {t("exercises.contribute-exercise-description")}
                </Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                    <Step key={1}>
                        <StepLabel>Basics in English</StepLabel>
                        <StepContent>
                            <Step1Basics
                                onContinue={handleNext}
                                setNewExerciseData={setNewExerciseData}
                                newExerciseData={newExerciseData}
                            />
                        </StepContent>
                    </Step>
                    <Step key={2}>
                        <StepLabel>Variations</StepLabel>
                        <StepContent>
                            <Step2Variations onContinue={handleNext} onBack={handleBack} />
                        </StepContent>
                    </Step>
                    <Step key={3}>
                        <StepLabel>Description</StepLabel>
                        <StepContent>
                            <Step3Description
                                onContinue={handleNext}
                                onBack={handleBack}
                                setNewExerciseData={setNewExerciseData}
                                newExerciseData={newExerciseData}
                            />
                        </StepContent>
                    </Step>
                    <Step key={4}>
                        <StepLabel>Translation</StepLabel>
                        <StepContent>
                            <Step4Translations onContinue={handleNext}
                                               onBack={handleBack}
                                               setNewExerciseData={setNewExerciseData}
                                               newExerciseData={newExerciseData} />
                        </StepContent>
                    </Step>
                    <Step key={5}>
                        <StepLabel>Images</StepLabel>
                        <StepContent>
                            <Step5Images
                                onContinue={handleNext}
                                onBack={handleBack}
                                setNewExerciseData={setNewExerciseData}
                                newExerciseData={newExerciseData}
                            />
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

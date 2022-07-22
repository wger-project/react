import { Box, Button, IconButton, ImageListItem, ImageListItemBar, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CollectionsIcon from '@mui/icons-material/Collections';
import ImageList from '@mui/material/ImageList';
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { ImageFormData } from "components/Exercises/models/exerciseBase";

export const Step5Images = ({
                                setNewExerciseData,
                                newExerciseData,
                                onContinue,
                                onBack,
                            }: StepProps) => {
    const [t] = useTranslation();
    const [images, setImages] = useState<ImageFormData[]>([]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }
        const [uploadedFile] = e.target.files;
        const objectURL = URL.createObjectURL(uploadedFile);

        setImages(images?.concat({ url: objectURL, file: uploadedFile }));
    };

    const handleDeleteImage = (imageURL: string) => {
        const updatedImagesURLS = images.filter(i => i.url !== imageURL);
        setImages(updatedImagesURLS);
    };

    const handleContinue = () => {
        setNewExerciseData({ ...newExerciseData, images: images });
        onContinue!();
    };

    return (
        <div>
            <Typography>
                {t("exercises.compatibleImagesCC")}
                
            </Typography>
            <Stack direction={"row"} justifyContent="center">
                <div>
                    <label htmlFor="camera-input">
                        <CameraAltIcon />
                    </label>
                    <input
                        style={{ display: "none" }}
                        id="camera-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="image-input">
                        <CollectionsIcon />
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        name="image-file"
                        id="image-input"
                        style={{ display: "none" }}
                        onChange={handleFileInputChange}
                    />
                </div>
            </Stack>
            <ImageList
                cols={3}
                style={{ maxHeight: "400px", }}>
                {images.map(imageEntry => (
                    <ImageListItem key={imageEntry.url}>
                        <img
                            style={{ maxHeight: "400px", maxWidth: "400px" }}
                            src={imageEntry.url}
                            alt=""
                            loading="lazy"
                        />
                        <ImageListItemBar

                            actionIcon={
                                <IconButton
                                    // title="abc"
                                    // subtitle="def"
                                    onClick={() => handleDeleteImage(imageEntry.url)}
                                    sx={{ color: 'white' }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            }
                        />
                    </ImageListItem>
                ))}
            </ImageList>
            <Typography>
                {t("forms.supportedImageFormats")}
            </Typography>
            <Box sx={{ mb: 2 }}>
                <div>
                    <Button
                        variant="contained"
                        onClick={handleContinue}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        {t("continue")}
                    </Button>
                    <Button disabled={false} onClick={onBack} sx={{ mt: 1, mr: 1 }}>
                        {t("back")}
                    </Button>
                </div>
            </Box>
        </div>
    );
};

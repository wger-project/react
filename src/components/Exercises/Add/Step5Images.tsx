import { Box, Button, IconButton, ImageListItem, ImageListItemBar, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { addExerciseDataType } from "../models/exerciseBase";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CollectionsIcon from '@mui/icons-material/Collections';
import ImageList from '@mui/material/ImageList';


type Step5BasicsProps = {
    onContinue: () => void;
    onBack: () => void;
    setNewExerciseData: React.Dispatch<React.SetStateAction<addExerciseDataType>>;
    newExerciseData: addExerciseDataType;
};

export const Step5Images = ({
                                setNewExerciseData,
                                newExerciseData,
                                onContinue,
                                onBack,
                            }: Step5BasicsProps) => {
    const [t] = useTranslation();
    const [imagesURLS, setImagesURLS] = useState<string[]>([]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }
        const [uploadedFile] = e.target.files;
        const objectURL = URL.createObjectURL(uploadedFile);

        setImagesURLS(imagesURLS?.concat(objectURL));
    };

    const handleDeleteImage = (imageURL: string) => {
        const updatedImagesURLS = imagesURLS.filter(i => i !== imageURL);
        setImagesURLS(updatedImagesURLS);
    };

    const handleContinue = () => {
        setNewExerciseData({ ...newExerciseData, images: imagesURLS });
        onContinue();
    };

    return (
        <div>
            <Typography>
                Images must be compatible with the CC BY SA license. If in doubt, upload
                only photos you've taken yourself.
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
                {imagesURLS.map(imageURL => (
                    <ImageListItem key={imageURL}>
                        <img
                            style={{ maxHeight: "400px", maxWidth: "400px" }}
                            src={imageURL}
                            alt=""
                            loading="lazy"
                        />
                        <ImageListItemBar

                            actionIcon={
                                <IconButton
                                    // title="abc"
                                    // subtitle="def"
                                    sx={{ color: 'white' }}
                                >
                                    <DeleteOutlineIcon onClick={() => handleDeleteImage(imageURL)} />
                                </IconButton>
                            }
                        />
                    </ImageListItem>
                ))}
            </ImageList>
            <Typography>
                Only JPEG, PNG and WEBP files below 20Mb are supported
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

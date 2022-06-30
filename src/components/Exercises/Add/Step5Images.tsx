import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@mui/styles";
import { addExerciseDataType } from "../models/exerciseBase";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CollectionsIcon from '@mui/icons-material/Collections';

const useStyles = makeStyles({
    root: {
        marginTop: "2rem",
    },
    icons: {
        // some CSS that accesses the theme
        // backgroundColor: "green",
        display: "flex",
        justifyContent: "center",
        gap: "2rem",
    },
    svg: {
        height: "6vh",
        cursor: "pointer",
    },
    images: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.5rem",
        margin: "1rem auto",
    },
    imageWrapper: {
        position: "relative",
        width: "30vw",
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "0.5rem",
    },
    deleteIcon: {
        position: "absolute",
        bottom: "1rem",
        right: "1rem",
        height: "3rem",
        width: "3rem",
        color: "#fff",
        cursor: "pointer",
    },
});

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
    const classes = useStyles();
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
        <div className={classes.root}>
            <Typography>
                Images must be compatible with the CC BY SA license. If in doubt, upload
                only photos you've taken yourself.
            </Typography>
            <div className={classes.icons}>
                <div>
                    <label htmlFor="camera-input">
                        <CameraAltIcon className={classes.svg} />
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
                        <CollectionsIcon className={classes.svg} />
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
            </div>
            <div className={classes.images}>
                {imagesURLS?.map(imageURL => {
                    return (

                        <div key={imageURL} className={classes.imageWrapper}>
                            <img className={classes.image} src={imageURL} alt={imageURL} />
                            <DeleteOutlineIcon
                                onClick={() => handleDeleteImage(imageURL)}
                                className={classes.deleteIcon} />
                        </div>
                    );
                })}
            </div>
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

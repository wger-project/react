import { Box, Button, Card, CardActions, CardMedia } from "@mui/material";
import { deleteExerciseImage, postExerciseImage } from "services/image";
import React from "react";
import { useTranslation } from "react-i18next";
import { ExerciseImage } from "components/Exercises/models/image";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useProfileQuery } from "components/User/queries/profile";

type ImageCardProps = {
    image: ExerciseImage;
    canDelete: boolean
};

export const ImageEditCard = ({ image, canDelete }: ImageCardProps) => {
    const [t] = useTranslation();
    return <Card>
        <CardMedia
            component="img"
            image={image.url}
            sx={{ height: 120 }}
            alt=""
        />
        <CardActions>
            {canDelete &&
                <Button
                    color="primary"
                    onClick={() => deleteExerciseImage(image.id)}
                >
                    {t('delete')}
                </Button>}
        </CardActions>
    </Card>;
};

type AddImageCardProps = {
    baseId: number;
};

export const AddImageCard = ({ baseId }: AddImageCardProps) => {

    const [t] = useTranslation();
    const profileQuery = useProfileQuery();

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }
        const [uploadedFile] = e.target.files;
        if (profileQuery.isSuccess) {
            await postExerciseImage(baseId, profileQuery.data!.username, uploadedFile);
        }
    };

    return <Card>
        <CardMedia>
            <Box sx={{ backgroundColor: "lightgray", height: 120 }}
                 display="flex"
                 alignItems="center"
                 justifyContent="center">
                <AddCircleIcon sx={{ fontSize: 80, color: "gray" }} />
            </Box>
        </CardMedia>
        <CardActions>
            <Button component="label">
                {t('add')}
                <input
                    style={{ display: "none" }}
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileInputChange}
                />
            </Button>
        </CardActions>
    </Card>;
};

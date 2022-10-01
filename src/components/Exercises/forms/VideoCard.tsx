import { Box, Button, Card, CardActions, CardMedia } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { ExerciseVideo } from "components/Exercises/models/video";
import { deleteExerciseVideo, postExerciseVideo } from "services";

type VideoCardProps = {
    video: ExerciseVideo;
    canDelete: boolean;
};

export const VideoEditCard = ({ video, canDelete }: VideoCardProps) => {
    const [t] = useTranslation();

    return <Card>
        <CardMedia
            component={'video'}
            src={video.url}
            sx={{ height: 120 }}
            controls
            preload="metadata"
        />
        <CardActions>
            {canDelete &&
                <Button
                    color="primary"
                    onClick={() => deleteExerciseVideo(video.id)}
                >
                    {t('delete')}
                </Button>
            }
        </CardActions>
    </Card>;
};


type AddVideoCardProps = {
    baseId: number;
};

export const AddVideoCard = ({ baseId }: AddVideoCardProps) => {

    const [t] = useTranslation();

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }
        const [uploadedFile] = e.target.files;
        await postExerciseVideo(baseId, uploadedFile);
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
                    accept="video/*"
                    capture="environment"
                    onChange={handleFileInputChange}
                />
            </Button>
        </CardActions>
    </Card>;
};

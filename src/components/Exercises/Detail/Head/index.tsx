import { ContentCopy } from "@mui/icons-material";
import AddIcon from '@mui/icons-material/Add';
import CachedIcon from '@mui/icons-material/Cached';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhotoIcon from "@mui/icons-material/Photo";
import RedoIcon from '@mui/icons-material/Redo';
import {
    Avatar,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { ExerciseBase } from 'components/Exercises/models/exerciseBase';
import { ExerciseTranslation } from 'components/Exercises/models/exerciseTranslation';
import { Language } from 'components/Exercises/models/language';
import { usePermissionQuery } from "components/User/queries/permission";
import { useProfileQuery } from "components/User/queries/profile";
import { WgerPermissions } from "permissions";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from 'react-router-dom';
import { deleteExerciseTranslation, getExerciseBase } from "services";
import { deleteExerciseBase } from "services/exerciseBase";
import { ExerciseSearchResponse } from "services/responseType";
import { getTranslationKey } from "utils/strings";
import { SERVER_URL } from "utils/url";
import styles from './head.module.css';

export interface HeadProp {
    exercise: ExerciseBase
    languages: Language[]
    changeLanguage: (lang: Language) => void,
    language: Language | undefined // language displayed in the head since it's not found in the translations
    currentTranslation: ExerciseTranslation | undefined
    setEditMode: Function,
    editMode: boolean
}

function ExerciseDeleteDialog(props: {
    onClose: Function,
    onChangeLanguage: Function,
    currentExercise: ExerciseBase,
    currentTranslation: ExerciseTranslation | undefined,
    currentLanguage: Language | undefined,
}) {
    const [replacementId, setReplacementId] = React.useState<number | null>(null);
    const [replacementExercise, setReplacementExercise] = React.useState<ExerciseBase | null>(null);

    const [t] = useTranslation();
    const navigate = useNavigate();

    const resetReplacement = () => {
        setReplacementExercise(null);
        setReplacementId(null);
    };

    const handleDeleteTranslation = async () => {
        await deleteExerciseTranslation(props.currentTranslation?.id!);
        props.onClose();
        props.onChangeLanguage();
    };

    const handleDeleteBase = async (handleReplacement: boolean = false) => {
        if (handleReplacement) {
            await deleteExerciseBase(props.currentExercise.id!, replacementExercise?.uuid!);
        } else {
            await deleteExerciseBase(props.currentExercise.id!);
        }
        props.onClose();
        navigate('../overview');
    };

    const loadCurrentReplacement = async (exerciseId?: number) => {
        const id = exerciseId !== undefined ? exerciseId : replacementId;

        if (id !== null) {
            try {
                const exercise = await getExerciseBase(id);
                setReplacementExercise(exercise);
            } catch (e) {
                setReplacementExercise(null);
            }
        }
    };


    return <>
        <DialogTitle id="alert-dialog-title">
            {t('delete')}
        </DialogTitle>
        <DialogContent>
            <p>{t('exercises.deleteExerciseBody',
                {
                    name: props.currentTranslation?.name,
                    language: props.currentLanguage?.nameLong
                })
            }</p>
            <p>{t('cannotBeUndone')}</p>

            <p><b>{t('exercises.replacements')}</b></p>
            <p>{t('exercises.replacementsInfoText')}</p>
            <p>{t('exercises.replacementsSearch')}</p>

            <NameAutocompleter
                callback={(exercise: ExerciseSearchResponse) => {
                    if (exercise !== null) {
                        setReplacementId(exercise.data.base_id);
                        loadCurrentReplacement(exercise.data.base_id);
                    }
                }}
            />

            <TextField
                label="Exercise ID"
                onBlur={() => loadCurrentReplacement()}
                onChange={async (event) => {
                    setReplacementId(event.target.value !== '' ? parseInt(event.target.value) : null);
                }}
                value={replacementId ?? ""}
                InputProps={{
                    endAdornment:
                        <InputAdornment position="start">
                            <IconButton onClick={() => loadCurrentReplacement()}>
                                <CachedIcon />
                            </IconButton>
                        </InputAdornment>
                }}
                fullWidth={true}
                variant="standard"
            />
            {replacementExercise === null && <>
                <p><i>No exercise selected for replacement</i></p>
            </>}

            {replacementExercise !== null && <>
                <p>Selected exercise for replacement:
                    <Tooltip title={t('copyToClipboard')}>
                        <IconButton
                            onClick={() => navigator.clipboard.writeText(replacementExercise!.id!.toString())}>
                            <ContentCopy />
                        </IconButton>
                    </Tooltip>
                </p>

                <ListItem disablePadding>
                    <ListItemAvatar>
                        <Avatar>
                            {replacementExercise.mainImage ?
                                <Avatar
                                    alt="" src={`${SERVER_URL}${replacementExercise.mainImage.url}`}
                                    variant="rounded" />
                                : <PhotoIcon />}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={replacementExercise.getTranslation().name}
                        secondary={`${replacementExercise.id} (${replacementExercise.uuid})`}
                    />
                    <IconButton onClick={resetReplacement}>
                        <ClearIcon />
                    </IconButton>
                </ListItem>
            </>}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => props.onClose()}>{t('cancel')}</Button>
            <Button
                size={"small"}
                onClick={handleDeleteTranslation}
                variant="contained"
            >
                {t('exercises.deleteTranslation')}
            </Button>
            <Button
                size={"small"}
                onClick={() => handleDeleteBase()}
                variant="contained"
            >
                {t('exercises.deleteExerciseFull')}
            </Button>
            <Button
                size={"small"}
                disabled={replacementExercise === null}
                onClick={() => handleDeleteBase(true)}
                variant="contained"
            >
                {t('exercises.deleteExerciseReplace')}
            </Button>
        </DialogActions>
    </>;
}

export const Head = ({
                         exercise,
                         languages,
                         changeLanguage,
                         language,
                         currentTranslation,
                         setEditMode,
                         editMode
                     }: HeadProp) => {
    const [anchorMenuEl, setAnchorMenuEl] = useState<null | HTMLElement>(null);
    const [openDialog, setOpenDialog] = React.useState(false);
    const openLanguageMenu = Boolean(anchorMenuEl);
    const [t] = useTranslation();

    const deletePermissionQuery = usePermissionQuery(WgerPermissions.DELETE_EXERCISE);
    const editPermissionQuery = usePermissionQuery(WgerPermissions.EDIT_EXERCISE);
    const profileQuery = useProfileQuery();
    const userIsAnonymous = profileQuery.isSuccess && profileQuery.data === null;

    let canUserContribute = false;
    if (profileQuery.isSuccess && editPermissionQuery.isSuccess) {
        canUserContribute = editPermissionQuery.data || (profileQuery.data !== null && profileQuery.data!.isTrustworthy);
    }

    const handleLanguageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorMenuEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorMenuEl(null);
    };
    const handleLanguageClick = (lang: Language) => {
        changeLanguage(lang);
        handleMenuClose();
    };

    const languagesList = languages.map(l => {
        return <MenuItem
            key={l.nameShort}
            onClick={() => handleLanguageClick(l)}
            selected={language?.id === l.id}>
            <ListItemText>{l.nameLong}</ListItemText>
            <ListItemIcon>
                {exercise.availableLanguages.includes(l.id)
                    ? <RedoIcon />
                    : <AddIcon />}
            </ListItemIcon>
        </MenuItem>;
    });

    return (
        <Grid container>
            <Grid item xs={12}>
                <div className={styles.root}>
                    <Dialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}>
                        <ExerciseDeleteDialog
                            onClose={() => setOpenDialog(false)}
                            onChangeLanguage={() => changeLanguage(languages[0])}
                            currentExercise={exercise}
                            currentLanguage={language}
                            currentTranslation={currentTranslation}
                        />
                    </Dialog>

                    <div className={styles.detail_language}>

                        <div className={styles.detail}>
                            <Link to="../overview">{t('exercises.exercises')}</Link>  &gt; {currentTranslation?.name}
                        </div>
                        <div className={styles.languages}>
                            <div className={styles.language}>
                                <Button
                                    size="small"
                                    id="basic-button"
                                    onClick={handleLanguageButtonClick}
                                    startIcon={<MoreVertIcon />}
                                >
                                    {language?.nameLong}
                                </Button>

                                <Menu
                                    id="basic-menu"
                                    anchorEl={anchorMenuEl}
                                    open={openLanguageMenu}
                                    onClose={handleMenuClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',
                                    }}
                                    sx={{ padding: 20 }}
                                >
                                    <MenuItem disabled>{t('exercises.changeExerciseLanguage')}</MenuItem>
                                    <Divider />
                                    {languagesList}
                                </Menu>
                            </div>
                        </div>
                    </div>
                    <div className={styles.header}>
                        <Typography gutterBottom variant="h2" margin={0} sx={{ mt: 2 }}>
                            {currentTranslation?.name}
                        </Typography>
                        {!userIsAnonymous &&
                            <nav className={styles.toolbar}>
                                {
                                    deletePermissionQuery.isSuccess
                                    && deletePermissionQuery.data
                                    && language?.id === currentTranslation?.language
                                    && <Button onClick={() => setOpenDialog(true)}>
                                        {t('delete')}
                                    </Button>
                                }
                                {
                                    canUserContribute
                                    && <Button onClick={() => setEditMode(true)}
                                               disabled={editMode}>EDIT</Button>
                                }
                                <Button onClick={() => setEditMode(false)}
                                        disabled={!editMode}>VIEW</Button>
                            </nav>
                        }
                    </div>
                    <Stack direction="row" spacing={1} mt={2}>
                        <Chip label={t(getTranslationKey(exercise.category.name))} size="small" />
                        {exercise.equipment.map(e => {
                            return <Chip key={e.id} label={t(getTranslationKey(e.name))} variant="outlined"
                                         size="small" />;
                        })}
                    </Stack>
                </div>
            </Grid>
        </Grid>
    );
};

import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RedoIcon from '@mui/icons-material/Redo';
import {
    Button,
    Chip,
    Dialog,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { ExerciseDeleteDialog } from "components/Exercises/Detail/Head/ExerciseDeleteDialog";
import { Exercise } from 'components/Exercises/models/exercise';
import { Language } from 'components/Exercises/models/language';
import { usePermissionQuery } from "components/User/queries/permission";
import { useProfileQuery } from "components/User/queries/profile";
import { WgerPermissions } from "permissions";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import styles from './head.module.css';

export interface HeadProp {
    exercise: Exercise
    languages: Language[]
    changeLanguage: (lang: Language) => void,
    language: Language | undefined // language displayed in the head since it's not found in the translations
    setEditMode: Function,
    editMode: boolean
}

export const Head = ({
                         exercise,
                         languages,
                         changeLanguage,
                         language,
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
        (<Grid container>
            <Grid size={12}>
                <div className={styles.root}>
                    <Dialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}>
                        <ExerciseDeleteDialog
                            onClose={() => setOpenDialog(false)}
                            onChangeLanguage={() => changeLanguage(languages[0])}
                            currentExercise={exercise}
                            currentLanguage={language}
                        />
                    </Dialog>

                    <div className={styles.detail_language}>
                        <div className={styles.detail}>
                            <Link
                                to="../overview">{t('exercises.exercises')}</Link>  &gt; {exercise.getTranslation(language)?.name}
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
                            {exercise.getTranslation(language)?.name}
                        </Typography>
                        {!userIsAnonymous &&
                            <nav className={styles.toolbar}>
                                {
                                    deletePermissionQuery.isSuccess
                                    && deletePermissionQuery.data
                                    && language?.id === exercise.getTranslation(language)?.language
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
                        <Chip
                            label={exercise.category.translatedName}
                            size="small" />
                        {exercise.equipment.map(e => {
                            return <Chip
                                key={e.id}
                                label={e.translatedName}
                                variant="outlined"
                                size="small"
                            />;
                        })}
                    </Stack>
                </div>
            </Grid>
        </Grid>)
    );
};

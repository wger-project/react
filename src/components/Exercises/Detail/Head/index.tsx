import React, { useState } from 'react';
import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack
} from '@mui/material';
import { ExerciseBase } from 'components/Exercises/models/exerciseBase';
import { ExerciseTranslation } from 'components/Exercises/models/exerciseTranslation';
import { Language } from 'components/Exercises/models/language';
import { Link, useNavigate } from 'react-router-dom';
import styles from './head.module.css';
import { getTranslationKey } from "utils/strings";
import { useTranslation } from "react-i18next";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RedoIcon from '@mui/icons-material/Redo';
import AddIcon from '@mui/icons-material/Add';
import { usePermissionQuery, useProfileQuery } from "components/User/queries";
import { WgerPermissions } from "permissions";
import { deleteExerciseTranslation } from "services";
import { deleteExerciseBase } from "services/exerciseBase";

export interface HeadProp {
    exercise: ExerciseBase
    languages: Language[]
    availableLanguages: number[]
    changeLanguage: (lang: Language) => void,
    language: Language | undefined // language displayed in the head since it's not found in the translations
    currentTranslation: ExerciseTranslation | undefined
    setEditMode: Function,
    editMode: boolean
}

export const Head = ({
                         exercise,
                         languages,
                         availableLanguages,
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
    const navigate = useNavigate();

    const deletePermissionQuery = usePermissionQuery(WgerPermissions.DELETE_EXERCISE);
    const editPermissionQuery = usePermissionQuery(WgerPermissions.EDIT_EXERCISE);
    const profileQuery = useProfileQuery();
    const userIsAnonymous = profileQuery.isSuccess && profileQuery.data === null;

    let canUserContribute = false;
    if (profileQuery.isSuccess && editPermissionQuery.isSuccess) {
        canUserContribute = editPermissionQuery.data || profileQuery.data!.isTrustworthy;
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

    const handleDeleteTranslation = async () => {
        await deleteExerciseTranslation(currentTranslation?.id!);
        setOpenDialog(false);
        changeLanguage(languages[0]);
    };

    const handleDeleteBase = async () => {
        await deleteExerciseBase(exercise.id!);
        setOpenDialog(false);
        navigate('../overview');
    };

    const equipment = <Stack direction="row" spacing={1}>
        {exercise.equipment.map(e => {
            return <Chip key={e.id} label={t(getTranslationKey(e.name))} />;
        })}
        <Chip label={t(getTranslationKey(exercise.category.name))} />
    </Stack>;

    const languagesList = languages.map(l => {
        return <MenuItem
            key={l.nameShort}
            onClick={() => handleLanguageClick(l)}
            selected={language?.id === l.id}>
            <ListItemText>{l.nameLong}</ListItemText>
            <ListItemIcon>
                {availableLanguages.includes(l.id)
                    ? <RedoIcon />
                    : <AddIcon />}
            </ListItemIcon>
        </MenuItem>;
    });

    return (
        <div className={styles.root}>
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle id="alert-dialog-title">
                    {t('delete')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <p>
                            {t('exercises.deleteExerciseBody',
                                {
                                    name: currentTranslation?.name,
                                    language: language?.nameLong
                                })}
                        </p>
                        <p>
                            {t('cannotBeUndone')}
                        </p>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>{t('cancel')}</Button>
                    <Button
                        onClick={() => handleDeleteTranslation()}
                        variant="contained"
                        autoFocus
                    >
                        {t('exercises.deleteTranslation')}
                    </Button>
                    <Button
                        onClick={() => handleDeleteBase()}
                        variant="contained"
                        autoFocus
                    >
                        {t('exercises.deleteExerciseFull')}
                    </Button>
                </DialogActions>
            </Dialog>

            <div className={styles.detail_language}>

                <div className={styles.detail}>
                    <Link to="../overview">Exercises</Link>  &gt; {currentTranslation?.name}
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
                            <MenuItem disabled>Change this exercise's language</MenuItem>
                            <Divider />
                            {languagesList}
                        </Menu>
                    </div>
                </div>
            </div>
            <div className={styles.header}>
                <div className={styles.heading}>
                    <h1>{currentTranslation?.name}</h1>
                    {equipment}
                </div>
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
        </div>
    );
};

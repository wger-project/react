import React, {useState} from 'react';
import {
    Button,
    Chip,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack
} from '@mui/material';
import {ExerciseBase} from 'components/Exercises/models/exerciseBase';
import {ExerciseTranslation} from 'components/Exercises/models/exerciseTranslation';
import {Language} from 'components/Exercises/models/language';
import {Link} from 'react-router-dom';
import styles from './head.module.css';
import {getTranslationKey} from "utils/strings";
import {useTranslation} from "react-i18next";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RedoIcon from '@mui/icons-material/Redo';
import AddIcon from '@mui/icons-material/Add';

export interface HeadProp {
    exercise: ExerciseBase
    languages: Language[]
    availableLanguages: number[]
    changeLanguage: (lang: Language) => void,
    language: Language | undefined // language displayed in the head since it's not found in the translations
    currentTranslation: ExerciseTranslation | undefined
    setEditMode: Function
}

export const Head = ({
                         exercise,
                         languages,
                         availableLanguages,
                         changeLanguage,
                         language,
                         currentTranslation,
                         setEditMode
                     }: HeadProp) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openLanguageMenu = Boolean(anchorEl);
    const [t] = useTranslation();

    const handleLanguageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageClick = (lang: Language) => {
        changeLanguage(lang);
        handleClose();
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
            <div className={styles.detail_language}>

                <div className={styles.detail}>
                    <Link to='../overview'>Exercises</Link>  &gt; {currentTranslation?.name}
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
                            anchorEl={anchorEl}
                            open={openLanguageMenu}
                            onClose={handleClose}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button',
                            }}
                            sx={{padding: 20}}
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
                <nav className={styles.toolbar}>
                    <Button onClick={() => setEditMode(true)}>EDIT</Button>
                    <Link to='#' className={styles.nav_link}>VIEW</Link>
                    <Link to='#' className={styles.nav_link}>EDIT</Link>
                    <div className={styles.vertical_line} />
                    <RedoIcon />
                    <MoreVertIcon />
                </nav>
            </div>
        </div>
    );
};

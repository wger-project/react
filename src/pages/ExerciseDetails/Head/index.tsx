import { ExerciseBase } from 'components/Exercises/models/exerciseBase';
import { Language } from 'components/Exercises/models/language';
import useComponentVisible from 'components/Header/useComponentVisible';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './head.module.css';

export interface HeadProp {
    exercise: ExerciseBase
    languages: Language[]
    changeLanguage: (lang: Language) => void,
    language: Language | undefined // language displayed in the head since it's not found in the translations
}

export const Head = ({exercise, languages, changeLanguage, language}: HeadProp) => {
    // const [displayLanguageState, setdisplayLanguageState] = useState(false);
        
    const category = exercise.category.name;
    const equipment = exercise.equipment.length !== 0 ? exercise.equipment[0].name : "No equipment";
    const languagesList = languages.map(l => {
        return <li key={l.nameShort} onClick={() => changeLanguage(l)}>{l.nameLong}</li>;
    });

    const displayLanguageMenuVisibleHook = useComponentVisible(false);

    const displayLanguageMenu = displayLanguageMenuVisibleHook.isComponentVisible ? "block" : "none";
    

  return (
    <div className={styles.root}>
        <div className={styles.detail_language}>
            <div className={styles.detail}>
                <Link to='/exercises'>Exercise</Link>  &gt; {exercise.translations[0].name}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.detail_arrow} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <div className={styles.languages}  ref={displayLanguageMenuVisibleHook.ref}>
                <div className={styles.language}>
                    {language?.nameLong}
                    <svg onClick={() => displayLanguageMenuVisibleHook.setIsComponentVisible(!displayLanguageMenuVisibleHook.isComponentVisible)} xmlns="http://www.w3.org/2000/svg" className={styles.dots} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </div>
                <div style={{display: displayLanguageMenu}} className={styles.language_menu}>
                    <h5>Change wger's language...</h5>
                    <hr />
                    <span>For this exercise:</span>
                    <ul>
                        {languagesList}
                    </ul>
                </div>
            </div>
        </div>
        <div className={styles.header}>
            <div className={styles.heading}>
                <h1>{exercise.translations[0].name}</h1>
                <div  className={styles.tags}>
                    <span>{category}</span> {equipment}
                </div>
            </div>
            <nav className={styles.toolbar}>
                <Link to='#' className={styles.nav_link}>VIEW</Link>
                <Link to='#' className={styles.nav_link}>EDIT</Link>
                <div className={styles.vertical_line}></div>
                <img src="https://img.icons8.com/ios/50/000000/forward-arrow.png" alt='forward arrow' />
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.dots} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </nav>
        </div>
    </div>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import styles from './exerciseDetails.module.css';
import {Head} from './Head';
import { Carousel, CarouselItem } from 'components/Carousel';
import { SideGallery } from './SideGallery';
import { Footer } from 'components';
import { useParams, useNavigate } from 'react-router-dom';
import { getExerciseBase, getExerciseBases } from 'services';
import { ExerciseBase } from 'components/Exercises/models/exerciseBase';
import { useTranslation } from "react-i18next";
import { getLanguageByShortName, getLanguages } from "services/language";
import { useExerciseStateValue } from 'state';
import { ExerciseTranslation } from 'components/Exercises/models/exerciseTranslation';
import { Language } from 'components/Exercises/models/language';
import { OverviewCard } from 'components/Exercises/Detail/OverviewCard';
import { setExerciseBases, setLanguages } from 'state/exerciseReducer';
import { Note } from "components/Exercises/models/note";
import { Muscle } from "components/Exercises/models/muscle";

export const ExerciseDetails = () => {
    const [exerciseState, setExerciseState] = useState<ExerciseBase>();
    const [currentUserLanguageState, setCurrentUserLanguageState] = useState<Language>();
    const [currentTranslation, setCurrentTranslation] = useState<ExerciseTranslation>();
    //
    const [state, dispatch] = useExerciseStateValue();
    const params = useParams();
    const exerciseID = params.exerciseID ? parseInt(params.exerciseID) : 0;

    // used to detect language from browser
    const [t, i18n] = useTranslation();

    // to redirect to 404
    const navigate = useNavigate();

    const fetchedExercise = useCallback(async () => {
        // each time an exercise object is set, the current translation is extracted and 
        // set to state so it can be rendered directly
        try {
            const exerciseReceived = await getExerciseBase(exerciseID);
            const languages = await getLanguages();
            const variantExercises = await getExerciseBases();
            //collect user browser's language
            const currentUserLanguage = getLanguageByShortName(i18n.language, languages);
            // get exercise translation from received exercise and set it
            if (currentUserLanguage) {
                const newTranslatedExercise = exerciseReceived?.getTranslation(currentUserLanguage);
                setCurrentTranslation(newTranslatedExercise);
            }
            setCurrentUserLanguageState(currentUserLanguage);
            setExerciseState(exerciseReceived);
            dispatch(setLanguages(languages));
            // slice the first 3 exercises to display in variants
            // It's been set in the global state thogh
            dispatch(setExerciseBases(variantExercises.slice(0, 3)));
            
        } catch (error) {
            // this can be done better. It's for cases that the exercise don't exist and
            // we want to inform the user about it
            navigate('/not-found');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exerciseID, currentUserLanguageState]);


    useEffect(() => {
        fetchedExercise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exerciseID]);

    const description = currentTranslation?.description !== undefined ? currentTranslation?.description : " ";
    const notes = currentTranslation?.notes;
    const aliases = currentTranslation?.aliases;


    const changeUserLanguage = (lang: Language) => {
        const language = getLanguageByShortName(lang.nameShort, state.languages);
        setCurrentUserLanguageState(language);
        const newTranslatedExercise = exerciseState?.getTranslation(lang);
        setCurrentTranslation(newTranslatedExercise);
    };


   const variantExercises = state.exerciseBases.map(variantExercise => {
       return <OverviewCard key={variantExercise.id} exerciseBase={variantExercise} language={currentUserLanguageState} />;
   });
    
    return (
        <div className={styles.root}>
            {exerciseState !== undefined ? <Head
                exercise={exerciseState}
                languages={state.languages}
                changeLanguage={changeUserLanguage}
                language={currentUserLanguageState}
                currentTranslation={currentTranslation}
            /> : null}
            <div className={styles.body}>
                <div className={styles.detail_alt_name}>
                    <p>
                        {t('exercises.also-known-as')} &nbsp;
                        {aliases?.map(e => e.alias).join(', ')}
                    </p>
                </div>

                <section className={styles.hero}>
                    <aside>
                        {/* This carousel only displays on small screens */}
                        <Carousel>
                            <CarouselItem>
                                <img style={{ width: "100%" }}
                                     src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                     alt="detail" />
                            </CarouselItem>
                            <CarouselItem>
                                <img style={{ width: "100%" }}
                                     src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                     alt="detail" />
                            </CarouselItem>
                            <CarouselItem>
                                <img style={{ width: "100%" }}
                                     src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                     alt="detail" />
                            </CarouselItem>
                        </Carousel>

                        {/* This gallery only displays on medium screens upwards */}
                        {exerciseState &&
                            <SideGallery mainImage={exerciseState.mainImage} sideImages={exerciseState.sideImages} />}
                    </aside>
                    <section>
                        <article>
                            <div className={styles.start}>
                                <h1>Starting position</h1>
                                <p>No starting postion for now.</p>
                            </div>

                            <div className={styles.step}>
                                <h1>{t('exercises.description')}</h1>
                                <ol>
                                    <li>
                                        <div dangerouslySetInnerHTML={{ __html: description }} />
                                    </li>
                                </ol>
                            </div>

                            <div className={styles.notes}>
                                <h1>{t('exercises.notes')}</h1>

                                {notes?.map((note: Note) =>
                                    <li key={note.id}>{note.note}</li>
                                )}
                            </div>

                            <h1>{t('exercises.muscles')}</h1>
                            <div className={styles.details}>

                                <div className={styles.details_image}>
                                    <img
                                        src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
                                        alt="detail" />
                                </div>
                                <div className={styles.details_details}>
                                    <div className={styles.details_detail_card}>
                                        <h3>{t('exercises.primaryMuscles')}</h3>
                                        <ul>
                                            {exerciseState?.muscles.map((m: Muscle) =>
                                                <li key={m.id}>{m.name}</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className={styles.details_detail_card}>
                                        <h3>{t('exercises.secondaryMuscles')}</h3>
                                        <ul>
                                            {exerciseState?.musclesSecondary.map((m: Muscle) =>
                                                <li key={m.id}>{m.name}</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </article>


                    </section>

                </section>

                <hr className={styles.line_break} />

                <article>
                    <div className={styles.variants}>
                        <h1>Variants</h1>

                       <div className={styles.cards}>
                            {variantExercises}
                       </div>
                    </div>
                </article>

                <p className={styles.license}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum rerum
                    quibusdam veniam est officiis labore a natus commodi aspernatur illum, repellat sit nesciunt magnam
                    esse?</p>
            </div>


            <Footer />
        </div>
    );
};
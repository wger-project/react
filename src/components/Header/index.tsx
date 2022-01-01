import React, { useState } from 'react';
import styles from './header.module.css';
import { useMediaQuery } from 'react-responsive';
import logo from 'assets/images/logo.png';
import { Link } from "react-router-dom";
import useComponentVisible from './useComponentVisible';
import { TrainingSubMenu } from './SubMenus/TrainingSubMenu';
import { BodyWeightSubMenu } from './SubMenus/BodyWeightSubMenu';
import { NutritionSubMenu } from './SubMenus/NutritionSubMenu';
import { AboutSubMenu } from './SubMenus/AboutSubMenu';
import { UserSubMenu } from './SubMenus/UserSubMenu';


export const Header = () => {
    const [showMenu, setShowMenu] = useState(false);

    const trainingVisibleHook = useComponentVisible(false);
    const bodyWeightVisibleHook = useComponentVisible(false);
    const nutritionVisibleHook = useComponentVisible(false);
    const aboutVisibleHook = useComponentVisible(false);
    const userVisibleHook = useComponentVisible(false);

    const isDesktop = useMediaQuery({ query: `(min-width: 700px)` });    

    const showMenuStyle: React.CSSProperties = !isDesktop ? showMenu ? {} : {
        maxHeight: "0",
    } : {
        maxHeight: "auto"
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <a href='/' className={styles.logo}>
                    <img src={logo} alt="logo" />
                </a>
                <div 
                    style={showMenuStyle}
                    className={styles.navs}
                >
                    <nav className={styles.primaryNav}>
                        <ul className={styles.primaryNav__list}>
                            <li className={styles.nav__item}>
                                <button
                                    onClick={() => trainingVisibleHook.setIsComponentVisible(true)}
                                    // onBlur={() => setShowTraining(false)}
                                >
                                    Training <span>&#9660;</span>
                                </button>
                                <div ref={trainingVisibleHook.ref}>
                                    <ul className={styles.subNav} style={{display: trainingVisibleHook.isComponentVisible ? "block" : "none"}}>
                                        <TrainingSubMenu />
                                    </ul>
                                </div>
                                
                            </li>
                            <li className={styles.nav__item}>
                                <button
                                    onClick={() => bodyWeightVisibleHook.setIsComponentVisible(true)}
                                    // onBlur={() => setShowBodyWeight(false)}
                                >
                                    Body Weight <span>&#9660;</span>
                                </button>
                                <div ref={bodyWeightVisibleHook.ref}>
                                    <ul className={styles.subNav} style={{display: bodyWeightVisibleHook.isComponentVisible ? "block" : "none"}}>
                                        <BodyWeightSubMenu />
                                    </ul>
                                </div>
                            </li>
                            <li className={styles.nav__item}>
                                <button
                                    onClick={() => nutritionVisibleHook.setIsComponentVisible(true)}
                                    // onBlur={() => setShowNutrition(false)}
                                >
                                    Nutrition <span>&#9660;</span>
                                </button>
                                <div ref={nutritionVisibleHook.ref}>
                                    <ul className={styles.subNav} style={{display: nutritionVisibleHook.isComponentVisible ? "block" : "none"}}>
                                        <NutritionSubMenu />
                                    </ul>
                                </div>
                            </li>
                            <li className={styles.nav__item}>
                                <button
                                    onClick={() => aboutVisibleHook.setIsComponentVisible(true)}
                                    // onBlur={() => setShowAbout(false)}
                                >
                                    About this software <span>&#9660;</span>
                                </button>
                                <div ref={aboutVisibleHook.ref}>
                                    <ul className={styles.subNav} style={{display: aboutVisibleHook.isComponentVisible ? "block" : "none"}}>
                                        <div className={styles.about}><Link to="/software/about-us">About us</Link></div>
                                        <AboutSubMenu />
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </nav>
                    <nav className={styles.secondaryNav}>
                    <ul className={styles.secondaryNav__list}>
                        <li className={styles.nav__item}>
                            <button
                                onClick={() => userVisibleHook.setIsComponentVisible(true)}
                                // onBlur={() => setShowUserMenu(false)}
                            >
                                User <span>&#9660;</span>
                            </button>
                            <div ref={userVisibleHook.ref}>
                                <ul className={styles.subNav} style={{display: userVisibleHook.isComponentVisible ? "block" : "none"}}>
                                    <UserSubMenu />
                                </ul>
                            </div>
                        </li>
                    </ul>
                    </nav>
                </div>
                <button className={styles.toggleBtn}  onClick={() => setShowMenu(!showMenu)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    );
};
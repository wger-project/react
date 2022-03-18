import React, { useState } from 'react';
import styles from './mobile_link.module.css';

interface MobileLinksProp {
    title: string,
    links: {text: string, url: string}[]
}
export const MobileLinks = (children: MobileLinksProp) => {
    const [showLinks, setShowLinks] = useState<boolean>(false);


    const handleShowLinks= () => {
        setShowLinks(!showLinks);
    };

    const upArrow = <svg xmlns="http://www.w3.org/2000/svg" onClick={handleShowLinks} className={styles.arrow} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>;
    
    const downArrow = <svg xmlns="http://www.w3.org/2000/svg" onClick={handleShowLinks} className={styles.arrow} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>;

    const ShowLinksDisplayStyles = showLinks ? "block" : "none";
    const icon = showLinks ? upArrow : downArrow;

    return (
        <div className={styles.root}>
            <div className={styles.mobileFooter__linksTitle}>
                <h3>{children.title}</h3>
                {icon}
            </div>
            <div className={styles.mobileFooter__links} style={{display: ShowLinksDisplayStyles}}>
                {children.links.map(link => {
                    return <a href={link.url} key={link.url}>{link.text}</a>;
                })}
            </div>
        </div>
    );
};

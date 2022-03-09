import React from 'react';
import styles from './exerciseDetails.module.css';
import {Head} from './Head';
import { VariantCard } from './VariantCard';
import { Carousel, CarouselItem } from 'components/Carousel';
import { SideGallery } from './SideGallery';
import { Footer } from 'components';

const sampleExercise = {
    "id": 6,
    "name": "Rectus abdominis",
    "is_front": true,
    "image_url_main": "/static/images/muscles/main/muscle-6.svg",
    "image_url_secondary": "/static/images/muscles/secondary/muscle-6.svg"
};

export const MuscleExercise = () => {
    return (
        <div className={styles.root}>
            <Head />
           <div className={styles.body}>
                <div className={styles.detail_alt_name}>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. 
                </div>
                
                <section className={styles.hero}>
                    <aside>
                        <Carousel>
                            <CarouselItem>
                                <img  style={{width: "100%"}} src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80" alt="detail" />
                            </CarouselItem>
                            <CarouselItem>
                                <img style={{width: "100%"}} src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80" alt="detail" />
                            </CarouselItem>
                            <CarouselItem>
                                <img style={{width: "100%"}} src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80" alt="detail" />
                            </CarouselItem>
                        </Carousel>

                        <SideGallery />
                    </aside>
                    <section>
                        <article>
                            <div className={styles.start}>
                                <h1>Starting position</h1>
                                <p>Lorem ipsum dolor sit amet consectetur.</p>
                            </div>

                            <div className={styles.step}>
                                <h1>Steps</h1>
                                <ol>
                                    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis, distinctio.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolores explicabo at porro unde!</li>
                                    <li>Lorem ipsum dolor sit, amet consectetur adipisicing.</li>
                                    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, porro!</li>
                                </ol>
                            </div>

                            <div className={styles.notes}>
                                <h1>Notes</h1>
                                <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus, animi! Obcaecati sint aperiam similique 
                                    repellat iusto incidunt cupiditate quae cumque.
                                </p>
                            </div>

                            <h1>Muscles</h1>
                            <div className={styles.details}>
                                
                                <div className={styles.details_image}>
                                    <img src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80" alt="detail" />
                                </div>
                                <div className={styles.details_details}>
                                    <div className={styles.details_detail_card}>
                                        <h3>Primary Muscles</h3>
                                        <ul>
                                            <li>Lorem, ipsum dolor.</li>
                                            <li>Lorem, ipsum dolor.</li>
                                        </ul>
                                    </div>
                                    <div className={styles.details_detail_card}>
                                        <h3>Secondary Muscle</h3>
                                        <ul>
                                            <li>Lorem, ipsum dolor.</li>
                                            <li>Lorem, ipsum dolor.</li>
                                        </ul>
                                    </div>
                                    <div className={styles.details_detail_card}></div>
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
                            <VariantCard />
                            <VariantCard />
                            <VariantCard />
                       </div>
                    </div>
                </article>

                <p className={styles.license}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum rerum quibusdam veniam est officiis labore a natus commodi aspernatur illum, repellat sit nesciunt magnam esse?</p>
           </div>

           
            <Footer />
        </div>
    );
};
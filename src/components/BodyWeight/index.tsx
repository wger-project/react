import React, { useState, useEffect } from 'react';
import { BodyWeightType } from 'types';
import { get_weights } from 'services'
import { WeightTable } from './Table';
import styles from './body_weight.module.css';

export const BodyWeight = () => {
    const [weights, setWeights] = useState<BodyWeightType[]>([])

    useEffect(() => {
        const fecth_weights = async () => {
            try {
                const received_weights = await get_weights();                
                setWeights(received_weights)
            } catch (error) {
                console.log(error);
            }
        }
        fecth_weights()
    }, []) 


    return (
        <div className={styles.root}>
            <div className={styles.chart}>Chart Here</div>
            { weights.length !== 0 && <WeightTable weights={weights} />}
        </div>
    )
}
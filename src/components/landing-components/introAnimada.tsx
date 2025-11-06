"use client"

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import Image from "next/image";

import styles from "@/components/landing-components/introAnimada.module.css";

import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function IntroAnimada(){
    const wrapper = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {

            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapper.current,
                    start: "top top",
                    end: "+=100%",
                    pin: true,
                    scrub: true,
                },
            });

            //Zoom a la imagen del tunel
            timeline.to(
                `.${styles.imageContainer} img`,
                {
                scale: 2,
                z: 350,
                transformOrigin: "center center",
                // ease: 'power1.inOut',
                }
            );

            //Zoom al fondo de Bellas Artes
            timeline.to(
                `.${styles.hero}`,
                {
                    scale: 1.3,
                    boxShadow: `10000px 0 0 0 rgba(0, 0, 0, 0) inset`,
                    transformOrigin: "center center",
                    //ease: 'power1.inOut'
                },
                "<"
            );
        }, wrapper);
         /* ------ gsap.context ------- */

        return () => ctx.revert();
    }, []); //[] asegura que 'useEffect' se ejecute una vez

    return (
        <div className={styles.wrapper} ref={wrapper}>
        
            {/* Texto Itinerario Turistico de Mexcio*/}
            <div className={styles.intro}>
                <h1>Itinerario turístico de</h1>
                <p className={styles.fuente_lobster}>México</p>
            </div>

            { /* El fondo de Bellas Artes */ }
            <div className={styles.content}>
                <section className={`${styles.section} ${styles.hero}`}></section>
            </div>

            {/* La imagen del tunel a la que se le hace zoom */}
            <div className={styles.imageContainer}>
                <Image
                    // src="/img/tunel2.webp"
                    src="/img/tunel1.png"
                    alt="Imagen_tunel"
                    fill /* width/heigth 100% */
                    style={{ objectFit: 'cover' }}
                    //priority //Carga primero la imagen del tunel
                />
            </div>
        </div>
    );
}
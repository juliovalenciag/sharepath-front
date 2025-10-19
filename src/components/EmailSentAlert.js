"use client";
import React from 'react';
import styles from './EmailSentAlert.module.css';

const EmailSentAlert = ({ email }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>¡Tienes un nuevo correo!</h2>

      <div className={styles.iconWrapper}>
        {/* Usar <img> apuntando a la carpeta public/img */}
        <img
          src="/img/correo-sign-in.svg"
          alt="Correo enviado"
          width={60}
          height={60}
          className={styles.icon}
        />
      </div>

      <p className={styles.text}>Hemos enviado un correo electrónico a:</p>
      <p className={styles.email}>
        {email}
      </p>
      <p className={styles.text}>Haz clic en el enlace para restablecer tu contraseña</p>
    </div>
  );
};

export default EmailSentAlert;
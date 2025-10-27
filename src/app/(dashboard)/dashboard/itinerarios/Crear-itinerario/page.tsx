import Link from 'next/link';
import styles from './crear-itinerario.module.css'; 
import Map from '../../../../../components/map'; 


import { 
  FiArrowLeft, 
  FiEdit2, 
  FiChevronDown, 
  FiPlus, 
  FiStar, 
  FiSearch,
  FiCopy,
  FiMaximize
} from 'react-icons/fi';

export default function CrearItinerarioPage() {
  return (
    <div className={styles.pageWrapper}>
      
      {/*  Encabezado */}
      <div className={styles.header}>
        <Link href="/itinerarios" className={styles.backArrow}>
          <FiArrowLeft size={24} />
        </Link>
        <h1 className={styles.title}>Crear itinerarios</h1>
      </div>

      {/* Division 2 columnmas */}
      <div className={styles.contentLayout}>
        
        {/* Columna Izquierda: Formulario */}
        <div className={styles.formColumn}>
          <div className={styles.inputGroup}>
            <h2>Nombre del itinerario</h2>
            <FiEdit2 size={20} className={styles.icon} />
          </div>
          
          <div className={styles.inputGroup}>
            <h3>Seleccionar Estado</h3>
            <FiChevronDown size={20} className={styles.icon} />
          </div>

          <div className={styles.activityList}>
            <button className={styles.addActivityButton}>
              Añadir Actividad
              <FiPlus size={20} />
            </button>
            <button className={styles.addActivityButton}>
              Añadir Actividad
              <FiPlus size={20} />
            </button>
            <button className={styles.addActivityButton}>
              Añadir Actividad
              <FiPlus size={20} />
            </button>
          </div>
        </div>

        {/* Columna Derecha: Mapa e Info */}
        <div className={styles.mapColumn}>
          <div className={styles.mapHeader}>
            <div className={styles.starRating}>
              <FiStar fill="#ffc107" stroke="none" />
              <FiStar fill="#ffc107" stroke="none" />
              <FiStar fill="#ffc107" stroke="none" />
              <FiStar fill="#e0e0e0" stroke="none" />
              <FiStar fill="#e0e0e0" stroke="none" />
            </div>
            <div className={styles.mapIcons}>
              <FiCopy size={20} className={styles.icon} />
              <FiMaximize size={20} className={styles.icon} />
            </div>
          </div>
          
          <div className={styles.searchBar}>
            <FiSearch size={20} className={styles.searchIcon} />
            <input type="text" placeholder="Buscar Lugar" className={styles.searchInput} />
          </div>

          {/* MAPA no quedo */}
          
          <div className={styles.mapPlaceholder}>
           
          </div>
        </div>
      </div>

      {/*  Botones  */}
      <footer className={styles.footerActions}>
        <button className={`${styles.btn} ${styles.btnGuardar}`}>Guardar</button>
        <button className={`${styles.btn} ${styles.btnPublicar}`}>Publicar</button>
      </footer>

    </div>
  );
}
import Link from 'next/link';
import styles from './buscar-viajero.module.css'; 
import { FiArrowLeft, FiSearch } from 'react-icons/fi';


// Datos de ejemplo 
const ViejerosSugeridos = [
  { id: 1, inicial: 'A', nombre: 'Ana García' },
  { id: 2, inicial: 'C', nombre: 'Carlos Ruiz' },
  { id: 3, inicial: 'L', nombre: 'Laura Martínez' },
  { id: 4, inicial: 'J', nombre: 'Javier Fernández' },
];

export default function BuscarViajeroPage() {
  return (
    <div className={styles.pageContainer}>
      {/* Encabezado  */}
      <div className={styles.header}>
        <Link href="/viajero" className={styles.backButton}>
          <FiArrowLeft size={24} />
        </Link>
        <h1 className={styles.title}>Buscar viajero</h1>
      </div>

      {/*  Barra de Busqueda  */}
      <div className={styles.searchBar}>
        <FiSearch className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="¡Busca a un amigo viajero!"
          className={styles.searchInput}
        />
      </div>

      {/*  Lista de Usuarios */}
      <ul className={styles.userList}>
        {ViejerosSugeridos.map((viajero) => (
          <li key={viajero.id} className={styles.userItem}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{viajero.inicial}</div>
              <span className={styles.userName}>{viajero.nombre}</span>
            </div>
            <button className={styles.addButton}>Agregar Amigo</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
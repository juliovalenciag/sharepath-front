'use client';

import { useState, useEffect} from 'react';
import Link from 'next/link';
import styles from './buscar-viajero.module.css'; 
import { FiArrowLeft, FiSearch } from 'react-icons/fi';

const API_URL = "https://harol-lovers.up.railway.app";

export default function BuscarViajeroPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viajeros, setViajeros] = useState([]);
  const [loading, setLoading] = useState(false);


  //Funcion para buscar viajeros
  const handleSearch = async (term) =>{
    const token = localStorage.getItem('authToken');
    if (!token || term.trim() == ''){
      setViajeros([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/search?q=${term}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al buscar viajeros');

      const data = await response.json();
      setViajeros(data);
    } catch (error){
      console.error(error);
      setViajeros([]);
    } finally {
      setLoading(false);
    }

  };

  //Buscar al escribir
  useEffect(()=> {
    const timeout = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);


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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Estado de carga */}
      {loading && <p className={styles.loadingText}>Buscando viajeros...</p>}

      {/*  Lista de Usuarios */}
      <ul className={styles.userList}>
        {viajeros.length > 0 ? (
          viajeros.map((viajero, index) =>(
            <li key={index} className={styles.userItem}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {viajero.foto_url ? (
                    <img src={viajero.foto_url} alt={viajero.nombre_completo} className={styles.AvatarImg}/>
                  ) : (
                    viajero.nombre_completo?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <span className={styles.userName}>{viajero.nombre_completo}</span>
              </div>            
              <button className={styles.addButton}>Agregar Amigo</button>  
            </li>
          ))
        ) : (
          !loading && <p className={styles.noResults}>No se encontraron viajeros</p>
        )}
      </ul>
    </div>
  );
}
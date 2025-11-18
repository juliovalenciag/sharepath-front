import { ItinerariosAPI } from "./ItinerariosAPI";
import { LugarData } from "./interfaces/ApiRoutes";

export class ApiSearchProvider {

  // El método 'search' es llamado automáticamente por la barra de búsqueda.
  async search({ query }: { query: string }) {
    
    console.log(`🔍 ApiSearchProvider: Buscando "${query}"`);

    let responseArray: LugarData[] = [];

    try {
      // Solicitamos datos a la API. 
      // Nota: Al parecer el backend está ignorando el filtro 'nombre',
      // por lo que traemos hasta 90 para filtrar nosotros mismos.
      const response = await ItinerariosAPI.getInstance().getLugares(
        1,          
        90,         
        undefined,  
        undefined,  
        query       
      ) as any;

      if (Array.isArray(response)) {
        responseArray = response;
      } else if (response && Array.isArray(response.lugares)) {
        responseArray = response.lugares;
      } else {
        console.warn("⚠️ La API devolvió un formato desconocido:", response);
        return [];
      }

    } catch (error) {
      console.error("❌ Error al conectar con la API de búsqueda:", error);
      return [];
    }

    // --- 🧹 FILTRADO LOCAL (SOLUCIÓN) ---
    // Como la API devuelve todo (90 resultados), filtramos aquí manualmente
    // para que la búsqueda sea real y exacta.
    if (query && query.trim() !== "") {
       const queryLower = query.toLowerCase();
       const totalAntes = responseArray.length;
       
       responseArray = responseArray.filter(lugar => 
          lugar.nombre && lugar.nombre.toLowerCase().includes(queryLower)
       );
       
       console.log(`🧹 Filtro local: De ${totalAntes} resultados de la API, quedaron ${responseArray.length} coincidencias.`);
    }
    // -----------------------------------------------------------------------

    const resultados = responseArray.map((lugar: LugarData) => {
      
      if (!lugar || typeof lugar.latitud !== 'number' || typeof lugar.longitud !== 'number') {
        return null;
      }

      return {
        x: lugar.longitud,   
        y: lugar.latitud,    
        label: lugar.nombre, 
        raw: lugar,          
      };
    });

    return resultados.filter((item) => item !== null) as any[];
  }
}
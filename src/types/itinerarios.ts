export interface Actividad {
  id: number | string;
  nombre: string;
  lat?: number;
  lng?: number;
  description?: string;
  foto_url?: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  mexican_state?: string;
}

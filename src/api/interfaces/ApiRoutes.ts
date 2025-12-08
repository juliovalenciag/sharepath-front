export interface RegisterRequest {
  nombre_completo: string;
  correo: string;
  password: string;
  role: string;
  username: string;
  privacity_mode: boolean;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Usuario {
  username: string;
  nombre_completo: string;
  foto_url: null | string;
  account_status: boolean;
  privacity_mode: boolean;
  role: string;
  correo: string;
  itineraryCount: number | null;
  friendsCount: number | null;
}

export interface ErrorResponse {
  message: string;
}

export interface Actividad {
  fecha: string;
  description: string;
  lugarId: string;
}

export interface CreateItinerarioRequest {
  title: string;
  actividades: Actividad[];

  start_date?: string;
  end_date?: string;
  regions?: string[];
}

export interface CreateItinerarioResponse {
  id: number | string;
  title: string;
  actividades: Actividad[];
  createdAt: string;
  message?: string;
}

export interface ItinerarioData {
  id: number | string;
  title: string;
  actividades: Actividad[];
  createdAt: string;
  updatedAt?: string;

  start_date?: string;
  end_date?: string;
  regions?: string[];
}

export interface ItinerarioListResponse {
  itinerarios: ItinerarioData[];
  total: number;
}

export interface CreateLugarRequest {
    id_api_place:  string;      
    category:      string;
    mexican_state: string;
    nombre:        string;
    latitud:       number;
    longitud:      number;
    foto_url:      string;
    google_score:  number;
    total_reviews: number;
    descripcion:  string;
}

export interface LugarData {
    id_api_place:  string;
    category:      string;
    mexican_state: string;
    nombre:        string;
    latitud:       number;
    longitud:      number;
    foto_url:      string;
    google_score:  number;
    total_reviews: number;
    descripcion:  string;
}

export interface LugaresListResponse {
  lugares: LugarData[];
  total: number;
}

export interface RecommendationRequest {
  lugarIds?: string[];
  query?: string;
  limit?: number;
}

export interface RecommendedLugar extends LugarData {
  hybridScore: number;
  proximityScore: number;
  preferenceScore: number;
  ratingScore: number;
}

export interface OptimizationRequest {
  lugarIds: string[];
}

export interface UpdateUserRequest {
  username?: string;
  nombre_completo?: string;
  privacity_mode?: boolean;
  foto?: File;
}

export interface UpdatePasswordRequest {
  newPassword: string;
}

export interface VerifyPasswordRequest {
  password: string;
}

export interface SearchUserResponse {
  users: Usuario[];
}

export interface Preferencias {
  id: number;
  usuario: Usuario;
  correo: string;
  lugares_preferidos: string[];
  estados_visitados: string[];
  actividades_preferidas: string[];
}
export interface Amigo {
  id: number;
  status: number;
  receiving_user: Usuario;
  requesting_user: Usuario;
  fecha_amistad: string | null;
}

export interface SendFriend {
  message: string;
  data: Amigo;
}

export interface RespondFriend {
  message: string;
  data: Amigo;
}
export interface ListRequest {
  message: string;
  data: Amigo[];
}

export type ListFriend = Amigo[];

export type ListRecomen = Array<{
  id: number;
  title: string;
  owner: any;
  actividades: any[];
  score: number;
}>;

export type SearchFriend = Usuario[];

export interface Block {
  message: string;
}

export interface UnBlock {
  message: string;
}
export interface FriendSuggestion {
  username: string;
  nombre_completo: string;
  correo: string;
  foto_url: string | null;
}

export interface FriendSuggestionResponse {
  message: string;
  data: FriendSuggestion[];
}

export interface ApiRoutes {
  // Auth
  doLogin: (correo: string, password: string) => Promise<Usuario>;
  doRegister: (body: RegisterRequest) => Promise<RegisterResponse>;

  // Itinerarios
  createItinerario: (
    body: CreateItinerarioRequest
  ) => Promise<CreateItinerarioResponse>;
  getMyItinerarios: () => Promise<ItinerarioListResponse>;
  deleteItinerario: (id: number | string) => Promise<{ message: string }>;
  
  // Agregados por el equipo (main):
  getItinerarioById: (id: number | string) => Promise<ItinerarioData>;
  updateItinerario: (
    id: number | string,
    body: CreateItinerarioRequest
  ) => Promise<CreateItinerarioResponse>;

  // Lugares
  createLugar: (body: CreateLugarRequest) => Promise<LugarData>;

  getLugares: (
    page: number,
    limit: number,
    state?: string,
    category?: string,
    nombre?: string
  ) => Promise<LugaresListResponse>;

  getLugarById: (id: string) => Promise<LugarData>;
  deleteLugar: (id: string) => Promise<{ message: string }>;

  // Recomendación de lugares
  getRecommendations: (
    body: RecommendationRequest
  ) => Promise<RecommendedLugar[]>;

  // Optimización de ruta
  optimizeRoute: (body: OptimizationRequest) => Promise<LugarData[]>;

  // Usuario
  getUser: () => Promise<Usuario>;
  updateUser: (body: UpdateUserRequest) => Promise<Usuario>;
  updatePassword: (body: UpdatePasswordRequest) => Promise<{ message: string }>;
  verifyPassword: (
    body: VerifyPasswordRequest
  ) => Promise<{ message: boolean }>;
  searchUsers: (query: string) => Promise<SearchUserResponse>;
  
  // TU AGREGADO (Vital para el perfil):
  getUserProfile: (query: string) => Promise<Usuario>;
  
  deleteUser: () => Promise<{ message: string }>;

  // Amigo
  sendFriendRequest: (receiving: string) => Promise<SendFriend>;
  respondFriendRequest: (id: number, state: number) => Promise<RespondFriend>;
  getRequests: () => Promise<ListRequest>;
  getFriends: () => Promise<ListFriend>;
  searchFriend: (query: string) => Promise<SearchFriend>;
  deleteFriend: (correo: string) => Promise<{ message: string }>;
  block: (user: string) => Promise<Block>;
  unblock: (user: string) => Promise<UnBlock>;

  //Recomendacion de new user
  getRecomen: () => Promise<ListRecomen>;

  // Sugerencias de amigos
  getFriendSuggestions: () => Promise<FriendSuggestionResponse>;

    // Reportes.
    createReport: (publicationId: number, reason: string) => Promise<CreateReportResponse>;
    getReports: () => Promise<Reporte[]>;
    getReportById: (reportId: number) => Promise<Reporte>;
    deleteReport: (reportId: number) => Promise<void>; // Manda error si no se puede eliminar
}
export interface CreateReportResponse {
    description:      string;
    publicacion:      Publicacion;
    usuario_emitente: UsuarioEmitente;
    id:               number;
}
export interface Reporte {
    id:               number;
    description:      string;
    usuario_emitente: UsuarioEmitente;
    historial:        Historial[];
}

export interface Historial {
    id:                 number;
    action_description: string;
}

export interface UsuarioEmitente {
    correo:          string;
    username:        string;
    password:        string;
    nombre_completo: string;
    foto_url:        string;
    role:            string;
    account_status:  boolean;
    privacity_mode:  boolean;
}


export interface Publicacion {
    id:             number;
    descripcion:    string;
    privacity_mode: boolean;
}

export interface UsuarioEmitente {
    correo: string;
}

export interface ShareItineraryRequest {
  descripcion: string;
  privacity_mode: boolean;
  fotos: File[];
}

export interface Foto {
    id: number;
    foto_url: string;
}

export interface Publicacion {
    id: number;
    descripcion: string;
    privacity_mode: boolean;
    itinerario: { id: number; nombre: string } | null; 
    fotos: Foto[]; // <-- AGREGADO: Array de fotos
    user_shared?: Usuario; // Lo dejamos opcional para evitar ciclos
}

export interface AverageRatingResponse {
  publicationId: number;
  averageRating: number;
  reviewCount: number;
}

export interface Actividad {
  fecha: string;
  description: string;
  lugarId: string;
  // Campos extendidos para tu UI moderna
  start_time?: string | null;
  end_time?: string | null;
}

export interface CreateItinerarioRequest {
  title: string;
  actividades: Actividad[];
  // Campos extendidos del BuilderMeta
  start_date?: string;
  end_date?: string;
  regions?: string[];
  visibility?: "private" | "friends" | "public";
}

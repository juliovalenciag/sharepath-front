export interface RegisterRequest {
    nombre_completo: string;
    correo:          string;
    password:        string;
    role:            string;
    username:        string;
    privacity_mode:  boolean;
}

export interface RegisterResponse {
    message: string;
}

export interface LoginResponse {
    token:   string;
    usuario: Usuario;
}

export interface Usuario {
    username:        string;
    nombre_completo: string;
    foto_url:        null | string;
    account_status:  boolean;
    privacity_mode:  boolean;
    role:            string;
    correo:          string;
    itineraryCount: number | null;
    friendsCount: number | null;
}

export interface ErrorResponse {
    message: string;
}

export interface Actividad {
    fecha:       string;        
    description: string;
    lugarId:     string;        
}

export interface CreateItinerarioRequest {
    title:       string;
    actividades: Actividad[];
}

export interface CreateItinerarioResponse {
    id:          number | string;
    title:       string;
    actividades: Actividad[];
    createdAt:   string;
    message?:    string;
}

export interface ItinerarioData {
    id:          number | string;
    title:       string;
    actividades: Actividad[];
    createdAt:   string;
    updatedAt?:  string;
}

export interface ItinerarioListResponse {
    itinerarios: ItinerarioData[];
    total:       number;
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
}

export interface LugaresListResponse {
    lugares: LugarData[];
    total:   number;
}

export interface UpdateUserRequest {
    username?:       string;
    nombre_completo?: string;
    privacity_mode?: boolean;
    foto?:           File;
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
    id: number, 
    usuario: Usuario, 
    correo: string, 
    lugares_preferidos : string [], 
    estados_visitados : string [], 
    actividades_preferidas : string []
}
export interface Amigo {
    id: number, 
    status: number, 
    receiving_user: Usuario, 
    requesting_user: Usuario, 
    fecha_amistad: string | null
}

export interface SendFriend {
    message : string; 
    data: Amigo[]; 
}

export interface RespondFriend {
    message: string; 
    data: Amigo[]; 
}
export interface ListRequest {
    message: string; 
    data: Amigo[]; 
}

export interface ListFriend {
    friends: Usuario[]; 
}
export interface ApiRoutes {
    // Auth
    doLogin: (correo: string, password: string) => Promise<Usuario>;
    doRegister: (body: RegisterRequest) => Promise<RegisterResponse>;

    // Itinerarios
    createItinerario: (body: CreateItinerarioRequest) => Promise<CreateItinerarioResponse>;
    getMyItinerarios: () => Promise<ItinerarioListResponse>;
    deleteItinerario: (id: number | string) => Promise<{ message: string }>;

    // Lugares
    createLugar: (body: CreateLugarRequest) => Promise<LugarData>;

    getLugares: (page: number, limit: number, state?: string, category?: string, nombre?:string) => Promise<LugaresListResponse>;

    getLugarById: (id: string) => Promise<LugarData>;
    deleteLugar: (id: string) => Promise<{ message: string }>;

    // Usuario
    getUser: () => Promise<Usuario>;
    updateUser: (body: UpdateUserRequest) => Promise<Usuario>;
    updatePassword: (body: UpdatePasswordRequest) => Promise<{ message: string }>;
    verifyPassword: (body: VerifyPasswordRequest) => Promise<{ message: boolean }>;
    searchUsers: (query: string) => Promise<SearchUserResponse>;
    deleteUser: () => Promise<{ message: string }>;

    // Amigo 
    sendFriendRequest: (receiving: string) => Promise<SendFriend>;
    respondFriendRequest: (id: number, state: number) => Promise<RespondFriend>;
    getRequests: () => Promise<ListRequest>;
    getFriends: () => Promise<ListFriend>; 

}

export interface ShareItineraryRequest {
    descripcion: string;
    privacity_mode: boolean;
}

export interface Publicacion {
    id: number;
    descripcion: string;
    privacity_mode: boolean;
    itinerario: any; 
    user_shared: Usuario;
}

export interface AverageRatingResponse {
    publicationId: number;
    averageRating: number;
    reviewCount: number;
}

export interface ApiRoutes {
    getAverageRating: (publicationId: number) => Promise<AverageRatingResponse>;
    shareItinerary: (itinerarioId: number, body: ShareItineraryRequest) => Promise<Publicacion>;
    getMyPublications: () => Promise<Publicacion[]>;
}
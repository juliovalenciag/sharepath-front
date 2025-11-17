import { 
    ApiRoutes, 
    ErrorResponse, 
    LoginResponse, 
    RegisterRequest, 
    RegisterResponse, 
    Usuario,
    CreateItinerarioRequest,
    CreateItinerarioResponse,
    ItinerarioListResponse,
    CreateLugarRequest,
    LugarData,
    LugaresListResponse,
    UpdateUserRequest,
    UpdatePasswordRequest,
    VerifyPasswordRequest,
    SearchUserResponse
} from "./interfaces/ApiRoutes";


export class ItinerariosAPI implements ApiRoutes {

    private static instance : ItinerariosAPI

    private HOST = "https://harol-lovers.up.railway.app"


    private constructor() {}

    static getInstance() : ItinerariosAPI {
        if (!ItinerariosAPI.instance) 
            this.instance = new ItinerariosAPI();
        return this.instance;
    }

    // ===== PETICIONES GENÉRICAS =====
    private async post<T>(route: string, auth: boolean, body: object): Promise<T> {
        const token = auth ? localStorage.getItem('authToken') : undefined;
        const request = await fetch(`${this.HOST}${route}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                ...(token && { token })
            }
        });

        const data = await request.json();

        if (!request.ok) {
            const { message } = data as ErrorResponse;
            throw new Error(message);
        }

        return data as T;
    }

    private async put<T>(route: string, auth: boolean, body: object): Promise<T> {
        const token = auth ? localStorage.getItem('authToken') : undefined;
        const request = await fetch(`${this.HOST}${route}`, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                ...(token && { token })
            }
        });
        console.log('Hice la petición');
        
        console.log(request);
    
        const data = await request.json();

        console.log('Parsee los datos a JSON, ' + request.status);
        console.log(data);
        
        

        if (!request.ok) {
            const { message } = data as ErrorResponse;
            throw new Error(message);
        }

        return data as T;
    }

    private async putFormData<T>(route: string, formData: FormData): Promise<T> {
        const token = localStorage.getItem('authToken') || "";
        const request = await fetch(`${this.HOST}${route}`, {
            method: 'PUT',
            body: formData,
            headers: {
                ...(token && { token })
            }
        });

        const data = await request.json();

        if (!request.ok) {
            const { message } = data as ErrorResponse;
            throw new Error(message);
        }

        return data as T;
    }

    private async get<T>(route: string, auth: boolean = true): Promise<T> {
        const token = auth ? localStorage.getItem('authToken') : undefined;
        const request = await fetch(`${this.HOST}${route}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                ...(token && { token })
            }
        });

        const data = await request.json();

        if (!request.ok) {
            const { message } = data as ErrorResponse;
            throw new Error(message);
        }

        return data as T;
    }

    private async delete<T>(route: string): Promise<T> {
        const token = localStorage.getItem('authToken') || "";
        const request = await fetch(`${this.HOST}${route}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                token
            }
        });

        const data = await request.json();

        if (!request.ok) {
            console.log(data);
            
            const { message } = data as ErrorResponse;
            throw new Error(message);
        }

        return data as T;
    }

    // ===== AUTH =====
    async doLogin(correo: string, password: string): Promise<Usuario> {
        
        const { token, usuario } = await this.put<LoginResponse>("/auth", false, { correo, password });

        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(usuario));

        return usuario;
    }
    async doRegister(body: RegisterRequest) : Promise<RegisterResponse> {
        const resp = await this.post<RegisterResponse>("/auth/register", false, body);
        return resp;
    }

    // ===== ITINERARIOS =====
    async createItinerario(body: CreateItinerarioRequest): Promise<CreateItinerarioResponse> {
        return await this.post<CreateItinerarioResponse>("/itinerario/registro", true, body);
    }

    async getMyItinerarios(): Promise<ItinerarioListResponse> {
        return await this.get<ItinerarioListResponse>("/itinerario", true);
    }

    async deleteItinerario(id: number | string): Promise<{ message: string }> {
        return await this.delete<{ message: string }>(`/itinerario/${id}`);
    }

    // ===== LUGARES =====
    async createLugar(body: CreateLugarRequest): Promise<LugarData> {
        return await this.post<LugarData>("/lugar/registro", true, body);
    }

    async getLugares(page: number = 1, limit: number = 10, state?: string, category?: string): Promise<LugaresListResponse> {
        let query = `/lugar?pague=${page}&limit=${limit}`;
        
        if (state) query += `&mexican_state=${encodeURIComponent(state)}`;
        if (category) query += `&category=${encodeURIComponent(category)}`;

        return await this.get<LugaresListResponse>(query, true);
    }

    async getLugarById(id: string): Promise<LugarData> {
        return await this.get<LugarData>(`/lugar/${id}`, true);
    }

    async deleteLugar(id: string): Promise<{ message: string }> {
        return await this.delete<{ message: string }>(`/lugar/${id}`);
    }

    // ===== USUARIO =====
    async getUser(): Promise<Usuario> {
        return await this.get<Usuario>("/user", true);
    }

    async updateUser(body: UpdateUserRequest): Promise<Usuario> {
        // Si hay archivo (foto), usar FormData
        console.log(body);

        const formData = new FormData();
            
        if (body.username) formData.append('username', body.username);
        if (body.nombre_completo) formData.append('nombre_completo', body.nombre_completo);
        if (body.privacity_mode !== undefined) formData.append('privacity_mode', String(body.privacity_mode));
        if (body.foto) formData.append('foto', body.foto);

        return await this.putFormData<Usuario>("/user/update", formData);
        
    }

    async updatePassword(body: UpdatePasswordRequest): Promise<{ message: string }> {
        return await this.put<{ message: string }>("/user/update-password", true, body);
    }

    async verifyPassword(body: VerifyPasswordRequest): Promise<{ valid: boolean }> {
        return await this.post<{ valid: boolean }>("/user/verify-password", true, body);
    }

    async searchUsers(query: string): Promise<SearchUserResponse> {
        return await this.get<SearchUserResponse>(`/user/search?q=${encodeURIComponent(query)}`, true);
    }

    async deleteUser(): Promise<{ message: string }> {
        return await this.delete<{ message: string }>("/user");
    }
}
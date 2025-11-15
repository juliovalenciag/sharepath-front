

import { ApiRoutes, ErrorResponse, LoginResponse, RegisterRequest, RegisterResponse, Usuario } from "./interfaces/ApiRoutes";


export class ItinerariosAPI implements ApiRoutes {

    private static instance : ItinerariosAPI

    private HOST = "https://harol-lovers.up.railway.app"


    private constructor() {}

    static getInstance() : ItinerariosAPI {
        if (!ItinerariosAPI.instance) 
            this.instance = new ItinerariosAPI();
        return this.instance;
    }
    async post<T>(route: string, auth: boolean, body: Object) {
        const token = auth ? localStorage.getItem('authToken') : undefined
        const request = await fetch(`${this.HOST}${route}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                ...(token && { token })
            }
        });
        
        const data = await request.json();

        if(!request.ok) {
            const { message } = data as ErrorResponse
            throw new Error(message);
        }
        
        return data as T
    }
    async put<T>(route: string, auth: boolean, body: Object) {
        const token = auth ? localStorage.getItem('authToken') : undefined
        const request = await fetch(`${this.HOST}${route}`, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                ...(token && { token })
            }
        });
        
        const data = await request.json();

        if(!request.ok) {
            const { message } = data as ErrorResponse
            throw new Error(message);
        }
        
        return data as T
    }

    async delete<T>(route: string) {
        const token = localStorage.getItem('authToken') || ""
        const request = await fetch(`${this.HOST}${route}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                token
            }
        });
        
        const data = await request.json();

        if(!request.ok) {
            const { message } = data as ErrorResponse
            throw new Error(message);
        }
        
        return data as T
    
    }
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
}
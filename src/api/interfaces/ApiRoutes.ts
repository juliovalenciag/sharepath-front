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
    foto_url:        null;
    account_status:  boolean;
    privacity_mode:  boolean;
    role:            string;
    correo:          string;
}
export interface ErrorResponse {
    message: string;
}

export interface ApiRoutes {

    doLogin: (correo: string, password: string) => Promise<any>;

}
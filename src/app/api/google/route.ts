// Logica del backend para verificar el token de google
export const CLIENT_ID ="934272342967-it58ahq1jmjt347vm7t1mopi7hnql9dl.apps.googleusercontent.com"; // --ID de google cloud
import { OAuth2Client } from "google-auth-library"; //-- libreria para verificar el token
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const client = new OAuth2Client(CLIENT_ID);
  if (!body) {
    const response = NextResponse.json(
      {
        message: "body no existe",
      },
      {
        status: 400,
      }
    );
    return response;
  }

  async function verify(body: any) {
    const ticket = await client.verifyIdToken({ //verifica servidores token de google
      idToken: body.token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload;
  }

  try {
    const payload = await verify(body);
    return NextResponse.json(payload);
  } catch (error) {
    const response = NextResponse.json(
      {
        code: 400,
        message: error instanceof Error ? error.message : "Desconocido",
      },
      {
        status: 400,
      }
    );
    return response;
  }
}


import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export function zodErrorResponse(err: ZodError): Response {
  return NextResponse.json(
    {
      error: "Solicitud inválida",
      issues: err.flatten(),
    },
    { status: 400 }
  );
}

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "JSON inválido en el cuerpo de la solicitud" },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return { ok: false, response: zodErrorResponse(result.error) };
  }

  return { ok: true, data: result.data };
}

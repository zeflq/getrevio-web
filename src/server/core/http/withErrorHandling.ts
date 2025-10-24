import { NextResponse } from "next/server";

type RouteHandler = (...args: any[]) => Promise<Response>;

const FORBIDDEN_MESSAGE = "FORBIDDEN";

export function withErrorHandling<T extends RouteHandler>(handler: T) {
  return (async (...args: Parameters<T>): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof Error && error.message === FORBIDDEN_MESSAGE) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      console.error(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }) as T;
}

import type { NextRequest, NextResponse } from "next/server";

import {
  assertSuperAdmin,
  assertTenantAccess,
  GuardAuthError,
  resolveAuthContext,
  type AuthContext,
} from "@/server/core/guards/authGuards";

function mapError(error: unknown): Response {
  if (error instanceof GuardAuthError) {
    return new Response(error.message, { status: error.status });
  }

  throw error;
}

type RouteContext<Params> = { params: Params };
type GuardedRouteHandler<Params, Result extends Response | NextResponse = Response> = (
  req: NextRequest,
  context: RouteContext<Params>
) => Promise<Result>;

type ApiHandlerArgs<Params> = {
  req: NextRequest;
  params: Params;
  auth: AuthContext;
};

type ApiHandler<Params, Result extends Response | NextResponse = Response> = (
  args: ApiHandlerArgs<Params>
) => Promise<Result>;

export function withApiAuth<Params, Result extends Response | NextResponse = Response>(
  handler: ApiHandler<Params, Result>
): GuardedRouteHandler<Params, Result> {
  return async (req, context) => {
    try {
      const auth = await resolveAuthContext();
      return await handler({ req, params: context.params, auth });
    } catch (error) {
      return mapError(error) as Result;
    }
  };
}

export function withApiSuperAdmin<
  Params,
  Result extends Response | NextResponse = Response,
>(handler: ApiHandler<Params, Result>) {
  return withApiAuth<Params, Result>(async (args) => {
    assertSuperAdmin(args.auth);
    return handler(args);
  });
}

export function withApiTenantGuard<
  Params,
  Result extends Response | NextResponse = Response,
>(resolveTenantId: (params: Params) => string | undefined) {
  return (handler: ApiHandler<Params, Result>) =>
    withApiAuth<Params, Result>(async (args) => {
      const tenantId = assertTenantAccess(args.auth, resolveTenantId(args.params));

      return handler({
        ...args,
        auth: {
          ...args.auth,
          tenantId,
        },
      });
    });
}

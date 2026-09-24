import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistisk kontroll: skicka utloggade besökare till inloggningen.
// Den riktiga behörighetskontrollen görs i requireUser() på servern.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/logga-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|logga-in|registrera|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp|ico)$).*)"],
};

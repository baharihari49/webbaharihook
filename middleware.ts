import { withAuth } from "next-auth/middleware"

// Protect dashboard routes only
export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
})

// Only protect dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
}
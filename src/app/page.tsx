import { redirect } from "next/navigation";

// The middleware handles auth-based redirection; this just forwards to it.
export default function Home() {
  redirect("/dashboard");
}

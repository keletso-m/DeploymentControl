import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main>
      <h1>Sign in to DeployControl</h1>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/dashboard" });
        }}
      >
        <button type="submit">Sign in with GitHub</button>
      </form>
    </main>
  );
}

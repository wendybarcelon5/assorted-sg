import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <p className="text-lg font-bold">
            Loading login...
          </p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
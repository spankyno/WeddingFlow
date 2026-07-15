import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment">
      <SignUp appearance={{ variables: { colorPrimary: "#b6924f" } }} />
    </div>
  );
}

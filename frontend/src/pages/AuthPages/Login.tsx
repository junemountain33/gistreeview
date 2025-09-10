import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import LoginForm from "../../components/auth/LoginForm";

export default function Login() {
  return (
    <>
      <PageMeta
        title="React.js Login Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Login Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  );
}

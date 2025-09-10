import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import RegisterForm from "../../components/auth/RegisterForm";

export default function Register() {
  return (
    <>
      <PageMeta
        title="React.js Register Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Register Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <RegisterForm />
      </AuthLayout>
    </>
  );
}

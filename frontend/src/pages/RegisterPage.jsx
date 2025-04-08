import { Typography } from "antd";
import RegisterForm from "../components/auth/RegisterForm";

const { Title } = Typography;

const RegisterPage = () => {
  return (
    <div className="max-w-md mx-auto mt-8">
      <Title level={2} className="text-center mb-8">
        Create an Account
      </Title>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;

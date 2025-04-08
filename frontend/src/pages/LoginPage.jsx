import { Typography } from "antd";
import LoginForm from "../components/auth/LoginForm";

const { Title } = Typography;

const LoginPage = () => {
  return (
    <div className="max-w-md mx-auto mt-8">
      <Title level={2} className="text-center mb-8">
        Log in to Your Account
      </Title>
      <LoginForm />
    </div>
  );
};

export default LoginPage;

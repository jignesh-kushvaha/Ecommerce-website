import { useState } from "react";
import { Form, Input, Button, Alert, Select } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;

const RegisterForm = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await register(values);
      setSuccess("Registration successful! You can now log in.");
      // Form will be redirected to login page by the AuthContext
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

      {error && (
        <Alert message={error} type="error" showIcon className="mb-4" />
      )}

      {success && (
        <Alert message={success} type="success" showIcon className="mb-4" />
      )}

      <Form name="register" onFinish={onFinish} layout="vertical">
        <Form.Item
          name="name"
          rules={[
            { required: true, message: "Please enter your name" },
            { min: 2, message: "Name must be at least 2 characters" },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Full Name"
            size="large"
            className="form-input"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            size="large"
            className="form-input"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 4, message: "Password must be at least 4 characters" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
            className="form-input"
          />
        </Form.Item>

        {/* <Form.Item
          name="userType"
          rules={[{ required: true, message: "Please select user type" }]}
          initialValue="customer"
        >
          <Select
            placeholder="Select user type"
            size="large"
            className="form-input"
          >
            <Option value="customer">Customer</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item> */}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-10 bg-blue-500 hover:bg-blue-600"
          >
            Register
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center mt-4">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:text-blue-700">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;

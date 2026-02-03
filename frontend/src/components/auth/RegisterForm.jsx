import { useState } from "react";
import { Form, Input, Button, Alert, Select, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;

const RegisterForm = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError("");
      setValidationErrors([]);
      setSuccess("");
      await register(values);
      setSuccess("Registration successful! You can now log in.");
      form.resetFields();
    } catch (err) {
      // Check if error response contains validation errors array
      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        setValidationErrors(err.response.data.errors);
        setError(err.response.data.message || "Validation failed");
      } else {
        setError(err.message || "Failed to register");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

      {error && (
        <div className="mb-4 space-y-2">
          <Alert message={error} type="error" showIcon />
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-2 mb-2">
                <ExclamationCircleOutlined className="text-red-600 mt-1" />
                <span className="font-semibold text-red-700">
                  Please fix the following errors:
                </span>
              </div>
              <ul className="space-y-1 ml-6">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="text-red-600 text-sm">
                    <strong>{err.field}:</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {success && (
        <Alert message={success} type="success" showIcon className="mb-4" />
      )}

      <Form name="register" form={form} onFinish={onFinish} layout="vertical">
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
          rules={[{ required: true, message: "Please enter your password" }]}
          tooltip={{
            title:
              "Password must contain: 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&) and be at least 8 characters",
            icon: <ExclamationCircleOutlined />,
          }}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password (min 8 chars with uppercase, number, special char)"
            size="large"
            className="form-input"
          />
        </Form.Item>

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

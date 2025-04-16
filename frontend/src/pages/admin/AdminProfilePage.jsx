import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Divider,
  Spin,
  Upload,
  Avatar,
  Tabs,
  Row,
  Col,
} from "antd";
import { UserOutlined, UploadOutlined, LockOutlined } from "@ant-design/icons";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/userService.js";
import { useLocation, useNavigate } from "react-router-dom";

const { Title } = Typography;

const AdminProfilePage = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the active tab based on URL
  const getActiveTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    if (tab === "edit") return "2";
    if (tab === "password") return "3";
    return "1"; // Default to view profile
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.search]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
        form.setFieldsValue({
          name: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber || "",
          address: {
            street: response.data.address?.street || "",
            city: response.data.address?.city || "",
            state: response.data.address?.state || "",
            country: response.data.address?.country || "",
            postalCode: response.data.address?.postalCode || "",
          },
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        message.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  const handleProfileUpdate = async (values) => {
    try {
      setSubmitting(true);

      const formData = new FormData();

      // Append text fields
      formData.append("name", values.name);
      formData.append("phoneNumber", values.phoneNumber);

      // Append address fields
      if (values.address) {
        Object.keys(values.address).forEach((key) => {
          formData.append(`address[${key}]`, values.address[key] || "");
        });
      }

      // Append profile image if exists
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await updateProfile(formData);
      message.success("Profile updated successfully");

      // Refresh profile data
      const response = await getProfile();
      setProfile(response.data);

      // Navigate to view profile tab
      navigate("/admin/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setSubmitting(true);
      await changePassword(values);
      message.success("Password updated successfully");
      passwordForm.resetFields();
      // Navigate to view profile tab
      navigate("/admin/profile");
    } catch (error) {
      console.error("Error updating password:", error);
      message.error("Failed to update password: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = ({ file }) => {
    if (file.status !== "uploading") {
      setProfileImage(file.originFileObj);
    }
  };

  const handleTabChange = (key) => {
    if (key === "1") navigate("/admin/profile");
    if (key === "2") navigate("/admin/profile?tab=edit");
    if (key === "3") navigate("/admin/profile?tab=password");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-8">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  const ViewProfileTab = () => (
    <div className="flex flex-col md:flex-row gap-6">
      <Card className="w-full md:w-1/3 mb-6 md:mb-0">
        <div className="flex flex-col items-center">
          <Avatar
            size={120}
            icon={<UserOutlined />}
            src={
              profile?.profileImage
                ? `/backend/public/${profile.profileImage}`
                : null
            }
            className="mb-4"
          />
          <Title level={4}>{profile?.name}</Title>
          <p className="text-gray-500">{profile?.email}</p>
          <Divider />
          <p className="font-semibold text-blue-600">
            Role: {profile?.userType}
          </p>
        </div>
      </Card>

      <Card className="w-full md:w-2/3">
        <Title level={4} className="mb-4">
          Profile Details
        </Title>
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <div className="flex flex-col">
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{profile?.name}</p>
            </div>
          </Col>
          <Col span={24}>
            <div className="flex flex-col">
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>
          </Col>
          <Col span={24}>
            <div className="flex flex-col">
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">
                {profile?.phoneNumber || "Not provided"}
              </p>
            </div>
          </Col>
        </Row>

        <Divider />
        <Title level={5}>Address Information</Title>

        <Row gutter={[16, 24]}>
          <Col span={24}>
            <div className="flex flex-col">
              <p className="text-gray-500">Street</p>
              <p className="font-medium">
                {profile?.address?.street || "Not provided"}
              </p>
            </div>
          </Col>
          <Col span={12}>
            <div className="flex flex-col">
              <p className="text-gray-500">City</p>
              <p className="font-medium">
                {profile?.address?.city || "Not provided"}
              </p>
            </div>
          </Col>
          <Col span={12}>
            <div className="flex flex-col">
              <p className="text-gray-500">State</p>
              <p className="font-medium">
                {profile?.address?.state || "Not provided"}
              </p>
            </div>
          </Col>
          <Col span={12}>
            <div className="flex flex-col">
              <p className="text-gray-500">Postal Code</p>
              <p className="font-medium">
                {profile?.address?.postalCode || "Not provided"}
              </p>
            </div>
          </Col>
          <Col span={12}>
            <div className="flex flex-col">
              <p className="text-gray-500">Country</p>
              <p className="font-medium">
                {profile?.address?.country || "Not provided"}
              </p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const EditProfileTab = () => (
    <Card>
      <Title level={4} className="mb-4">
        Edit Profile
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleProfileUpdate}
        initialValues={{
          name: profile?.name,
          email: profile?.email,
          phoneNumber: profile?.phoneNumber || "",
          address: {
            street: profile?.address?.street || "",
            city: profile?.address?.city || "",
            state: profile?.address?.state || "",
            country: profile?.address?.country || "",
            postalCode: profile?.address?.postalCode || "",
          },
        }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="email" label="Email">
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          rules={[
            {
              pattern: /^(\+\d{1,3}[- ]?)?\d{10}$/,
              message: "Please enter a valid phone number",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Profile Image">
          <Upload
            onChange={handleImageChange}
            beforeUpload={() => false}
            maxCount={1}
            showUploadList={true}
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </Form.Item>

        <Divider />
        <Title level={5}>Address Information</Title>

        <Form.Item name={["address", "street"]} label="Street">
          <Input />
        </Form.Item>

        <Form.Item name={["address", "city"]} label="City">
          <Input />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name={["address", "state"]} label="State">
            <Input />
          </Form.Item>

          <Form.Item name={["address", "postalCode"]} label="Postal Code">
            <Input />
          </Form.Item>
        </div>

        <Form.Item name={["address", "country"]} label="Country">
          <Input />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="mt-4"
          >
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const PasswordChangeTab = () => (
    <Card>
      <Title level={4} className="mb-4">
        Change Password
      </Title>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handlePasswordChange}
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please enter your new password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match")
                );
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="mt-4"
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <div>
      <Title level={2} className="mb-6">
        Admin Profile
      </Title>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <Tabs.TabPane tab="View Profile" key="1">
          <ViewProfileTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Edit Profile" key="2">
          <EditProfileTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Change Password" key="3">
          <PasswordChangeTab />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AdminProfilePage;

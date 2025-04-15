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
} from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { getProfile, updateProfile } from "../../services/userService.js";

const { Title } = Typography;

const AdminProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

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
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = ({ file }) => {
    if (file.status !== "uploading") {
      setProfileImage(file.originFileObj);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-8">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} className="mb-6">
        Admin Profile
      </Title>

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
      </div>
    </div>
  );
};

export default AdminProfilePage;

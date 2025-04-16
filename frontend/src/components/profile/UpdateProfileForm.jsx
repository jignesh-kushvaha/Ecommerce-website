import { useState } from "react";
import { Form, Input, Button, Upload, message, Space, Typography } from "antd";
import { UploadOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { updateProfile } from "../../services/userService";

const { Title } = Typography;

const UpdateProfileForm = ({
  profile,
  onSuccess,
  onCancel,
  isAdmin = false,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Create properly formatted data for backend
      const formData = {
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        userType: values.userType,
        // Format address as a nested object
        address: {
          street: values["address.street"] || "",
          city: values["address.city"] || "",
          state: values["address.state"] || "",
          country: values["address.country"] || "",
          postalCode: values["address.postalCode"] || "",
        },
      };

      // Debug logging to verify correct data formatting
      console.log("Sending formatted data:", formData);
      console.log("Address JSON:", JSON.stringify(formData.address));

      // Add profile image if selected
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.profileImage = fileList[0].originFileObj;
      }

      const response = await updateProfile(formData);

      if (response.success) {
        message.success({
          content: "Profile updated successfully!",
          duration: 2,
          className: "custom-message",
        });
        if (onSuccess) {
          onSuccess(response.data);
        }
      }
    } catch (error) {
      console.error(error);
      message.error({
        content: error.message || "Failed to update profile",
        duration: 3,
        className: "custom-message",
      });
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFileChange = (info) => {
    let fileList = [...info.fileList];

    // Limit to one file
    fileList = fileList.slice(-1);

    // Read the file as a preview
    fileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(fileList);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const formItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="text-blue-600 font-medium">
          {isAdmin ? "Edit Admin Profile" : "Edit Profile"}
        </Title>
      </div>

      <Form
        form={form}
        {...formItemLayout}
        initialValues={{
          name: profile?.name || "",
          email: profile?.email || "",
          phoneNumber: profile?.phoneNumber || "",
          userType: profile?.userType || "customer",
          "address.street": profile?.address?.street || "",
          "address.city": profile?.address?.city || "",
          "address.state": profile?.address?.state || "",
          "address.country": profile?.address?.country || "",
          "address.postalCode": profile?.address?.postalCode || "",
        }}
        onFinish={onFinish}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="space-y-4">
          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Full Name</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Please enter your name" }]}
                className="mb-0"
              >
                <Input
                  placeholder="Your full name"
                  className="border-gray-200"
                />
              </Form.Item>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Email</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email",
                  },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Your email address"
                  className="border-gray-200"
                />
              </Form.Item>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">User Type</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item name="userType" className="mb-0">
                <Input
                  disabled
                  className="border-gray-200 bg-gray-100 text-gray-600"
                />
              </Form.Item>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Phone Number</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item
                name="phoneNumber"
                rules={[
                  {
                    pattern: /^(\+\d{1,3}[- ]?)?\d{10}$/,
                    message: "Please enter a valid phone number",
                  },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Your phone number"
                  className="border-gray-200"
                />
              </Form.Item>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Street Address</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item name="address.street" className="mb-0">
                <Input
                  placeholder="Street address"
                  className="border-gray-200"
                />
              </Form.Item>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">City</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item name="address.city" className="mb-0">
                <Input placeholder="City" className="border-gray-200" />
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">State/Province</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item name="address.state" className="mb-0">
                <Input
                  placeholder="State or province"
                  className="border-gray-200"
                />
              </Form.Item>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Country</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item name="address.country" className="mb-0">
                <Input placeholder="Country" className="border-gray-200" />
              </Form.Item>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Postal Code</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item name="address.postalCode" className="mb-0">
                <Input placeholder="Postal code" className="border-gray-200" />
              </Form.Item>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Profile Picture</span>
            </div>
            <div className="px-4 py-3">
              <Form.Item
                name="profileImage"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                className="mb-0"
              >
                <Upload
                  name="profileImage"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  fileList={fileList}
                  onChange={handleFileChange}
                >
                  <Button
                    icon={<UploadOutlined />}
                    className="border border-gray-300 hover:border-blue-400"
                  >
                    Select Image
                  </Button>
                </Upload>
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end mt-6 space-x-4">
          <Button
            onClick={handleCancel}
            icon={<CloseOutlined />}
            size="large"
            className="flex items-center"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
            className="flex items-center"
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UpdateProfileForm;

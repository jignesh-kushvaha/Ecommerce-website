import { useState, useEffect } from "react";
import { Typography, Row, Col, Card, Spin, Tabs, message, Button } from "antd";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../services/userService";
import UpdateProfileForm from "./UpdateProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { useLocation, useNavigate } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import API_ENDPOINTS from "../../config/apiConfig";

const { Title } = Typography;

const ProfileComponent = ({ isAdmin = false }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the tab parameter from the URL
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabFromUrl === "password" ? "password" : "profile"
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfile();

        if (response && response.success && response.data) {
          setProfile(response.data);
        } else {
          message.error({
            content: "Invalid profile data received",
            duration: 3,
            className: "custom-message",
          });
          console.error("Invalid profile data:", response);
        }
      } catch (error) {
        message.error({
          content: "Failed to load profile",
          duration: 3,
          className: "custom-message",
        });
        console.error("Profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl === "password") {
      setActiveTab("password");
    } else {
      setActiveTab("profile");
    }
  }, [tabFromUrl]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setEditMode(false);
    message.success({
      content: "Profile updated successfully",
      duration: 2,
      className: "custom-message",
    });
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleTabChange = (key) => {
    const basePath = isAdmin ? "/admin/profile" : "/profile";
    if (key === "password") {
      navigate(`${basePath}?tab=password`);
    } else {
      navigate(basePath);
    }
  };

  const ProfileView = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="text-blue-600 font-medium">
          Profile Information
        </Title>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={toggleEditMode}
          className="flex items-center"
        >
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Full Name</span>
          </div>
          <div className="px-4 py-3">
            <span>{profile?.name || "Not set"}</span>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Email</span>
          </div>
          <div className="px-4 py-3">
            <span>{profile?.email || "Not set"}</span>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Phone Number</span>
          </div>
          <div className="px-4 py-3">
            <span>{profile?.phoneNumber || "Not set"}</span>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">User Type</span>
          </div>
          <div className="px-4 py-3">
            <span className="capitalize">
              {profile?.userType || "Regular User"}
            </span>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Street Address</span>
          </div>
          <div className="px-4 py-3">
            <span>{profile?.address?.street || "Not set"}</span>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">City</span>
          </div>
          <div className="px-4 py-3">
            <span>{profile?.address?.city || "Not set"}</span>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">State/Province</span>
          </div>
          <div className="px-4 py-3">
            <span>{profile?.address?.state || "Not set"}</span>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Country</span>
          </div>
          <div className="px-4 py-3">
            <span>{profile?.address?.country || "Not set"}</span>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Postal Code</span>
          </div>
          <div className="px-4 py-3">
            <span>{profile?.address?.postalCode || "Not set"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const items = [
    {
      key: "profile",
      label: "Profile",
      children:
        profile &&
        (editMode ? (
          <UpdateProfileForm
            profile={profile}
            onSuccess={handleProfileUpdate}
            onCancel={() => setEditMode(false)}
            isAdmin={isAdmin}
          />
        ) : (
          <ProfileView />
        )),
    },
    {
      key: "password",
      label: "Change Password",
      children: (
        <ChangePasswordForm
          navigateAfterSuccess={isAdmin ? "/admin/profile" : "/profile"}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">
        {isAdmin ? "Admin Profile" : "My Profile"}
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="mb-6 text-center">
            <div className="mb-4">
              {profile?.profileImage ? (
                <img
                  src={`${API_ENDPOINTS.base}${profile.profileImage}`}
                  alt="Profile"
                  className="rounded-full w-48 h-48 mx-auto object-cover"
                />
              ) : (
                <div className="bg-gray-200 rounded-full w-48 h-48 mx-auto flex items-center justify-center">
                  <span className="text-4xl text-gray-500">
                    {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
            <Title level={3}>{profile?.name || "User"}</Title>
            <p className="text-gray-500">{profile?.email || ""}</p>
            <p className="text-gray-500 capitalize">
              {profile?.userType || "User"}
            </p>
            {profile?.phoneNumber && (
              <p className="text-gray-500">{profile.phoneNumber}</p>
            )}
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={items}
              className="p-4"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileComponent;

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Input,
  Button,
  Space,
  Typography,
  Spin,
  Select,
  Avatar,
  message,
} from "antd";
import { SearchOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { getAllUsers } from "../../services/adminService.js";

const { Title } = Typography;
const { Option } = Select;

const AdminUsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    userType: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getAllUsers(params);

      setUsers(response.data);
      setPagination({
        ...pagination,
        total: response.total,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      email: "",
      userType: "",
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar
            src={
              record.profileImage
                ? `/backend/public/${record.profileImage}`
                : null
            }
            icon={<UserOutlined />}
            size="small"
            className="mr-2"
          />
          {text}
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => text || "Not provided",
    },
    {
      title: "Type",
      dataIndex: "userType",
      key: "userType",
      render: (text) => (
        <Tag color={text === "admin" ? "red" : "blue"}>{text}</Tag>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (address) => {
        if (!address || !address.city) return "No address provided";
        return `${address.city}, ${address.country || ""}`;
      },
    },
  ];

  return (
    <div>
      <Title level={2} className="mb-6">
        <TeamOutlined className="mr-2" /> User Management
      </Title>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <Input
              placeholder="Filter by name"
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </div>
          <div>
            <Input
              placeholder="Filter by email"
              value={filters.email}
              onChange={(e) => handleFilterChange("email", e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </div>
          <div>
            <Select
              placeholder="User Type"
              value={filters.userType || undefined}
              onChange={(value) => handleFilterChange("userType", value)}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="admin">Admin</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </div>
          <Button type="primary" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default AdminUsersPage;

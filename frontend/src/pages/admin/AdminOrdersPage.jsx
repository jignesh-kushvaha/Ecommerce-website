import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Input,
  Button,
  Typography,
  DatePicker,
  Select,
  message,
  Space,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  getAllOrders,
  updateOrderStatus,
} from "../../services/adminService.js";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminOrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    userId: "",
    startDate: null,
    endDate: null,
  });
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getAllOrders(params);

      setOrders(response.data);
      setPagination({
        ...pagination,
        total: response.total,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to load orders");
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

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dates[0].startOf("day").toISOString(),
        endDate: dates[1].endOf("day").toISOString(),
      });
    } else {
      setFilters({
        ...filters,
        startDate: null,
        endDate: null,
      });
    }
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      userId: "",
      startDate: null,
      endDate: null,
    });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      message.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error("Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Order status renderer with color-coded tags
  const renderOrderStatus = (status, record) => {
    const isUpdating = updatingOrder === record._id;

    return (
      <Select
        value={status}
        style={{ width: 130 }}
        onChange={(value) => handleStatusChange(record._id, value)}
        disabled={isUpdating}
        loading={isUpdating}
      >
        <Option value="Pending">
          <Tag color="gold">Pending</Tag>
        </Option>
        <Option value="Processing">
          <Tag color="blue">Processing</Tag>
        </Option>
        <Option value="Shipped">
          <Tag color="cyan">Shipped</Tag>
        </Option>
        <Option value="Delivered">
          <Tag color="green">Delivered</Tag>
        </Option>
        <Option value="Cancelled">
          <Tag color="red">Cancelled</Tag>
        </Option>
      </Select>
    );
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "id",
      render: (id) => (
        <Text ellipsis style={{ width: 120 }}>
          {id}
        </Text>
      ),
    },
    {
      title: "Customer",
      dataIndex: "userId",
      key: "user",
      render: (user, record) => user?.name || record.userName || "Anonymous",
    },
    {
      title: "Email",
      dataIndex: "userId",
      key: "email",
      render: (user, record) => user?.email || record.userEmail || "N/A",
    },
    {
      title: "Amount",
      dataIndex: "totalPrice",
      key: "amount",
      render: (amount) => `₹${amount?.toFixed(2)}`,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderOrderStatus,
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Processing", value: "Processing" },
        { text: "Shipped", value: "Shipped" },
        { text: "Delivered", value: "Delivered" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "payment",
      render: (method) => method,
    },
  ];

  return (
    <div>
      <Title level={2} className="mb-6">
        <ShoppingCartOutlined className="mr-2" /> Order Management
      </Title>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <Input
              placeholder="Search by order ID"
              value={filters.orderId}
              onChange={(e) => handleFilterChange("orderId", e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </div>
          <div>
            <Input
              placeholder="Search by customer name"
              value={filters.customerName}
              onChange={(e) =>
                handleFilterChange("customerName", e.target.value)
              }
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </div>
          <div>
            <Select
              placeholder="Order Status"
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="Pending">Pending</Option>
              <Option value="Processing">Processing</Option>
              <Option value="Shipped">Shipped</Option>
              <Option value="Delivered">Delivered</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </div>
          <div>
            <RangePicker
              placeholder={["Start Date", "End Date"]}
              onChange={handleDateRangeChange}
              allowClear
              style={{ width: 250 }}
              prefix={<CalendarOutlined />}
            />
          </div>
          <Button type="primary" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
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
          expandable={{
            expandedRowRender: (record) => (
              <div>
                <Title level={5}>Order Items</Title>
                <Table
                  columns={[
                    {
                      title: "Product",
                      dataIndex: "productId",
                      key: "product",
                      render: (product, item) =>
                        product?.name || item.name || "Unknown Product",
                    },
                    {
                      title: "Price",
                      dataIndex: "price",
                      key: "price",
                      render: (price) => `₹${price?.toFixed(2)}`,
                    },
                    {
                      title: "Quantity",
                      dataIndex: "quantity",
                      key: "quantity",
                    },
                    {
                      title: "Subtotal",
                      dataIndex: "subtotal",
                      key: "subtotal",
                      render: (subtotal, item) =>
                        `₹${(item.price * item.quantity).toFixed(2)}`,
                    },
                  ]}
                  dataSource={record.products}
                  rowKey={(item) =>
                    `${record._id}-${item.productId?._id || item.productId}`
                  }
                  pagination={false}
                />
                <div className="mt-4">
                  <Title level={5}>Shipping Address</Title>
                  <p>
                    <strong>Name:</strong> {record.shippingAddress.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {record.shippingAddress.address},{" "}
                    {record.shippingAddress.city},{" "}
                    {record.shippingAddress.postalCode},{" "}
                    {record.shippingAddress.country}
                  </p>
                  <p>
                    <strong>Phone:</strong> {record.shippingAddress.phone}
                  </p>
                </div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default AdminOrdersPage;

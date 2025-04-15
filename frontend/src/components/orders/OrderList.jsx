import { useState, useEffect } from "react";
import { Table, Tag, Button, Select, Spin, Empty } from "antd";
import { Link } from "react-router-dom";
import * as orderService from "../../services/orderService";

const { Option } = Select;

// Status color mapping
const statusColors = {
  Pending: "orange",
  Shipped: "blue",
  Delivered: "green",
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = {};
        if (statusFilter) {
          params.status = statusFilter;
        }

        const response = await orderService.getOrders(params);

        setOrders(response.data);
      } catch (err) {
        setError("Failed to load orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <Link to={`/orders/${id}`}>{id.slice(-8)}</Link>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Total Items",
      dataIndex: "products",
      key: "products",
      render: (products) =>
        products.reduce((sum, item) => sum + item.quantity, 0),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `₹${price.toFixed(2)}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Link to={`/orders/${record._id}`}>
          <Button
            type="primary"
            size="small"
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
          >
            View Details
          </Button>
        </Link>
      ),
    },
  ];

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Select
          placeholder="Filter by status"
          onChange={handleStatusFilterChange}
          value={statusFilter}
          allowClear
          style={{ width: 200 }}
        >
          <Option value="">All Orders</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Shipped">Shipped</Option>
          <Option value="Delivered">Delivered</Option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
        </div>
      ) : orders.length === 0 ? (
        <Empty description="No orders found" />
      ) : (
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default OrderList;

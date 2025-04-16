import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Popconfirm,
  Typography,
  message,
  Card,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService";
import api from "../../services/api";
import API_ENDPOINTS from "../../config/apiConfig";
const { Title } = Typography;

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Function to load products
  const loadProducts = async (
    page = 1,
    limit = 10,
    searchQuery = "",
    category = ""
  ) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(category && { category }),
      };

      const response = await getProducts(params);
      setProducts(response.data);
      setPagination({
        ...pagination,
        current: page,
        total: response.total,
        pageSize: limit,
      });
    } catch (error) {
      message.error("Failed to load products");
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(
      pagination.current,
      pagination.pageSize,
      search,
      categoryFilter
    );
  }, []);

  // Delete product function
  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      message.success("Product deleted successfully");
      loadProducts(
        pagination.current,
        pagination.pageSize,
        search,
        categoryFilter
      );
    } catch (error) {
      message.error("Failed to delete product");
      console.error("Error deleting product:", error);
    }
  };

  // Search function
  const handleSearch = () => {
    loadProducts(1, pagination.pageSize, search, categoryFilter);
  };

  // Category filter function
  const handleCategoryFilter = () => {
    loadProducts(1, pagination.pageSize, search, categoryFilter);
  };

  // Handle pagination change
  const handleTableChange = (pagination) => {
    loadProducts(
      pagination.current,
      pagination.pageSize,
      search,
      categoryFilter
    );
  };

  // Table columns
  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      key: "image",
      render: (images) => (
        <img
          src={
            images && images.length > 0
              ? `${API_ENDPOINTS.base}/uploads/${images[0]}`
              : ""
          }
          alt="Product"
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => `₹${price.toFixed(2)}`,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/admin/products/edit/${record._id}`}>
            <Button type="primary" icon={<EditOutlined />} size="small">
              Edit
            </Button>
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDeleteProduct(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Manage Products</Title>
        <Link to="/admin/products/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Add New Product
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            className="max-w-md"
          />
          <Input
            placeholder="Filter by category..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            onPressEnter={handleCategoryFilter}
            className="max-w-md"
          />
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        className="shadow-sm"
      />
    </div>
  );
};

export default AdminProductsPage;

import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Pagination,
  Select,
  Input,
  Empty,
  Spin,
  Tag,
  Button,
  Divider,
  Space,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  CloseOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import ProductCard from "./ProductCard";
import * as productService from "../../services/productService";

const { Option } = Select;

// Sorting options
const SORT_OPTIONS = [
  { value: "name", label: "Name: A to Z" },
  { value: "-name", label: "Name: Z to A" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters and pagination - Initialize with sensible defaults
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("-price");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // Fetch products with filters and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit,
          sort,
        };

        if (category) {
          params.category_id = category;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const response = await productService.getProducts(params);
        setProducts(response.data || []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent too many API calls while typing
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, limit, category, sort, searchQuery]);

  const handlePageChange = (newPage, pageSize) => {
    setPage(newPage);
    if (pageSize && pageSize !== limit) {
      setLimit(pageSize);
      setPage(1);
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setCategory("");
    setSort("-price");
    setSearchQuery("");
    setPage(1);
  };

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>{error}</p>
      </div>
    );
  }

  const hasActiveFilters = category || searchQuery || sort !== "-price";

  return (
    <div className="bg-gray-50 min-h-screen py-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600">
              Showing{" "}
              {loading
                ? "..."
                : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)}`}{" "}
              of <span className="font-semibold">{total}</span> products
            </p>
          </div>

          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={handleSearch}
              value={searchQuery}
              className="w-full border-2 border-gray-200 rounded-lg"
              size="large"
              allowClear
            />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <div
          className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 transition-all`}
        >
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FilterOutlined /> Filters
              </h2>
              <Button
                type="text"
                icon={<CloseOutlined />}
                className="md:hidden"
                onClick={() => setShowFilters(false)}
              />
            </div>

            <Divider />

            {/* Sort */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sort By
              </label>
              <Select
                placeholder="Select sorting"
                onChange={handleSortChange}
                value={sort}
                className="w-full"
                size="large"
              >
                {SORT_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                  Active Filters
                </p>
                <Space wrap size={[8, 8]}>
                  {category && (
                    <Tag
                      icon={<CloseOutlined />}
                      closable
                      onClose={() => setCategory("")}
                    >
                      {category}
                    </Tag>
                  )}
                  {sort !== "-price" && (
                    <Tag
                      icon={<CloseOutlined />}
                      closable
                      onClose={() => setSort("-price")}
                    >
                      Sort:{" "}
                      {SORT_OPTIONS.find((opt) => opt.value === sort)?.label}
                    </Tag>
                  )}
                  {searchQuery && (
                    <Tag
                      icon={<CloseOutlined />}
                      closable
                      onClose={() => setSearchQuery("")}
                    >
                      Search: {searchQuery}
                    </Tag>
                  )}
                </Space>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Items per page */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Items per Page
              </label>
              <Select
                value={limit}
                onChange={(value) => {
                  setLimit(value);
                  setPage(1);
                }}
                className="w-full"
                size="large"
              >
                <Option value={8}>8 items</Option>
                <Option value={12}>12 items</Option>
                <Option value={16}>16 items</Option>
                <Option value={24}>24 items</Option>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Filter Toggle Button */}
          <div className="md:hidden mb-4">
            <Button
              type="default"
              icon={<BarsOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              size="large"
              block
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Spin size="large" tip="Loading products..." />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <Empty
                description="No products found"
                style={{ marginTop: "2rem" }}
              />
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <Row gutter={[16, 24]}>
                {products.map((product) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {total > limit && (
                <div className="mt-12 bg-white p-6 rounded-lg shadow-sm text-center">
                  <Pagination
                    current={page}
                    pageSize={limit}
                    total={total}
                    onChange={handlePageChange}
                    showSizeChanger={true}
                    pageSizeOptions={["8", "12", "16", "24"]}
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} of ${total} products`
                    }
                    size="large"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;

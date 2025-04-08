import { useState, useEffect } from "react";
import { Row, Col, Pagination, Select, Input, Empty, Spin, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ProductCard from "./ProductCard";
import * as productService from "../../services/productService";

const { Option } = Select;

// Available categories from our seed data
const CATEGORIES = ["Electronics", "Books", "Fashion"];

// Sorting options
const SORT_OPTIONS = [
  { value: "name", label: "Name: A to Z" },
  { value: "-name", label: "Name: Z to A" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-stock", label: "Stock: High to Low" },
  { value: "stock", label: "Stock: Low to High" },
];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters and pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("-price");
  const [searchQuery, setSearchQuery] = useState("");

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
          params.category = category;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const response = await productService.getProducts(params);
        setProducts(response.data);
        setTotal(response.total || 0); // Use the total from backend
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
    if (pageSize !== limit) {
      setLimit(pageSize);
      setPage(1); // Reset to first page when changing page size
    }
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1); // Reset to first page when sorting changes
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const clearFilters = () => {
    setCategory("");
    setSort("-price");
    setSearchQuery("");
    setPage(1);
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const hasActiveFilters = category || searchQuery || sort !== "-price";

  return (
    <div>
      <div className="mb-6 space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search products"
              prefix={<SearchOutlined />}
              onChange={handleSearch}
              value={searchQuery}
              className="w-full"
              allowClear
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Select
              placeholder="Category"
              onChange={handleCategoryChange}
              value={category}
              allowClear
              className="w-40"
            >
              <Option value="">All Categories</Option>
              {CATEGORIES.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Sort by"
              onChange={handleSortChange}
              value={sort}
              className="w-48"
            >
              {SORT_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Active Filters:</span>
            {category && (
              <Tag closable onClose={() => setCategory("")}>
                Category: {category}
              </Tag>
            )}
            {sort !== "-price" && (
              <Tag closable onClose={() => setSort("-price")}>
                {SORT_OPTIONS.find((opt) => opt.value === sort)?.label}
              </Tag>
            )}
            {searchQuery && (
              <Tag closable onClose={() => setSearchQuery("")}>
                Search: {searchQuery}
              </Tag>
            )}
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
        </div>
      ) : products.length === 0 ? (
        <Empty description="No products found" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {products.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          <div className="mt-8 text-center">
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              onChange={handlePageChange}
              showSizeChanger={true}
              pageSizeOptions={[8, 12, 16, 24]}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;

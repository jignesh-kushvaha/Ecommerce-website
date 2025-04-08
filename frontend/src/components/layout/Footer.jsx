import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const { isAuthenticated } = useAuth();
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ProductStore</h3>
            <p className="text-gray-300 mb-4">
              Your one-stop shop for quality products at affordable prices.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/cart" className="text-gray-300 hover:text-white">
                    Cart
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@productstore.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: 123 Product St, Mumbai, Maharashtra 400001</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} ProductStore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

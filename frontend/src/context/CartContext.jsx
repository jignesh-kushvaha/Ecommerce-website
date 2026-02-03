import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Initialize cart on mount
  useEffect(() => {
    const initializeCart = async () => {
      if (isAuthenticated) {
        // User is logged in - cart will be fetched from backend
        // We'll initialize it here when needed
        setIsLoadingCart(false);
      } else {
        // Guest user - load from localStorage
        const savedCart = localStorage.getItem("guestCart");
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            setCart(Array.isArray(parsedCart) ? parsedCart : []);
          } catch (error) {
            console.error("Failed to parse guest cart data:", error);
            setCart([]);
          }
        } else {
          setCart([]);
        }
      }
    };

    initializeCart();
  }, [isAuthenticated]);

  // Save guest cart to localStorage whenever it changes (only for guests)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("guestCart", JSON.stringify(cart));

      // Calculate total price
      const newTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      setTotal(newTotal);
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated) {
        // For logged-in users, we would call the backend API
        // This will be implemented when needed
        console.log("Adding to backend cart - implement API call");
      } else {
        // Guest user - add to local cart
        setCart((prevCart) => {
          const existingItemIndex = prevCart.findIndex(
            (item) => item.variant_id === product.variant_id,
          );

          if (existingItemIndex >= 0) {
            // Product exists in cart, update quantity
            const updatedCart = [...prevCart];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: updatedCart[existingItemIndex].quantity + quantity,
            };
            return updatedCart;
          } else {
            // Product doesn't exist in cart, add it
            return [
              ...prevCart,
              {
                variant_id: product.variant_id,
                id: product.id,
                name: product.name,
                price: product.base_price || product.price,
                image: product.image,
                quantity,
              },
            ];
          }
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = (variantId) => {
    if (isAuthenticated) {
      console.log("Removing from backend cart - implement API call");
    } else {
      setCart((prevCart) =>
        prevCart.filter((item) => item.variant_id !== variantId),
      );
    }
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    if (isAuthenticated) {
      console.log("Updating backend cart - implement API call");
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.variant_id === variantId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      console.log("Clearing backend cart - implement API call");
    } else {
      setCart([]);
      localStorage.removeItem("guestCart");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount: cart.reduce((count, item) => count + item.quantity, 0),
        isLoadingCart,
        isAuthenticated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

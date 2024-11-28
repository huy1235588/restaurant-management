'use client'

import ThemeToggleButton from "@/components/themeToggleButton";
import "@/style/app.css";
import { useSearchParams } from 'next/navigation';
import { useState } from "react";

interface MenuFood {
    id: string;
    itemName: string;
    category: string;
    price: number;
}

interface Cart {
    id: string;
    itemName: string;
    quantity: number;
    price: number;
    total: number;
}

const menuFoodData: MenuFood[] = [
    {
        id: "c1",
        itemName: "Pizza Margherita",
        category: "Food",
        price: 8.5,
    },
    {
        id: "c2",
        itemName: "Spaghetti Carbonara",
        category: "Food",
        price: 12.0,
    },
    {
        id: "c3",
        itemName: "Coca Cola",
        category: "Drink",
        price: 2.5,
    },
    {
        id: "c4",
        itemName: "Tiramisu",
        category: "Dessert",
        price: 6.0,
    },
    {
        id: "c5",
        itemName: "Tiramisu",
        category: "Dessert",
        price: 6.0,
    },
    {
        id: "c6",
        itemName: "Tiramisu",
        category: "Dessert",
        price: 6.0,
    },
    {
        id: "c7",
        itemName: "Tiramisu",
        category: "Dessert",
        price: 6.0,
    },
    {
        id: "c8",
        itemName: "Tiramisu",
        category: "Dessert",
        price: 6.0,
    },
    {
        id: "c9",
        itemName: "Tiramisu",
        category: "Dessert",
        price: 6.0,
    },
    {
        id: "c10",
        itemName: "Tiramisu",
        category: "Dessert",
        price: 6.0,
    },
];

const Order = () => {
    const searchParams = useSearchParams();
    const tableId = searchParams.get("tableId");
    const billId = searchParams.get("billId");

    // State quản lý số lượng cho từng mục
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [cart, setCart] = useState<Cart[]>([]);

    // Tính tổng tiền của giỏ hàng
    const totalAmount = cart.reduce((total, item) => total + item.total, 0);

    // Xử lý thay đổi số lượng
    const handleQuantityChange = (id: string, value: number) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: value > 0 ? value : 1,
        }));
    };

    // Xử lý thêm vào giỏ hàng
    const handleAddToCart = (item: MenuFood) => {
        const quantity = quantities[item.id] || 1; // Số lượng mặc định là 1 nếu chưa chọn số lượng

        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);

            if (existingItemIndex !== -1) {
                // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng và tổng giá trị
                const updatedCart = [...prevCart];
                const existingItem = updatedCart[existingItemIndex];
                updatedCart[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + quantity,
                    total: (existingItem.quantity + quantity) * item.price,
                };
                return updatedCart;
            } else {
                // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm sản phẩm mới
                return [...prevCart, { ...item, quantity, total: item.price * quantity }];
            }
        });
    };


    // Xử lý xóa vào giỏ hàng
    const handleRemoveFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    return (
        <main className='main main-order'>

            {/* Menu Food */}
            <section className='section mf-section'>
                <h2 className='section-title'>
                    Food & Drinks
                </h2>

                {/* Search food */}
                <form className="form mf-form" action="">
                    <input className="mf-input-form" type="text" placeholder="Search Food & Drinks" />
                    <button className="submit-btn mf-submit-btn" type="button" >Search</button>
                </form>

                {/* List Food */}
                <div className="table-container">
                    <table className="mf-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuFoodData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.itemName}</td>
                                    <td>{item.category}</td>
                                    <td>{item.price.toFixed(2)}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantities[item.id] || 1}
                                            max={1000}
                                            onChange={(e) =>
                                                handleQuantityChange(item.id, parseInt(e.target.value, 10))
                                            }
                                            className="quantity-input"
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            Add to Cart
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Cart */}
            <section className='section cart-section'>
                <h2 className="section-title">
                    Cart
                </h2>
                <p>Table ID: {tableId}</p>
                <p>Bill ID: {billId}</p>

                {/* Content */}
                <div className="table-container">
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Item Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.id}</td>
                                    <td>{item.itemName}</td>
                                    <td>{item.price.toFixed(2)}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.total.toFixed(2)}</td>
                                    <td>
                                        <button
                                            className="delete-card-btn"
                                            onClick={() => handleRemoveFromCart(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="cart-total">
                    <p><strong>Total: ${totalAmount.toFixed(2)}</strong></p>
                </div>

                {/* Button Pay Bill */}
                <button className="pay-bill-btn" onClick={() => alert('Bill paid')}>
                    Pay Bill
                </button>
            </section>

            {/* Toggle theme */}
            <ThemeToggleButton />
        </main>
    );
};

export default Order;

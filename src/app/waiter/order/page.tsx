'use client'

import CartTable from "@/components/order/cartTable";
import MenuFoodTable from "@/components/order/menuFoodTable";
import "@/style/app.css";
import { Cart, CartOrder, MenuFood, OrderStatus } from "@/types/types";
import stompClient from "@/utils/socket";
import axios from "@/config/axios";
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from "react";

const Order = () => {
    const searchParams = useSearchParams();
    const tableId = useMemo(() => searchParams.get("tableId"), [searchParams]);
    const billId = useMemo(() => searchParams.get("billId"), [searchParams]);
    const [menuFoodData, setMenuFoodData] = useState<MenuFood[]>([]);

    const [isSending, setIsSending] = useState(false);

    // State quản lý số lượng cho từng mục
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [cart, setCart] = useState<Cart[]>([]);

    // Tính tổng tiền của giỏ hàng
    const totalAmount = useMemo(
        () => cart.reduce((total, item) => total + item.total, 0),
        [cart]
    );

    // Xử lý thay đổi số lượng
    const handleQuantityChange = (id: string, value: number) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: value > 0 ? value : 1,
        }));
    };

    // Xử lý thêm vào giỏ hàng
    const handleAddToCart = (item: MenuFood) => {
        const quantity = quantities[item.itemId] || 1; // Số lượng mặc định là 1 nếu chưa chọn số lượng

        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.itemId === item.itemId);

            // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng và tổng giá trị
            if (existingItemIndex !== -1) {
                return prevCart.map((cartItem) =>
                    cartItem.itemId === item.itemId
                        ? {
                            ...cartItem,
                            quantity: cartItem.quantity + quantity,
                            total: (cartItem.quantity + quantity) * item.price,
                        }
                        : cartItem
                );
            }

            return [
                ...prevCart,
                { ...item, itemId: item.itemId, quantity, status: 'pending', total: item.price * quantity },
            ];
        });
    };

    // Xử lý xóa vào giỏ hàng
    const handleRemoveFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.itemId !== id));
    };

    // WebSocket xử lý kết nối và nhận trạng thái từ bếp
    useEffect(() => {
        stompClient.onConnect = () => {
            // Lắng nghe trạng thái từ bếp
            stompClient.subscribe('/topic/waiter', (message) => {
                const statusUpdate: OrderStatus = JSON.parse(message.body);

                // Cập nhật trạng thái trong giỏ hàng
                setCart((prevCart) => {
                    const updatedCart = [...prevCart];  // Sao chép mảng gốc để tránh mutation trực tiếp

                    updatedCart.forEach(item => {
                        if (item.itemId === "8") {
                            console.log(item.itemId + " " + statusUpdate.itemId)
                        }
                    })

                    const index = updatedCart.findIndex(item => item.itemId === statusUpdate.itemId); // Tìm index của item cần cập nhật

                    if (index !== -1) {
                        updatedCart[index] = { ...updatedCart[index], status: statusUpdate.status }; // Chỉ cập nhật trạng thái của item đó
                    }

                    return updatedCart;
                });

                console.log(cart)
            });
        };

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);

    // Hàm gửi order đến bếp
    const handleSendToKitchen = async () => {
        // Kiểm tra cart có rỗng
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        setIsSending(true);
        try {
            // Simulate response (fake data as an example)
            const data: CartOrder[] = cart.map((item) => ({
                itemId: item.itemId,
                itemName: item.itemName,
                quantity: item.quantity,
                orderAt: new Date(),
                tableId: tableId,
            }));

            // Gửi cho bếp
            stompClient.publish({
                destination: "/app/order",
                body: JSON.stringify(data),
            });

            const response = await axios.post('/api/cart', cart.map((item) => ({
                tableId: tableId,
                itemId: item.itemId,
                quantity: item.quantity,
                status: item.status,
            })));

            alert(response.data);

        } catch (error) {
            console.error("Failed to send to kitchen:", error);
        } finally {
            setIsSending(false);
        }
    };

    // Lấy cart từ database
    useEffect(() => {
        if (!tableId) return;

        const fetchCartData = async () => {
            try {
                const response = await axios.get<Cart[]>(`/api/cart/${tableId}`);
                setCart(response.data.map((item) => ({
                    ...item,
                    total: item.quantity * item.price, // Tính total từng item
                })));
            } catch (error) {
                console.error('Failed to fetch cart data:', error);
            }
        };

        fetchCartData();
    }, [tableId])

    // Lấy menu từ DB
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<MenuFood[]>('/api/menufood/all');
                setMenuFoodData(response.data);

            } catch (error) {
                console.error('Failed to fetch menu food data:', error);
            }
        };

        fetchData();
    }, []);

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
                    <MenuFoodTable
                        menuFoodData={menuFoodData}
                        onAddToCart={handleAddToCart}
                        onQuantityChange={handleQuantityChange}
                        quantities={quantities}
                    />
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
                    <CartTable
                        cartData={cart}
                        handleRemoveFromCart={handleRemoveFromCart}
                    />
                </div>

                {/* Summary */}
                <div className="cart-total">
                    <p><strong>Total: ${totalAmount.toFixed(2)}</strong></p>
                </div>

                {/* Gửi yêu cầu đến bếp */}
                <button
                    className="send-to-kitchen-btn"
                    onClick={handleSendToKitchen}
                    disabled={isSending}
                >
                    {isSending ? 'Sending...' : 'Send to Kitchen'}
                </button>

                {/* Button Pay Bill */}
                <button className="pay-bill-btn" onClick={() => alert('Bill paid')}>
                    Pay Bill
                </button>
            </section>
        </main>
    );
};

export default Order;

'use client'

import CartTable from "@/components/order/cartTable";
import MenuFoodTable from "@/components/order/menuFoodTable";
import "@/style/app.css";
import { BillItem, Bills, CartOrder, KitchenOrder, MenuFood, OrderStatus } from "@/types/types";
import stompClient from "@/utils/socket";
import axios from "@/config/axios";
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from "react";
import { useNotification } from "@/components/notificationProvider";

const Order = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showNotification } = useNotification();

    // Chuyển thành số nguyên
    const tableId = useMemo(() => {
        const id = searchParams.get("tableId");
        return id ? parseInt(id) : null;
    }, [searchParams]);

    // Lấy bill từ database
    const billId = useMemo(() => searchParams.get("billId"), [searchParams]);
    const [bill, setBill] = useState<Bills | null>(null);
    useEffect(() => {
        if (!billId) return;

        const fetchBillData = async () => {
            try {
                const response = await axios.get<Bills>(`/api/bill/${billId}`);
                setBill(response.data);
            } catch (error) {
                console.error('Failed to fetch bill data:', error);
            }
        };

        fetchBillData();
    }, []);

    // State quản lý giỏ hàng
    const [menuFoodData, setMenuFoodData] = useState<MenuFood[]>([]);

    // State quản lý giỏ hàng
    const [isSending, setIsSending] = useState(false);

    // State quản lý số lượng cho từng mục
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);

    // Hàm tìm kiếm món ăn
    const handleSearchFood = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Chuyển giá trị search về chữ thường
        const searchValue = e.target.value.toLowerCase();
        const mfTableRows = document.querySelectorAll('.mf-table-row');

        // Lặp qua từng hàng trong bảng
        mfTableRows.forEach((row) => {
            const itemName = row.getAttribute('data-item-name')?.toLowerCase() || '';
            const isMatch = itemName.includes(searchValue);

            // Nếu tên món ăn chứa giá trị search, hiển thị hàng đó
            row.classList.toggle('hidden', !isMatch);
        });

        
    }

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

        setKitchenOrders((prevKitchenOrders) => {
            const existingItemIndex = prevKitchenOrders.findIndex((billItem) => billItem.itemId === item.itemId);

            // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng và tổng giá trị
            // if (existingItemIndex !== -1) {
            //     return prevBillItems.map((billItem) =>
            //         billItem.itemId === item.itemId
            //             ? {
            //                 ...billItem,
            //                 bill: bill,
            //                 menu: item,
            //                 quantity: billItem.quantity + quantity,
            //             }
            //             : billItem
            //     );
            // }

            return [
                ...prevKitchenOrders,
                {
                    billID: bill?.id,
                    itemId: item.itemId,
                    itemName: item.itemName,
                    itemPrice: item.price,
                    quantity: quantity,
                    status: 'pending',
                },
            ];
        });
    };

    // Xử lý xóa vào giỏ hàng
    const handleRemoveFromCart = (id: string) => {
        setKitchenOrders((prevKitchenOrders) => prevKitchenOrders.filter((kitchenOrder) => kitchenOrder.itemId !== id));
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
        if (kitchenOrders.length === 0) {
            showNotification("Your cart is empty!", "warning");
            return;
        }

        setIsSending(true);
        try {
            // Lấy danh sách item hiện có trong DB
            const responseCart = await axios.get<BillItem[]>(`/api/cart/${tableId}`);
            const existingCartItems = new Map(
                (responseCart.data || []).map((dbItem) => [dbItem.id, dbItem])
            );

            // Lọc các item cần gửi với phần chênh lệch số lượng
            const newItems = kitchenOrders.map((kitchenOrder) => {
                const existingItem = existingCartItems.get(kitchenOrder.id);

                // Tính số lượng thêm
                const extraQuantity =
                    kitchenOrder.quantity - (existingItem?.quantity || 0);

                // Nếu có số lượng thêm, tạo dữ liệu mới
                if (extraQuantity > 0) {
                    return {
                        ...kitchenOrder,
                        itemQuantity: extraQuantity, // Chỉ gửi số lượng thêm
                    };
                }

                return null;

            }).filter((item) => item !== null) as BillItem[];

            // Nếu không có item nào được thêm 
            if (newItems.length === 0) {
                showNotification("All items are already in the kitchen's queue.", "info");
                return;
            }

            // Chuyển đổi dữ liệu để gửi tới WebSocket và API
            const data: CartOrder[] = newItems.map((item) => ({
                itemId: item.menu.itemId,
                itemName: item.menu.itemName,
                itemQuantity: item.quantity,
                orderAt: new Date(),
                tableId: tableId,
            }));

            // Gửi cho bếp
            stompClient.publish({
                destination: "/app/order",
                body: JSON.stringify(data),
            });

            // Thêm vào DB
            const response = await axios.post('/api/cart', newItems.map((item) => ({
                tableId: tableId,
                itemId: item.menu.itemId,
                itemQuantity: item.quantity,
                // status: item.,
            })));

            showNotification(response.data, "success");

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
                const response = await axios.get<KitchenOrder[]>(`/api/kitchenOrder/all/${tableId}`);
                setKitchenOrders((response.data || []).map((item) => ({
                    ...item,
                    total: item.quantity * item.itemPrice, // Tính total từng item
                })));
            } catch (error) {
                console.error('Failed to fetch cart data:', error);
            }
        };

        fetchCartData();
    }, [])

    // Lấy menu từ DB
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<MenuFood[]>('/api/menu/all');
                setMenuFoodData(response.data);

            } catch (error) {
                console.error('Failed to fetch menu food data:', error);
            }
        };

        fetchData();
    }, []);

    // Hàm in hóa đơn
    const handleInvoice = () => {
        router.push(`/admin/payment/${billId}`);
    }

    return (
        <main className='main main-order'>
            {/* Menu Food */}
            <section className='section mf-section'>
                <h2 className='section-title'>
                    Food & Drinks
                </h2>

                {/* Search food */}
                <form className="form mf-form" action="">
                    <input
                        className="mf-input-form"
                        type="text"
                        placeholder="Search Food & Drinks"
                        onChange={handleSearchFood}
                    />
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
                <p>Bill ID: {bill?.id}</p>

                {/* Content */}
                <div className="table-container">
                    <CartTable
                        KitchenOrders={kitchenOrders}
                        handleRemoveFromCart={handleRemoveFromCart}
                    />
                </div>

                {/* Summary */}
                <div className="cart-total">
                    <p><strong>Total: ${bill?.totalAmount}</strong></p>
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
                <button className="pay-bill-btn" onClick={handleInvoice}>
                    Pay Bill
                </button>
            </section>
        </main>
    );
};

export default function OrderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Order />
        </Suspense>
    );
}
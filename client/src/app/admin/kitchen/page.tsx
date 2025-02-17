'use client'

import "@/style/app.css";
import { useEffect, useState } from "react";
import stompClient from "@/utils/socket";
import { KitchenOrder } from "@/types/types";
import axios from "@/config/axios";


export default function Kitchen() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);

    useEffect(() => {
        // Đảm bảo websocket được khởi tạo đúng cách
        if (!stompClient) {
            console.error('stompClient is not initialized');
            return;
        }

        // WebSocket xử lý kết nối và nhận order từ phục vụ
        stompClient.onConnect = () => {
            stompClient.subscribe("/topic/kitchen", (message) => {
                try {
                    const parsedData: KitchenOrder = JSON.parse(message.body);

                    // Kiểm tra nếu `message.body` là mảng hoặc object
                    if (Array.isArray(parsedData)) {
                        // Chuyển đổi `timeSubmitted` sang `Date`
                        const newOrders = parsedData.map((order: KitchenOrder) => ({
                            ...order,
                            orderAt: new Date(order.orderTime),
                        }));

                        setOrders((prev) => [...prev, ...newOrders]);
                    } else {
                        const order = {
                            ...parsedData,
                            orderAt: new Date(parsedData.orderTime),
                        };
                        setOrders((prev) => [...prev, order]);
                    }

                } catch (error) {
                    console.error("Error parsing message body:", error);
                }
            });
        }

        // Lấy dữ liệu cart từ DB
        const fetchData = async () => {
            const response = await axios.get<KitchenOrder[]>("/api/kitchenOrder/all?status=pending");

            setOrders(response.data);
        }

        fetchData();

    }, []);

    // Gửi cho order thành công
    const updateStatus = (order: KitchenOrder) => {
        const status = {
            tableId: order.tableId,
            itemId: order.itemId,
            status: 'completed'
        };

        // Gửi thông báo cho phục vụ
        stompClient.publish({
            destination: "/app/status",
            body: JSON.stringify(status),
        });

        // Cập nhật trạng thái order
        const updateStatus = async () => {
            await axios.put(`/api/kitchenOrder/updateStatus?orderId=${order.id}&status=completed`, {
                billID: order.billID,
                itemId: order.itemId,
                quantity: order.quantity,
            });

            // Lấy dữ liệu 
            const response = await axios.get<KitchenOrder[]>("/api/kitchenOrder/all?status=pending");

            setOrders(response.data);
        };

        // Update DB
        updateStatus();
    };

    // Gửi cho order thất bại
    const updateStatusError = (order: KitchenOrder) => {
        const status = {
            tableId: order.tableId,
            itemId: order.itemId,
            status: 'error'
        };

        // Gửi thông báo cho phục vụ
        stompClient.publish({
            destination: "/app/status",
            body: JSON.stringify(status),
        });

        // Cập nhật trạng thái order
        const updateStatus = async () => {
            await axios.put(`/api/kitchenOrder/updateStatus?orderId=${order.id}&status=error`, {
                billID: order.billID,
                itemId: order.itemId,
                quantity: order.quantity,              
            });

            // Lấy dữ liệu 
            const response = await axios.get<KitchenOrder[]>("/api/kitchenOrder/all?status=pending");
            setOrders(response.data);
        };

        // Update DB
        updateStatus();
    };

    return (
        <main className="main main-kitchen">
            <h1>Bếp</h1>
            <h2>Đơn hàng:</h2>
            <table className="cart-table kitchen-table">
                <thead>
                    <tr>
                        <th>Table ID</th>
                        <th>Item ID</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Order At</th>
                        <th colSpan={2}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders && orders.length > 0 ? (
                        orders.map((order, idx) => (
                            <tr key={idx}>
                                <td>{order.tableId}</td>
                                <td>{order.itemId}</td>
                                <td>{order.itemName}</td>
                                <td>{order.quantity}</td>
                                <td>{order.orderTime.toLocaleString()}</td>
                                <td>
                                    <button className="add-to-cart-btn done-btn" onClick={() => updateStatus(order)}>
                                        Done
                                    </button>
                                </td>
                                <td>
                                    <button className="delete-cart-btn error-btn" onClick={() => updateStatusError(order)}>
                                        Error
                                    </button>
                                </td>
                            </tr>
                        ))) : (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center" }}>
                                No orders found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </main>
    );
}

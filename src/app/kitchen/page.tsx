'use client'

import "@/style/app.css";
import { useEffect, useState } from "react";
import stompClient from "../../utils/socket";
import { CartOrder } from "@/types/types";
import axios from "@/config/axios";


export default function Kitchen() {
    const [orders, setOrders] = useState<CartOrder[]>([]);

    useEffect(() => {
        // Đảm bảo websocket được khởi tạo đúng cách
        if (!stompClient) {
            console.error('stompClient is not initialized');
            return;
        }

        stompClient.onConnect = () => {
            stompClient.subscribe("/topic/kitchen", (message) => {
                try {
                    const parsedData: CartOrder = JSON.parse(message.body);

                    // Kiểm tra nếu `message.body` là mảng hoặc object
                    if (Array.isArray(parsedData)) {
                        // Chuyển đổi `timeSubmitted` sang `Date`
                        const newOrders = parsedData.map((order: CartOrder) => ({
                            ...order,
                            orderAt: new Date(order.orderAt),
                        }));

                        console.log(newOrders)

                        setOrders((prev) => [...prev, ...newOrders]);
                    } else {
                        const order = {
                            ...parsedData,
                            orderAt: new Date(parsedData.orderAt),
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
            const response = await axios.get<CartOrder[]>("/api/cart/all");

            setOrders(response.data);
        }

        fetchData();

    }, []);

    // Gửi cho order thành công
    const updateStatus = (order: CartOrder) => {
        const status = { tableId: order.tableId, itemId: order.itemId, status: 'completed' };

        stompClient.publish({
            destination: "/app/status",
            body: JSON.stringify(status),
        });

        const updateStatus = async () => {
             await axios.put(`/api/cart/status/${order.tableId}`, {
                itemId: order.itemId,
                status: "completed"
             });
        };

        // Update DB
        updateStatus();
    };

    // Gửi cho order thất bại
    const updateStatusError = (order: CartOrder) => {
        const status = { tableId: order.tableId, itemId: order.itemId, status: 'error' };

        stompClient.publish({
            destination: "/app/status",
            body: JSON.stringify(status),
        });

        const updateStatus = async () => {
            await axios.put(`/api/cart/status/${order.tableId}`, {
                itemId: order.itemId,
                status: "error"
            });
        };

        // Update DB
        updateStatus();
    };

    return (
        <main className="main">
            <h1>Bếp</h1>
            <h2>Đơn hàng:</h2>
            <table>
                <thead>
                    <tr>
                        <th>Table ID</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Order At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, idx) => (
                        <tr key={idx}>
                            <td>{order.tableId}</td>
                            <td>{order.itemName}</td>
                            <td>{order.quantity}</td>
                            <td>{order.orderAt.toLocaleString()}</td>
                            <td>
                                <button onClick={() => updateStatus(order)}>
                                    Done
                                </button>
                                <button onClick={() => updateStatusError(order)}>
                                    Error
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}

'use client'

import { useEffect, useState } from "react";
import stompClient from "../../utils/socket";
import { CartOrder } from "@/types/types";
import axios from "@/config/axios";

export default function Kitchen() {
    const [orders, setOrders] = useState<CartOrder[]>([]);

    useEffect(() => {
        stompClient.onConnect = () => {
            stompClient.subscribe("/topic/kitchen", (message) => {
                try {
                    const parsedData = JSON.parse(message.body);

                    // Kiểm tra nếu `message.body` là mảng hoặc object
                    if (Array.isArray(parsedData)) {
                        // Chuyển đổi `timeSubmitted` sang `Date`
                        const newOrders = parsedData.map((order) => ({
                            ...order,
                            timeSubmitted: new Date(order.timeSubmitted),
                        }));

                        setOrders((prev) => [...prev, ...newOrders]);
                    } else {
                        const order = {
                            ...parsedData,
                            timeSubmitted: new Date(parsedData.timeSubmitted),
                        };
                        setOrders((prev) => [...prev, order]);
                    }

                } catch (error) {
                    console.error("Error parsing message body:", error);
                }
            });
        }

        const fetchData = async () => {
            const response = await axios.get<CartOrder[]>("/api/cart/all");

            setOrders(response.data);
        }

        fetchData();

    }, []);

    const updateStatus = (order: CartOrder) => {
        const status = { tableId: order.tableId, itemId: order.itemId, status: 'completed' };

        stompClient.publish({
            destination: "/app/status",
            body: JSON.stringify(status),
        });
    };

    const updateStatusError = (order: CartOrder) => {
        const status = { tableId: order.tableId, itemId: order.itemId, status: 'error' };

        stompClient.publish({
            destination: "/app/status",
            body: JSON.stringify(status),
        });
    };

    return (
        <div>
            <h1>Bếp</h1>
            <h2>Đơn hàng:</h2>
            <table>
                <thead>
                    <tr>
                        <th>Item ID</th>
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
                            <td>{order.itemId}</td>
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
        </div>
    );
}

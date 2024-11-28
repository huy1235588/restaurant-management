'use client'

import { useEffect, useState } from "react";
import stompClient from "../../utils/socket";

interface Order {
    table: string;
    items: string[];
}

export default function Kitchen() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        stompClient.onConnect = () => {
            stompClient.subscribe("/topic/kitchen", (message) => {
                const order: Order = JSON.parse(message.body);
                setOrders((prev) => [...prev, order]);
            });
        }
    }, []);

    const updateStatus = (order: Order) => {
        const status = { table: order.table, status: 'Completed' };

        console.log(status);
        stompClient.publish({
            destination: "/app/status",
            body: JSON.stringify(status),
        });
    };

    return (
        <div>
            <h1>Bếp</h1>
            <h2>Đơn hàng:</h2>
            <ul>
                {orders.map((order, idx) => (
                    <li key={idx}>
                        {JSON.stringify(order)}
                        <button onClick={() => updateStatus(order)}>
                            Hoàn thành
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

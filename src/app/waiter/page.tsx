'use client'

import { useEffect, useState } from "react";
import stompClient from "../../utils/socket";

import "@/style/app.css";

interface Order {
    table: string;
    items: string[];
}

interface OrderStatus {
    table: string;
    status: string;
}

export default function Waiter() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [statuses, setStatuses] = useState<OrderStatus[]>([]);

    useEffect(() => {
        stompClient.onConnect = () => {
            // Lắng nghe trạng thái từ bếp
            stompClient.subscribe('/topic/waiter', (message) => {
                const status: OrderStatus = JSON.parse(message.body);
                setStatuses((prev) => [...prev, status]);
            });
        };

        stompClient.activate();
    }, []);

    const sendOrder = () => {
        const newOrder: Order = { table: '5', items: ['Pizza', 'Coke'] };
        stompClient.publish({
            destination: "/app/order",
            body: JSON.stringify(newOrder),
        });
        setOrders((prev) => [...prev, newOrder]);
    };

    return (
        <section className="section">
            <h1 className="section-title">Phục vụ</h1>

            <form className="form" action="">
                <label htmlFor="inputTable">Table</label>
                <input id="inputTable" type="text" />

                <label htmlFor="inputItems">Items</label>
                <input id="inputItems" type="text" />

                <div className="submit-form">
                    <button className="submit-btn" onClick={sendOrder}>Gửi đơn hàng</button>
                </div>
            </form>

            <h2>Trạng thái món ăn:</h2>
            <ul>
                {statuses.map((status, idx) => (
                    <li key={idx}>{JSON.stringify(status)}</li>
                ))}
            </ul>
        </section>
    );
}

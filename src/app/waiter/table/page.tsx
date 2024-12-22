'use client';

import "@/style/app.css";
import axios from "@/config/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import stompClient from "@/utils/socket";
import { OrderStatus } from "@/types/types";
import TableModal from "@/components/tableModal";

interface TsItem {
    tableId: number;
    billId: number;
    capacity: number;
    status: "available" | "reserved" | "occupied"
}

const TableStatus = () => {
    const [tsItemData, setTsItemData] = useState<TsItem[]>([]);
    const [highlightedTables, setHighlightedTables] = useState<number[]>([]);

    const [selectedTable, setSelectedTable] = useState<TsItem | undefined>(undefined);

    const router = useRouter(); // Khởi tạo router

    //  Nhóm các bảng theo status
    const groupedData = tsItemData.reduce((acc, item) => {
        acc[item.status].push(item);
        return acc;
    }, {
        available: [] as TsItem[],
        reserved: [] as TsItem[],
        occupied: [] as TsItem[]
    });

    const handleItemClick = (tableId: number, billId: number) => {
        router.push(`/waiter/order?tableId=${tableId}&billId=${billId}`);
    }

    // Lấy table từ DB
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<TsItem[]>('/api/tablestatus/all');
                setTsItemData(response.data || []);

            } catch (error) {
                console.error('Failed to fetch menu food data:', error);
            }
        };

        fetchData();
    }, []);

    // WebSocket xử lý kết nối và nhận trạng thái từ bếp
    useEffect(() => {
        stompClient.onConnect = () => {
            // Lắng nghe trạng thái từ bếp
            stompClient.subscribe('/topic/waiter', (message) => {
                const statusUpdate: OrderStatus = JSON.parse(message.body);

                // Highlight bảng được cập nhật
                setHighlightedTables((prev) => {
                    if (!prev.includes(statusUpdate.tableId)) {
                        return [...prev, statusUpdate.tableId];
                    }
                    return prev;
                });
            });
        };

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);

    // Xử lý click vào bàn còn trống
    const handleAvailableClick = async (tableId: number) => {
        const table = tsItemData.find(item => item.tableId === tableId);

        setSelectedTable(table);
    };

    // Xử lý submit điền thông tin bàn của khách hàng
    const handleModalSubmit = (data: {
        customerName: string;
        phoneNumber: string;
        status: "occupied" | "reserved";
        reservedTime?: string;
        billId: number;
    }) => {
        setTsItemData(prev =>
            prev.map(item =>
                item.tableId === selectedTable?.tableId
                    ? { ...item, status: data.status, billId: data.billId }
                    : item
            )
        );
        setSelectedTable(undefined);
    };

    return (
        <main className="main main-ts">
            <h1 className="main-title">
                TABLE STATUS
            </h1>

            <section className="ts-section">
                {/* Available tables */}
                <ul className="ts-list">
                    <h2 className="ts-available-title">Available</h2>
                    {groupedData.available.map((item) => (
                        <li key={item.tableId}
                            className={`ts-item ${highlightedTables.includes(item.tableId) ? "ts-notify" : ""
                                }`}
                            onClick={() => handleAvailableClick(item.tableId)}
                        >
                            <p id="tableId">
                                Table {item.tableId}
                            </p>
                            <p id="capacity">
                                Capacity: {item.capacity}
                            </p>
                            <p id="billId">
                                Bill ID: {item.billId}
                            </p>
                        </li>
                    ))}
                </ul>

                {/* Has Customer tables */}
                <ul className="ts-list">
                    <h2 className="ts-has-customer-title">Has customer</h2>
                    {groupedData.occupied.map((item) => (
                        <li key={item.tableId}
                            className={`ts-item ${highlightedTables.includes(item.tableId) ? "ts-notify" : ""
                                }`}
                            onClick={() => handleItemClick(item.tableId, item.billId)}
                        >
                            <p id="tableId">
                                Table {item.tableId}
                            </p>
                            <p id="capacity">
                                Capacity: {item.capacity}
                            </p>
                            <p id="billId">
                                Bill ID: {item.billId}
                            </p>
                        </li>
                    ))}
                </ul>

                {/* Reserved tables */}
                <ul className="ts-list">
                    <h2 className="ts-reserved-title">Reserved</h2>
                    {groupedData.reserved.map((item) => (
                        <li key={item.tableId}
                            className={`ts-item ${highlightedTables.includes(item.tableId) ? "ts-notify" : ""
                                }`}
                            onClick={() => handleItemClick(item.tableId, item.billId)}
                        >
                            <p id="tableId">
                                Table {item.tableId}
                            </p>
                            <p id="capacity">
                                Capacity: {item.capacity}
                            </p>
                            <p id="billId">
                                Bill ID: {item.billId}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>
            {/* Hiển thị Modal */}
            {selectedTable && (
                <TableModal
                    tableId={selectedTable.tableId}
                    initialBillId={selectedTable.billId || Date.now()}
                    onSubmit={handleModalSubmit}
                    onClose={() => setSelectedTable(undefined)}
                />
            )}
        </main>
    );
}

export default TableStatus;
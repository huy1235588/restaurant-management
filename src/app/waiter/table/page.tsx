'use client';

import "@/style/app.css";
import axios from "@/config/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TsItem {
    tableId: number;
    billId: number;
    capacity: number;
    status: "available" | "reserved" | "hasCustomer"
}

const TableStatus = () => {
    const [tsItemData, setTsItemData] = useState<TsItem[]>([])
    const router = useRouter(); // Khởi tạo router

    //  Nhóm các bảng theo status
    const groupedData = tsItemData.reduce((acc, item) => {
        acc[item.status].push(item);
        return acc;
    }, {
        available: [] as TsItem[],
        reserved: [] as TsItem[],
        hasCustomer: [] as TsItem[]
    });

    const handleItemClick = (tableId: number, billId: number) => {
        router.push(`/waiter/order?tableId=${tableId}&billId=${billId}`);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<TsItem[]>('/api/tablestatus/all');
                setTsItemData(response.data);

                console.log(tsItemData)
            } catch (error) {
                console.error('Failed to fetch menu food data:', error);
            }
        };

        fetchData();
    }, []);

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
                            className="ts-item"
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

                {/* Has Customer tables */}
                <ul className="ts-list">
                    <h2 className="ts-has-customer-title">Has customer</h2>
                    {groupedData.hasCustomer.map((item) => (
                        <li key={item.tableId}
                            className="ts-item"
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
                            className="ts-item"
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
        </main>
    );
}

export default TableStatus;
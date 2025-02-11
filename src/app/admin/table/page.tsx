"use client";

import "@/style/app.css";
import axios from "@/config/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import stompClient from "@/utils/socket";
import { OrderStatus, TableBooking } from "@/types/types";
import TableModal from "@/components/tableModal";

interface TsItem {
    tableId: number;
    tableName: string;
    billId: number;
    capacity: number;
    status: "available" | "reserved" | "occupied";
}

const TableStatus = () => {
    const [tsItemData, setTsItemData] = useState<TsItem[]>([]);
    const [highlightedTables, setHighlightedTables] = useState<number[]>([]);
    const [selectedTable, setSelectedTable] = useState<TsItem | undefined>(undefined);

    const router = useRouter();

    // Fetch tables from DB
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<TsItem[]>("/api/tables/all");
                setTsItemData(response.data || []);
            } catch (error) {
                console.error("Failed to fetch table data:", error);
            }
        };
        fetchData();
    }, []);

    // WebSocket for receiving status updates
    useEffect(() => {
        stompClient.onConnect = () => {
            stompClient.subscribe("/topic/waiter", (message) => {
                const statusUpdate: OrderStatus = JSON.parse(message.body);

                // Highlight the table that received an update
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

    // Handle clicking on a table that is already occupied or reserved
    const handleItemClick = (tableId: number, billId: number) => {
        router.push(`/admin/order?tableId=${tableId}&billId=${billId}`);
    };

    // Handle clicking on an available table
    const handleAvailableClick = (tableId: number) => {
        const table = tsItemData.find((item) => item.tableId === tableId);
        setSelectedTable(table);
    };

    // Handle submitting the booking from the modal
    const handleModalSubmit = async (data: TableBooking) => {
        try {
            const response = await axios.post<number>("/api/bookings", {
                tableId: data.tableId,
                customerName: data.customerName,
                specialRequest: data.specialRequest,
                reservedTime: data.reservedTime,
                numberOfGuests: data.numberOfGuests,
                tableStatus: data.tableStatus,
            });

            const billId = response.data;
            setTsItemData((prev) =>
                prev.map((item) =>
                    item.tableId === selectedTable?.tableId
                        ? { ...item, status: data.tableStatus, billId }
                        : item
                )
            );
            setSelectedTable(undefined);
        } catch (error) {
            console.error("Failed to book table:", error);
        }
    };

    return (
        <main className="main main-ts">
            <h1 className="main-title">TABLE</h1>

            {/* Floor-plan style container */}
            <section className="ts-floor-plan">
                {tsItemData.map((item) => (
                    <div
                        key={item.tableId}
                        className={`ts-table ${item.status} ${highlightedTables.includes(item.tableId) ? "ts-notify" : ""
                            }`}
                        onClick={() => {
                            if (item.status === "available") {
                                handleAvailableClick(item.tableId);
                            } else {
                                handleItemClick(item.tableId, item.billId);
                            }
                        }}
                    >
                        <p className="table-label">Table {item.tableId}</p>
                        <p>Capacity: {item.capacity}</p>
                        <p>Bill ID: {item.billId}</p>
                    </div>
                ))}
            </section>

            {/* Table Modal */}
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
};

export default TableStatus;

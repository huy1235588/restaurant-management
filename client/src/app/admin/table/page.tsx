"use client";

import "@/style/app.css";
import axios from "@/config/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import stompClient from "@/utils/socket";
import { Bills, OrderStatus, Reservation, RestaurantTables } from "@/types/types";
import TableModal from "@/components/tableModal";

interface TsItem {
    tableId: RestaurantTables["tableId"];
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

    // Lấy dữ liệu bàn từ server
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

    // WebSocket để nhận thông báo từ server
    useEffect(() => {
        stompClient.onConnect = () => {
            stompClient.subscribe("/topic/waiter", (message) => {
                const statusUpdate: OrderStatus = JSON.parse(message.body);

                // Highlight cho bàn có thay đổi trạng thái
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

    // Hàm xử lý khi click vào một bàn
    const handleItemClick = (tableId: number, billId: number) => {
        router.push(`/admin/order?tableId=${tableId}&billId=${billId}`);
    };

    // Hàm xử lý khi click vào bàn trống
    const handleAvailableClick = (tableId: number) => {
        const table = tsItemData.find((item) => item.tableId === tableId);
        setSelectedTable(table);
    };

    // Hàm xử lý khi submit form modal
    const handleModalSubmit = async (data: Reservation) => {
        try {
            const response = await axios.post<Bills>(`/api/reservation?status=${data.tableStatus}`, {
                table: {
                    id: data.tableId,
                },
                customerName: data.customerName,
                specialRequest: data.specialRequest,
                reservationDate: data.reservationDate,
                reservationTime: data.reservationTime,
                headCount: data.headCount,
            });

            // Cập nhật bill ID cho bàn
            const billId = response.data.id;

            // Cập nhật trạng thái bàn
            setTsItemData((prev) =>
                prev.map((item) =>
                    item.tableId === selectedTable?.tableId
                        ? { ...item, status: data.tableStatus, billId }
                        : item
                )
            );

            // Đóng modal
            setSelectedTable(undefined);
        } catch (error) {
            console.error("Failed to book table:", error);
        }
    };

    return (
        <main className="main main-ts">
            <h1 className="main-title">TABLE</h1>

            <div className="ts-container">
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

                {/* Legend */}
                <section className="ts-legend">
                    <div className="ts-legend-item">
                        <div className="ts-legend-color" style={{ backgroundColor: 'green' }}></div>
                        <span>Available</span>
                    </div>
                    <div className="ts-legend-item">
                        <div className="ts-legend-color" style={{ backgroundColor: 'yellow' }}></div>
                        <span>Reserved</span>
                    </div>
                    <div className="ts-legend-item">
                        <div className="ts-legend-color" style={{ backgroundColor: 'red' }}></div>
                        <span>Occupied</span>
                    </div>
                </section>
            </div>

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

'use client';

import { useEffect, useState } from 'react';

type InvoiceData = {
    id: string;
    customerName: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
};

const InvoicePage = () => {
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);

    useEffect(() => {
        // Simulate fetching invoice data after mounting
        setInvoice({
            id: '123',
            customerName: 'Nguyễn Văn A',
            items: [
                { name: 'Món 1', quantity: 2, price: 50000 },
                { name: 'Món 2', quantity: 1, price: 70000 }
            ],
            total: 170000
        });
    }, []);

    const handlePrint = () => {
        window.print(); // In hóa đơn
    };

    if (!invoice) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Hóa đơn #{invoice.id}</h1>
            <p>Khách hàng: {invoice.customerName}</p>
            <table>
                <thead>
                    <tr>
                        <th>Tên món</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.price.toLocaleString()} VND</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2>Tổng cộng: {invoice.total.toLocaleString()} VND</h2>
            <button onClick={handlePrint}>In hóa đơn</button>
        </div>
    );
};

export default InvoicePage;

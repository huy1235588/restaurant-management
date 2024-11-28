
import React from 'react';
import { Cart } from '@/types/types';

interface Props {
    cartData: Cart[];
    handleRemoveFromCart: (id: string) => void;
}

const CartTable: React.FC<Props> = ({ cartData, handleRemoveFromCart }) => (
    <table className="cart-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {cartData.map((item, index) => (
                <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.itemName}</td>
                    <td>{item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>{item.total.toFixed(2)}</td>
                    <td className={`cart-status cart-status-${item.status}`}>{item.status}</td>
                    <td>
                        <button
                            className="delete-card-btn"
                            onClick={() => handleRemoveFromCart(item.id)}
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default CartTable;

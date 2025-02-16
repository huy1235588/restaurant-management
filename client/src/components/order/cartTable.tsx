
import React from 'react';
import { KitchenOrder } from '@/types/types';

interface Props {
    KitchenOrders: KitchenOrder[];
    handleRemoveFromCart: (id: string) => void;
}

const CartTable: React.FC<Props> = ({ KitchenOrders, handleRemoveFromCart }) => {
    return (
        <table className="cart-table">
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {KitchenOrders.map((item, index) => (
                    <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.itemPrice.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>{(item.itemPrice * item.quantity).toFixed(2)}</td>
                        <td className={`cart-status cart-status-${item.status}`}>{item.status}</td>
                        <td>
                            <button
                                className="delete-cart-btn"
                                onClick={() => handleRemoveFromCart(item.itemId)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
export default CartTable;

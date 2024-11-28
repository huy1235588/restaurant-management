import React from 'react';
import { MenuFood } from '@/types/types';

interface Props {
    menuFoodData: MenuFood[];
    quantities: { [key: string]: number };
    onQuantityChange: (id: string, value: number) => void;
    onAddToCart: (item: MenuFood) => void;
}

const MenuFoodTable: React.FC<Props> = ({ menuFoodData, quantities, onQuantityChange, onAddToCart }) => (
    <table className="mf-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {menuFoodData.map((item) => (
                <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.itemName}</td>
                    <td>{item.category}</td>
                    <td>{item.price.toFixed(2)}</td>
                    <td>
                        <input
                            type="number"
                            min="1"
                            value={quantities[item.id] || 1}
                            max={1000}
                            onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value, 10))}
                            className="quantity-input"
                        />
                    </td>
                    <td>
                        <button
                            className="add-to-cart-btn"
                            onClick={() => onAddToCart(item)}
                        >
                            Add to Cart
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default MenuFoodTable;

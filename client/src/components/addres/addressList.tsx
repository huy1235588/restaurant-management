// app/components/AddressList.tsx
"use client";

import { List, ListItem } from "@mui/material";
import { FaLocationDot } from "react-icons/fa6";

interface Address {
    name: string;
    location: string;
}

interface AddressListProps {
    addresses: Address[];
    onSelect: (location: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ addresses, onSelect }) => {
    return (
        <List className="address-list">
            <h3 className="address-list-title">
                Address
            </h3>
            {addresses.map((address, index) => (
                <ListItem
                    className="address-list-item"
                    key={index}
                    onClick={() => onSelect(address.location)}
                >
                    <FaLocationDot />
                    {address.name}
                </ListItem>
            ))}
        </List>
    );
};

export default AddressList;

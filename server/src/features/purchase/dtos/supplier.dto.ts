export interface CreateSupplierDto {
    supplierCode: string;
    supplierName: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    paymentTerms?: string;
}

export interface UpdateSupplierDto {
    supplierCode?: string;
    supplierName?: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    paymentTerms?: string;
    isActive?: boolean;
}

export interface SupplierQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

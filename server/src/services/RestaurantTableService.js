const RestaurantTable = require('../models/restaurantTables.model');

class RestaurantTableService {
    // Lấy tất cả dữ liệu
    async getAll() {
        try {
            return await RestaurantTable.findAll();
        } catch (error) {
            throw error;
        }
    }

    // Lấy dữ liệu theo id
    async getById(id) {
        try {
            return await RestaurantTable.findByPk(id);
        } catch (error) {
            throw error;
        }
    }

    // Lấy dữ liệu theo điều kiện
    async getWhere(data) {
        try {
            return await RestaurantTable.findAll({
                where: data
            });
        } catch (error) {
            throw error;
        }
    }

    // Tạo dữ liệu
    async create(data) {
        try {
            return await RestaurantTable.create(data);
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật dữ liệu
    async update(id, data) {
        try {
            const restaurantTable = await RestaurantTable.findByPk(id);
            if (restaurantTable) {
                restaurantTable.update(data);
                return restaurantTable;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Xóa dữ liệu
    async delete(id) {
        try {
            const restaurantTable = await RestaurantTable.findByPk(id);
            if (restaurantTable) {
                return await restaurantTable.destroy();
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Xóa tất cả dữ liệu
    async deleteAll() {
        try {
            return await RestaurantTable.destroy({
                where: {},
                truncate: false
            });
        } catch (error) {
            throw error;
        }
    }

    // Tìm kiếm theo tên
    async findByName(tableName) {
        try {
            return await RestaurantTable.findAll({
                where: {
                    tableName
                }
            });
        } catch (error) {
            throw error;
        }
    }
}
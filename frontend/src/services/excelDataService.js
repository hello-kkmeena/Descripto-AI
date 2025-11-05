import ApiService from './apiService';
import { EXCEL_ENDPOINTS } from '../config/apiConfig';
import { toast } from 'react-toastify';

/**
 * Service for fetching Excel data (Product Groups, Columns, Products)
 * Uses real API calls to fetch data from backend
 */
class ExcelDataService {
    /**
     * Fetch all product groups for authenticated user
     * @param {boolean} isAuthenticated - Whether user is authenticated
     * @param {Object} options - Options for pagination
     * @returns {Promise<Object>} Product groups list with pagination
     */
    static async fetchProductGroups(isAuthenticated, options = {}) {
        const { page = 0, size = 20 } = options;

        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });

            const endpoint = `${EXCEL_ENDPOINTS.GROUPS}?${params.toString()}`;
            
            const response = await ApiService.fetchWithAuth(endpoint, {
                method: 'GET'
            }, true);

            // Handle response structure from backend
            // Backend returns ApiResponse<Page<ProductGroupResponse>>
            // Page structure: { content: [], totalElements: number, totalPages: number, number: number, size: number }
            if (response.success && response.data) {
                const pageData = response.data;
                
                // Extract groups from content array (Spring Page structure)
                const groups = pageData.content || pageData.groups || pageData || [];
                
                return {
                    success: true,
                    data: {
                        groups: Array.isArray(groups) ? groups : [],
                        total: pageData.totalElements || pageData.total || groups.length,
                        page: pageData.number !== undefined ? pageData.number : page,
                        size: pageData.size !== undefined ? pageData.size : size,
                        totalPages: pageData.totalPages || Math.ceil((pageData.totalElements || groups.length) / size)
                    }
                };
            } else {
                throw new Error(response.message || 'Failed to fetch product groups');
            }
        } catch (error) {
            console.error('Error fetching product groups:', error);
            toast.error(error.message || 'Failed to fetch Excel files');
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Fetch product group data with optional columns and products
     * @param {number} groupId - Product group ID
     * @param {boolean} isAuthenticated - Whether user is authenticated
     * @param {Object} options - Options for data fetching
     * @returns {Promise<Object>} Product group data with optional nested data
     */
    static async fetchProductGroupData(groupId, isAuthenticated, options = {}) {
        const {
            includeColumns = false,
            includeProducts = false,
            page = 0,
            size = 50
        } = options;

        try {
            const params = new URLSearchParams({
                includeColumns: includeColumns.toString(),
                includeProducts: includeProducts.toString(),
                page: page.toString(),
                size: size.toString()
            });

            const endpoint = `${EXCEL_ENDPOINTS.GROUP_DATA(groupId)}?${params.toString()}`;
            const response = await ApiService.fetchWithAuth(endpoint, {
                method: 'GET'
            }, true);

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching product group data:', error);
            toast.error(error.message || 'Failed to fetch Excel data');
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default ExcelDataService;

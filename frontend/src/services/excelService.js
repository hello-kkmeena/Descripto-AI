import ApiService from './apiService';
import { toast } from 'react-toastify';
import { EXCEL_ENDPOINTS } from '../config/apiConfig';

class ExcelService {
    /**
     * Process Excel file in unstructured mode to detect column structure
     * @param {File} file - Excel file to process
     * @returns {Promise<Object>} Column structure data
     */
    static async processExcelFile(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('structured', 'false');

            const response = await ApiService.fetchWithAuth(
                EXCEL_ENDPOINTS.PROCESS,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.success && response.data.success) {
                toast.success('Excel file processed successfully!');
                return {
                    success: true,
                    data: response.data
                };
            } else {
                throw new Error(response.data?.message || 'Failed to process Excel file');
            }
        } catch (error) {
            console.error('Excel processing error:', error);
            toast.error(error.message || 'Failed to process Excel file');
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate Excel file against provided column structure
     * @param {File} file - Excel file to validate
     * @param {Array} columnStructures - Array of column structure objects
     * @returns {Promise<Object>} Validation result
     */
    static async validateExcelFile(file, columnStructures) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('structured', 'true');
            formData.append('columns', JSON.stringify(columnStructures));

            const response = await ApiService.fetchWithAuth(
                EXCEL_ENDPOINTS.PROCESS,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.success && response.data.success) {
                toast.success('Excel file validated successfully!');
                return {
                    success: true,
                    data: response.data
                };
            } else {
                throw new Error(response.data?.message || 'Failed to validate Excel file');
            }
        } catch (error) {
            console.error('Excel validation error:', error);
            toast.error(error.message || 'Failed to validate Excel file');
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check Excel service health
     * @returns {Promise<Object>} Health check result
     */
    static async checkHealth() {
        try {
            const response = await ApiService.fetchWithAuth(
                EXCEL_ENDPOINTS.HEALTH,
                {
                    method: 'GET'
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Health check error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate file before upload
     * @param {File} file - File to validate
     * @returns {Object} Validation result
     */
    static validateFile(file) {
        const errors = [];

        // Check file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];
        
        if (!allowedTypes.includes(file.type)) {
            errors.push('Invalid file type. Only .xlsx and .xls files are allowed.');
        }

        // Check file size (25 MB limit)
        const maxSize = 25 * 1024 * 1024; // 25 MB in bytes
        if (file.size > maxSize) {
            errors.push('File size exceeds maximum limit of 25 MB.');
        }

        // Check if file is empty
        if (file.size === 0) {
            errors.push('File cannot be empty.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default ExcelService;

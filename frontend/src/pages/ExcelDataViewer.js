import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExcelDataService from '../services/excelDataService';
import Header from '../components/Header';

/**
 * Excel Data Viewer Page
 * Displays uploaded Excel files with their data in a tabular format
 * 
 * Features:
 * - Left sidebar with list of Excel files
 * - Sheet details header
 * - Fixed header data table
 * - Pagination support
 * - Authentication required (redirects to home if not authenticated)
 */
function ExcelDataViewer() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // State management
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [productGroups, setProductGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [columns, setColumns] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [error, setError] = useState(null);

    // i think this pagination is for groups
    const [pagination, setPagination] = useState({
        page: 0,
        size: 50,
        total: 0
    });

    // Derive selectedGroup from productGroups array using selectedGroupId
    const selectedGroup = productGroups.find(g => g.id === selectedGroupId) || null;

    // Authentication check - redirect to home if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/', { replace: true });
            return;
        }
        // Load product groups when authenticated
        loadProductGroups();
    }, [isAuthenticated, navigate]);

    // Load product groups list
    const loadProductGroups = async () => {
        if (!isAuthenticated) return;

        try {
            setIsLoadingGroups(true);
            setError(null);

            const result = await ExcelDataService.fetchProductGroups(isAuthenticated, {
                page: 0,
                size: 20
            });

            if (result.success && result.data) {
                setProductGroups(result.data.groups || []);
                
                // Auto-select first group if available
                if (result.data.groups && result.data.groups.length > 0 && !selectedGroupId) {
                    setSelectedGroupId(result.data.groups[0].id);
                }
            } else {
                throw new Error(result.error || 'Failed to load Excel files');
            }
        } catch (err) {
            console.error('Error loading product groups:', err);
            setError(err.message || 'Failed to load Excel files');
        } finally {
            setIsLoadingGroups(false);
        }
    };

    // Load product group data (columns + products)
    const loadProductGroupData = async (groupId, page = 0, clearDataFirst = false) => {
        if (!isAuthenticated || !groupId) return;

        try {
            // Clear existing data first if switching groups
            if (clearDataFirst) {
                setColumns([]);
                setProducts([]);
                setPagination(prev => ({ ...prev, page: 0, total: 0 }));
            }

            setIsLoadingTable(true);
            setError(null);

            const result = await ExcelDataService.fetchProductGroupData(groupId, isAuthenticated, {
                includeColumns: true,
                includeProducts: true,
                page,
                size: pagination.size
            });

            if (result.success && result.data) {
                if (result.data.columns) {
                    // Sort columns by columnOrder
                    const sortedColumns = [...result.data.columns].sort((a, b) => 
                        (a.columnOrder || 0) - (b.columnOrder || 0)
                    );
                    setColumns(sortedColumns);
                }

                if (result.data.products) {
                    setProducts(result.data.products);
                }

                if (result.data.total !== undefined) {
                    setPagination(prev => ({
                        ...prev,
                        total: result.data.total,
                        page
                    }));
                }
            } else {
                throw new Error(result.error || 'Failed to load Excel data');
            }
        } catch (err) {
            console.error('Error loading product group data:', err);
            setError(err.message || 'Failed to load Excel data');
        } finally {
            setIsLoadingTable(false);
        }
    };

    // Handle group selection - clear data first, then load
    useEffect(() => {
        if (selectedGroupId) {
            // Clear existing data first, then load new data
            loadProductGroupData(selectedGroupId, 0, true);
        } else {
            setColumns([]);
            setProducts([]);
            setPagination(prev => ({ ...prev, page: 0, total: 0 }));
        }
    }, [selectedGroupId]);

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (selectedGroupId) {
            loadProductGroupData(selectedGroupId, newPage);
        }
    };

    // Don't render if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex flex-col">
            <Header />
            
            <div className="flex-1 flex relative">
                {/* Sidebar Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="fixed top-20 left-4 z-40 p-2 bg-white rounded-md shadow-md hover:bg-gray-100 transition-all duration-200"
                    aria-label="Toggle sidebar"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Sidebar */}
                <div
                    className={`fixed inset-y-0 left-0 transform ${
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out z-30 mt-16`}
                >
                    <div className="flex flex-col h-full">
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Excel Files</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                {productGroups.length} file{productGroups.length !== 1 ? 's' : ''} uploaded
                            </p>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoadingGroups ? (
                                <div className="p-4 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-2 text-sm">Loading files...</p>
                                </div>
                            ) : productGroups.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    <p className="text-sm">No Excel files uploaded yet</p>
                                    <button
                                        onClick={() => navigate('/excel')}
                                        className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Upload Excel File
                                    </button>
                                </div>
                            ) : (
                                productGroups.map((group) => (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedGroupId(group.id)}
                                        className={`w-full text-left p-3 transition-colors duration-200 ${
                                            selectedGroupId === group.id
                                                ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`font-medium truncate ${
                                            selectedGroupId === group.id ? 'text-blue-700' : 'text-gray-800'
                                        }`}>
                                            {group.fileName || group.name}
                                        </div>
                                        <div className={`text-xs mt-1 ${
                                            selectedGroupId === group.id ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                            {group.numRows} rows • {group.numColumns} columns
                                        </div>
                                        <div className={`text-xs mt-1 ${
                                            selectedGroupId === group.id ? 'text-blue-600' : 'text-gray-400'
                                        }`}>
                                            {new Date(group.createdAt).toLocaleDateString()}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out mt-16`}>
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                                <button
                                    onClick={() => {
                                        if (selectedGroupId) {
                                            loadProductGroupData(selectedGroupId, pagination.page, false);
                                        } else {
                                            loadProductGroups();
                                        }
                                    }}
                                    className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {!selectedGroupId ? (
                            <div className="flex flex-col items-center justify-center h-96 text-center text-gray-500">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No Excel File Selected</h3>
                                <p className="text-sm max-w-md">
                                    Select an Excel file from the sidebar to view its data, or upload a new file.
                                </p>
                                <button
                                    onClick={() => navigate('/excel')}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Upload Excel File
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Sheet Info Card */}
                                {selectedGroup && (
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                            {selectedGroup.fileName || selectedGroup.name}
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-primary-600">{selectedGroup.numRows}</p>
                                                <p className="text-xs text-gray-500 mt-1">Rows</p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-primary-600">{selectedGroup.numColumns}</p>
                                                <p className="text-xs text-gray-500 mt-1">Columns</p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-semibold text-gray-700 truncate">
                                                    {selectedGroup.fileName || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">File Name</p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {(selectedGroup.fileSize / 1024).toFixed(2)} KB
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">File Size</p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {new Date(selectedGroup.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Upload Date</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Data Table */}
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h3>
                                    
                                    {isLoadingTable ? (
                                        <div className="text-center py-16">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                                            <p className="mt-4 text-sm text-gray-500">Loading data...</p>
                                        </div>
                                    ) : columns.length === 0 ? (
                                        <div className="text-center py-16 text-gray-500">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm">No columns found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                                        <tr>
                                                            {columns.map((col) => (
                                                                <th
                                                                    key={col.id}
                                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                                                                    title={`${col.name} - ${col.dataType}${col.comment ? ` - ${col.comment}` : ''}`}
                                                                >
                                                                    {col.name}
                                                                </th>
                                                            ))}
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                                Description
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {products.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                                                                    No data available
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            products.map((product, index) => {
                                                                let detailsMap = {};
                                                                try {
                                                                    detailsMap = JSON.parse(product.details || '{}');
                                                                } catch (e) {
                                                                    console.error('Error parsing product details:', e, product.details);
                                                                }
                                                                
                                                                return (
                                                                    <tr key={product.id} className="hover:bg-gray-50">
                                                                        {columns.map((col) => {
                                                                            // Use column ID as key since backend stores data with column IDs as keys
                                                                            const value = detailsMap[col.id?.toString()];
                                                                            return (
                                                                                <td key={col.id} className="px-4 py-2 text-sm text-gray-900">
                                                                                    {value !== undefined && value !== null 
                                                                                        ? String(value) 
                                                                                        : '-'}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                        <td className="px-4 py-2">
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Enter description..."
                                                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            {pagination.total > pagination.size && (
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                                    <div className="text-sm text-gray-500">
                                                        Showing {pagination.page * pagination.size + 1} to{' '}
                                                        {Math.min((pagination.page + 1) * pagination.size, pagination.total)} of{' '}
                                                        {pagination.total} rows
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handlePageChange(pagination.page - 1)}
                                                            disabled={pagination.page === 0 || isLoadingTable}
                                                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Previous
                                                        </button>
                                                        <button
                                                            onClick={() => handlePageChange(pagination.page + 1)}
                                                            disabled={(pagination.page + 1) * pagination.size >= pagination.total || isLoadingTable}
                                                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExcelDataViewer;


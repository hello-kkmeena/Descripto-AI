import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelService from '../services/excelService';
import LoadingOverlay from '../components/LoadingOverlay';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ExcelUpload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    // State management
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [columnStructures, setColumnStructures] = useState([]);
    const [fileInfo, setFileInfo] = useState(null);
    const [errors, setErrors] = useState([]);
    const [currentStep, setCurrentStep] = useState('upload'); // upload, review, success

    // File handling
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validation = ExcelService.validateFile(file);
        if (!validation.isValid) {
            setErrors(validation.errors);
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
        setErrors([]);
        setFileInfo({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: file.type
        });
    };

    const handleFileDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            fileInputRef.current.files = event.dataTransfer.files;
            handleFileSelect({ target: { files: [file] } });
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    // Process Excel file to detect column structure
    const handleProcessFile = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setErrors([]);

        try {
            const result = await ExcelService.processExcelFile(selectedFile);
            
            if (result.success) {
                setColumnStructures(result.data.columnStructures);
                setFileInfo(prev => ({
                    ...prev,
                    rowsProcessed: result.data.rowsProcessed,
                    columnsDetected: result.data.columnsDetected
                }));
                setCurrentStep('review');
            } else {
                setErrors([result.error || 'Failed to process file']);
            }
        } catch (error) {
            setErrors([error.message || 'An unexpected error occurred']);
        } finally {
            setIsProcessing(false);
        }
    };

    // Update column structure
    const handleColumnUpdate = (index, field, value) => {
        const updatedColumns = [...columnStructures];
        updatedColumns[index] = {
            ...updatedColumns[index],
            [field]: value
        };
        setColumnStructures(updatedColumns);
    };

    // Validate file with updated column structure
    const handleValidateFile = async () => {
        if (!selectedFile || columnStructures.length === 0) return;

        setIsValidating(true);
        setErrors([]);

        try {
            const result = await ExcelService.validateExcelFile(selectedFile, columnStructures);
            
            if (result.success) {
                setCurrentStep('success');
            } else {
                setErrors([result.error || 'Validation failed']);
            }
        } catch (error) {
            setErrors([error.message || 'An unexpected error occurred']);
        } finally {
            setIsValidating(false);
        }
    };

    // Reset and start over
    const handleReset = () => {
        setSelectedFile(null);
        setColumnStructures([]);
        setFileInfo(null);
        setErrors([]);
        setCurrentStep('upload');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Render upload step
    const renderUploadStep = () => (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Excel File Upload
                </h1>
                <p className="text-lg text-gray-600">
                    Upload your Excel file to automatically detect column structure
                </p>
            </div>

            {/* File Upload Area */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        selectedFile 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                    }`}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-lg font-medium text-gray-900">
                            {selectedFile ? selectedFile.name : 'Drop your Excel file here'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            or click to browse
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary"
                    >
                        Choose File
                    </button>

                    <div className="mt-4 text-xs text-gray-500">
                        <p>Supported formats: .xlsx, .xls</p>
                        <p>Maximum size: 25 MB</p>
                        <p>Maximum rows: 1,000</p>
                    </div>
                </div>

                {/* File Info */}
                {fileInfo && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">File Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Name:</span>
                                <p className="font-medium">{fileInfo.name}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Size:</span>
                                <p className="font-medium">{fileInfo.size}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Type:</span>
                                <p className="font-medium">{fileInfo.type}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        {errors.map((error, index) => (
                            <p key={index} className="text-red-700 text-sm">{error}</p>
                        ))}
                    </div>
                )}

                {/* Process Button */}
                {selectedFile && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleProcessFile}
                            disabled={isProcessing}
                            className="btn-primary"
                        >
                            {isProcessing ? 'Processing...' : 'Process File'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // Render review step
    const renderReviewStep = () => (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Review Column Structure
                </h1>
                <p className="text-lg text-gray-600">
                    Review and modify the detected column structure before validation
                </p>
            </div>

            {/* File Summary */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{fileInfo?.columnsDetected}</p>
                        <p className="text-sm text-gray-500">Columns Detected</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{fileInfo?.rowsProcessed}</p>
                        <p className="text-sm text-gray-500">Rows Processed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{fileInfo?.name}</p>
                        <p className="text-sm text-gray-500">File Name</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{fileInfo?.size}</p>
                        <p className="text-sm text-gray-500">File Size</p>
                    </div>
                </div>
            </div>

            {/* Column Structure Table */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Column Structure</h3>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Column Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    About Column
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nullable
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comment
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {columnStructures.map((column, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">
                                            {column.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={column.dataType}
                                            onChange={(e) => handleColumnUpdate(index, 'dataType', e.target.value)}
                                            className="select-field text-sm"
                                        >
                                            <option value="STRING">String</option>
                                            <option value="NUMBER">Number</option>
                                            <option value="BOOLEAN">Boolean</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={column.aboutColumn || ''}
                                            onChange={(e) => handleColumnUpdate(index, 'aboutColumn', e.target.value)}
                                            className="input-field text-sm"
                                            placeholder="Describe this column..."
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={column.nullable ? 'true' : 'false'}
                                            onChange={(e) => handleColumnUpdate(index, 'nullable', e.target.value === 'true')}
                                            className="select-field text-sm"
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={column.comment || ''}
                                            onChange={(e) => handleColumnUpdate(index, 'comment', e.target.value)}
                                            className="input-field text-sm"
                                            placeholder="Add a comment..."
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleReset}
                        className="btn-secondary"
                    >
                        Start Over
                    </button>
                    <button
                        onClick={handleValidateFile}
                        disabled={isValidating}
                        className="btn-primary"
                    >
                        {isValidating ? 'Validating...' : 'Validate Structure'}
                    </button>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        {errors.map((error, index) => (
                            <p key={index} className="text-red-700 text-sm">{error}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // Render success step
    const renderSuccessStep = () => (
        <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
                <div className="mb-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Excel File Validated Successfully!
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Your Excel file has been processed and validated against the column structure.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{fileInfo?.columnsDetected}</p>
                        <p className="text-sm text-gray-500">Columns Validated</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{fileInfo?.rowsProcessed}</p>
                        <p className="text-sm text-gray-500">Rows Processed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{fileInfo?.name}</p>
                        <p className="text-sm text-gray-500">File Name</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleReset}
                        className="btn-secondary"
                    >
                        Process Another File
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex flex-col">
            <Header />
            
            <main className="flex-1 relative py-8">
                {currentStep === 'upload' && renderUploadStep()}
                {currentStep === 'review' && renderReviewStep()}
                {currentStep === 'success' && renderSuccessStep()}
            </main>
            
            <Footer />

            {/* Loading Overlay */}
            {(isProcessing || isValidating) && (
                <LoadingOverlay 
                    message={isProcessing ? 'Processing Excel file...' : 'Validating structure...'} 
                />
            )}
        </div>
    );
};

export default ExcelUpload;


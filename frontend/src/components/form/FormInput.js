import React from 'react';

const FormInput = ({
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  showCharCount = true,
  className = ''
}) => {
  return (
    <div className="flex-1">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
      />
      {(error || showCharCount) && (
        <div className="mt-1 flex justify-between">
          <span className="text-xs text-red-500">
            {error}
          </span>
          {showCharCount && (
            <span className={`text-xs ${value.length >= maxLength ? 'text-red-500' : 'text-gray-500'}`}>
              {value.length}/{maxLength} characters
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FormInput;
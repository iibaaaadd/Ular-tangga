import React from 'react';
import { motion } from 'motion/react';

const Table = ({ columns, data, onRowClick, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}
      {...props}
    >
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.key === 'actions' ? 'w-auto whitespace-nowrap' : ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
                whileHover={{ backgroundColor: '#f9fafb' }}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`px-4 py-4 text-sm text-gray-900 ${
                      column.key === 'actions' ? 'relative whitespace-nowrap' : ''
                    }`}
                  >
                    <div className={column.key === 'actions' ? 'relative' : 'max-w-xs overflow-hidden'}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </div>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-500"
        >
          Tidak ada data untuk ditampilkan
        </motion.div>
      )}
    </motion.div>
  );
};

export default Table;
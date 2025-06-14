import React from 'react';

interface TableColumn {
  key: string;
  header: string;
  accessor: (item: any) => React.ReactNode;
  sortable?: boolean;
}

interface AccessibleTableProps {
  columns: TableColumn[];
  data: any[];
  caption?: string;
  className?: string;
  onRowClick?: (item: any) => void;
  selectedRowId?: string;
}

export const AccessibleTable: React.FC<AccessibleTableProps> = ({
  columns,
  data,
  caption,
  className = '',
  onRowClick,
  selectedRowId
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full" role="table">
        {caption && (
          <caption className="sr-only">
            {caption}
          </caption>
        )}
        
        <thead className="bg-white/5">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                {column.header}
                {column.sortable && (
                  <span className="sr-only">
                    (sortable column)
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="divide-y divide-white/10">
          {data.map((item, index) => (
            <tr 
              key={item.id || index}
              className={`
                hover:bg-white/5 transition-colors
                ${onRowClick ? 'cursor-pointer' : ''}
                ${selectedRowId === item.id ? 'bg-blue-500/20' : ''}
              `}
              onClick={() => onRowClick?.(item)}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              aria-pressed={selectedRowId === item.id}
              onKeyDown={(e) => {
                if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRowClick(item);
                }
              }}
            >
              {columns.map((column) => (
                <td 
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm"
                >
                  {column.accessor(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};
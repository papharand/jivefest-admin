'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DataTable.module.css';

interface DataTableProps {
  headers: string[];
  data?: Record<string, any>[];
}

export default function DataTable({ headers, data }: DataTableProps) {
  const router = useRouter();
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sample data if none provided
  const sampleData = [
    { id: 1, values: ['John', 'Doe', 'VIP', 'L', '001'] },
    { id: 2, values: ['Jane', 'Smith', 'General', 'M', '002'] },
    { id: 3, values: ['Mike', 'Johnson', 'Staff', 'XL', '003'] },
  ];

  const tableData = data || sampleData;

  const handleRowClick = (row: Record<string, any>) => {
    const rowValues = row.values || Object.values(row).slice(1);
    const rowId = rowValues[0]; // First value is the ID

    // Save row data to localStorage for the detail page
    const rowData = {
      id: rowId,
      headers: headers,
      values: rowValues
    };
    localStorage.setItem('selected-row', JSON.stringify(rowData));

    // Navigate to detail page
    router.push(`/admin/${rowId}`);
  };

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  // Sort the data
  const sortedData = [...tableData].sort((a, b) => {
    if (sortColumn === null) return 0;

    const aValue = (a.values || Object.values(a).slice(1))[sortColumn];
    const bValue = (b.values || Object.values(b).slice(1))[sortColumn];

    // Check if both values are numeric
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    const bothNumeric = !isNaN(aNum) && !isNaN(bNum);

    if (bothNumeric) {
      // Numeric comparison
      if (sortDirection === 'asc') {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    } else {
      // String comparison
      const aVal = String(aValue).toLowerCase();
      const bVal = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    }
  });

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeader}>
            {headers.map((header, index) => (
              <th
                key={index}
                className={styles.tableHeaderCell}
                onClick={() => handleSort(index)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {header}
                {sortColumn === index && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={rowIndex < sortedData.length - 1 ? styles.tableRow : ''}
              onClick={() => handleRowClick(row)}
              style={{ cursor: 'pointer' }}
            >
              {(row.values || Object.values(row).slice(1)).map((cell: any, cellIndex: number) => (
                <td key={cellIndex} className={styles.tableCell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

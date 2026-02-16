'use client';

import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import styles from './page.module.css';
import MyModal from '@/components/MyModal/MyModal';
import DataTable from '@/components/DataTable/DataTable';
import SearchBar from '@/components/SearchBar/SearchBar';

export default function AdminPage() {
  const [headers, setHeaders] = useState<string[]>(['ID', 'Prénom', 'Nom', 'Type de Passe', 'T-shirt', 'Bib Number']);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [tempHeaders, setTempHeaders] = useState<string[]>([]);
  const [tempData, setTempData] = useState<Record<string, any>[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHeaders = localStorage.getItem('jivefest-headers');
    const savedData = localStorage.getItem('jivefest-data');

    if (savedHeaders && savedData) {
      try {
        setHeaders(JSON.parse(savedHeaders));
        setData(JSON.parse(savedData));
        console.log('Loaded data from localStorage');
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }, []);

  const handleImportExcel = () => {
    // Trigger the file input click
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        // Handle CSV file
        const text = await file.text();
        const lines = text.trim().split('\n');
        const csvHeaders = lines[0].split(',').map(h => h.trim());

        // Parse data rows and prepend ID
        const csvData = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          return {
            id: index + 1,
            values: [String(index + 1), ...values] // Prepend ID
          };
        });

        setTempHeaders(['ID', ...csvHeaders]); // Prepend ID header
        setTempData(csvData);
        setIsOpen(true);
        console.log('CSV Headers:', ['ID', ...csvHeaders]);
        console.log('CSV Data:', csvData);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Handle Excel file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON to get headers and data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        const excelHeaders = jsonData[0] || [];

        // Parse data rows and prepend ID
        const excelData = jsonData.slice(1).map((row, index) => ({
          id: index + 1,
          values: [String(index + 1), ...row] // Prepend ID
        }));

        setTempHeaders(['ID', ...excelHeaders]); // Prepend ID header
        setTempData(excelData);
        setIsOpen(true);
        console.log('Excel Headers:', ['ID', ...excelHeaders]);
        console.log('Excel Data:', excelData);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleConfirmHeaders = () => {
    setHeaders(tempHeaders);
    setData(tempData);

    // Save to localStorage
    try {
      localStorage.setItem('jivefest-headers', JSON.stringify(tempHeaders));
      localStorage.setItem('jivefest-data', JSON.stringify(tempData));
      console.log('Saved data to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    setIsOpen(false);
    setTempHeaders([]);
    setTempData([]);
  };

  const handleCancelHeaders = () => {
    setIsOpen(false);
    setTempHeaders([]);
    setTempData([]);
  };

  // Filter data based on search value
  const filteredData = data.filter((row) => {
    if (!searchValue) return true; // Show all if no search value

    // Check if search has column-specific syntax: "header:value"
    const colonIndex = searchValue.indexOf(':');

    if (colonIndex > 0) {
      // Column-specific search
      const headerName = searchValue.slice(0, colonIndex).trim();
      const searchTerm = searchValue.slice(colonIndex + 1).trim().toLowerCase();

      // Find the column index for the specified header
      const columnIndex = headers.findIndex(
        (h) => h.toLowerCase() === headerName.toLowerCase()
      );

      if (columnIndex !== -1) {
        // Search only in the specified column
        const rowValues = row.values || Object.values(row).slice(1);
        const cellValue = rowValues[columnIndex];
        return String(cellValue).toLowerCase().includes(searchTerm);
      }
      // If header not found, fall back to regular search
    }

    // Regular search across all columns
    const rowValues = row.values || Object.values(row).slice(1);
    return rowValues.some((cell: any) =>
      String(cell).toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  return (
    <div className={styles.container}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className={styles.fileInput}
      />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerTitle}>JIVEFEST ADMIN PAGE</div>
        </div>
        <div className={styles.headerRight}>ADMIN</div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>

        <div className={styles.searchAndButtons}>
        <div className={styles.searchBar}>
          <SearchBar value={searchValue} onChange={setSearchValue} />

        </div>
        <div className={styles.buttons}>
            <button
            onClick={handleImportExcel}
            className={styles.button}
          >
            Import Excel
          </button>
          <button className={styles.button}>
            Download PDF
          </button>
        </div>
        </div>
        {/* Table */}
        <DataTable headers={headers} data={filteredData} />
      </main>

      <MyModal isOpen={isOpen} onClose={handleCancelHeaders}>

        <h2 className={styles.modalTitle}>Confirm Table Headers</h2>
        <p className={styles.modalDescription}>
          The following headers were found in your file. Do you want to use them for the table?
        </p>
        <div className={styles.headersContainer}>
          {tempHeaders.map((header, index) => (
            <span key={index} className={styles.headerBadge}>
              {header}
            </span>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button
            onClick={handleCancelHeaders}
            className={`${styles.modalButton} ${styles.modalButtonCancel}`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmHeaders}
            className={`${styles.modalButton} ${styles.modalButtonConfirm}`}
          >
            Confirm
          </button>
        </div>
      </MyModal>

    </div>
  );
}

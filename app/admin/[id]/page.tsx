'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AdminDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rowData, setRowData] = useState<{
    id: string;
    headers: string[];
    values: any[];
  } | null>(null);

  useEffect(() => {
    const savedRow = localStorage.getItem('selected-row');
    if (savedRow) {
      try {
        const parsed = JSON.parse(savedRow);
        setRowData(parsed);
      } catch (error) {
        console.error('Error loading row data:', error);
      }
    }
  }, []);

  const handleClose = () => {
    router.push('/admin');
  };

  // Helper function to get value by header name
  const getValueByHeader = (headerName: string): string => {
    if (!rowData) return '-';
    const index = rowData.headers.findIndex(h => h.toLowerCase() === headerName.toLowerCase());
    return index !== -1 ? String(rowData.values[index] || '-') : '-';
  };

  // Get full name (Prénom + Nom)
  const fullName = rowData
    ? `${getValueByHeader('Prénom')} ${getValueByHeader('Nom')}`.trim()
    : '-';

  return (
    <div className={styles.container}>
      {/* Close Button */}
      <button className={styles.closeButton} onClick={handleClose}>
        ×
      </button>

      {/* Container - centered on desktop, full width on mobile */}
      <div className={styles.wrapper}>
        <div className={styles.card}>
          {/* Header Logo */}
          <div className={styles.headerLogo}>
            <div className={styles.logoTop}>Montreal's</div>
            <div className={styles.logoMain}>
              JIVEFEST
            </div>
            <div className={styles.logoBottom}>at Academia</div>
          </div>

          {/* Enregistrement Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Enregistrement</h2>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nom</label>
              <div className={styles.field}>
                <span className={styles.fieldValue}>{fullName}</span>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Niveau</label>
              <div className={styles.field}>
                <span className={styles.fieldValue}>{getValueByHeader('Type de Passe')}</span>
              </div>
            </div>

            <div className={styles.iconContainer}>
              <div className={styles.iconContainerFlex}>
                <div className={styles.iconField}>
                  <div className={styles.iconBox}>
                    <span className={styles.iconText}>{getValueByHeader('T-shirt')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compétitions Section */}
          <div className={styles.sectionLarge}>
            <h2 className={styles.sectionTitle}>Compétitions</h2>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Mix'n'Match</label>
              <div className={styles.field}>
                <span className={styles.fieldValue}>{getValueByHeader("Mix'n'Match")}</span>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Strictly</label>
              <div className={styles.field}>
                <span className={styles.fieldValue}>{getValueByHeader('Strictly')}</span>
              </div>
            </div>

            <div className={`${styles.iconContainer} ${styles.fieldGroup}`}>
              <div className={styles.iconContainerFlex}>
                <div className={styles.iconFieldLarge}>
                  <div className={`${styles.iconBox} ${styles.iconBoxLarge} ${styles.iconBoxColumn}`}>
                    <span className={`${styles.iconText} ${styles.iconTextSmall}`}>#</span>
                    <span className={`${styles.iconText} ${styles.iconTextLarge}`}>{getValueByHeader('Bib Number')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Showcase</label>
              <div className={styles.field}>
                <span className={styles.fieldValue}>{getValueByHeader('Showcase')}</span>
              </div>
            </div>
          </div>

          {/* Check-in Button */}
          <button className={styles.checkInButton}>
            CHECK-IN
          </button>
        </div>
      </div>
    </div>
  );
}

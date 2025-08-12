// frontend/src/modules/gedenken/MemorialListingPage.jsx
// Finale Version: Kombiniert alle Funktionen mit der Anpassung für Netlify.

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './MemorialListingPage.css';

const MemorialCard = ({ page }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <Link to={`/gedenken/${page.slug}`} className="memorial-card">
            <div className="card-image-wrapper">
                <img src={page.main_photo_url || 'https://placehold.co/400x500/EFEFEF/AAAAAA&text=Foto'} alt={`Gedenkbild von ${page.first_name}`} />
            </div>
            <div className="card-info">
                <h3>{page.first_name} {page.last_name}</h3>
                <p>
                    * {formatDate(page.date_of_birth)} &nbsp;&nbsp; † {formatDate(page.date_of_death)}
                </p>
            </div>
        </Link>
    );
};

const MemorialListingPage = () => {
    const [pages, setPages] = useState([]);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                const [pagesRes, settingsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/memorial-pages/listing/`),
                    fetch(`${apiUrl}/api/settings/`)
                ]);

                if (!pagesRes.ok || !settingsRes.ok) {
                    throw new Error('Netzwerkantwort war nicht in Ordnung.');
                }
                
                const pagesData = await pagesRes.json();
                const settingsData = await settingsRes.json();
                
                setPages(pagesData);
                setSettings(settingsData);

            } catch (err) {
                setError('Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredPages = useMemo(() => {
        return pages.filter(page =>
            `${page.first_name} ${page.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pages, searchTerm]);

    const pageCount = Math.ceil(filteredPages.length / itemsPerPage);
    const paginatedPages = filteredPages.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    if (isLoading) {
        return <div className="loading-spinner"><div className="spinner"></div></div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const pageStyle = {
        backgroundColor: settings.listing_background_color || '#f4f1ee',
        color: settings.listing_text_color || '#3a3a3a',
    };

    return (
        <div className="listing-page-container" style={pageStyle}>
            <div className="listing-header">
                <h1>{settings.listing_title || "Wir gedenken"}</h1>
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Namen suchen..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0); // Reset to first page on new search
                        }}
                        className="search-input"
                    />
                </div>
            </div>

            {paginatedPages.length > 0 ? (
                <div className="memorial-grid">
                    {paginatedPages.map(page => (
                        <MemorialCard key={page.slug} page={page} />
                    ))}
                </div>
            ) : (
                <p className="no-results">Keine Gedenkseiten gefunden.</p>
            )}

            {pageCount > 1 && (
                <div className="pagination">
                    {Array.from({ length: pageCount }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={currentPage === i ? 'active' : ''}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemorialListingPage;

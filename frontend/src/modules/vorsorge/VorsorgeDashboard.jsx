import React from 'react';
import DigitalLegacy from './DigitalLegacy';
import FinancialItems from './FinancialItems';
import InsuranceItems from './InsuranceItems';
import ContractItems from './ContractItems';
import DocumentsSafe from './DocumentsSafe';
import LastWishes from './LastWishes'; // Neu

const VorsorgeDashboard = () => {
    return (
        <div>
            <h1>Mein Vorsorge-Dashboard</h1>
            <p>Hier können Sie alle Aspekte Ihrer Vorsorge verwalten.</p>
            
            <LastWishes />
            <hr style={{margin: '2rem 0'}} />
            <DocumentsSafe />
            <hr style={{margin: '2rem 0'}} />
            <DigitalLegacy />
            <hr style={{margin: '2rem 0'}} />
            <FinancialItems />
            <hr style={{margin: '2rem 0'}} />
            <InsuranceItems />
            <hr style={{margin: '2rem 0'}} />
            <ContractItems />

        </div>
    );
};

export default VorsorgeDashboard;

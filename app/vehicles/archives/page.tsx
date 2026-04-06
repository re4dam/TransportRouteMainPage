import GenericArchiveTable from '@/components/ArchiveTable';

export default function VehicleArchivesPage() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800">Vehicle Archives</h1>
            <p className="text-gray-600">Manage deactivated vehicles.</p>
            
            <GenericArchiveTable 
                domainName="Vehicle"
                fetchEndpoint="/Vehicle/archives"
                restoreEndpointTemplate="/Vehicle/{id}/restore"
            />
        </div>
    );
}

import GenericArchiveTable from '@/components/ArchiveTable';

export default function RouteArchivesPage() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800">Route Archives</h1>
            <p className="text-gray-600">Manage deactivated transit routes.</p>
            
            <GenericArchiveTable 
                domainName="Route"
                fetchEndpoint="/TransitRoutes/archives"
                restoreEndpointTemplate="/TransitRoutes/{id}/restore"
            />
        </div>
    );
}
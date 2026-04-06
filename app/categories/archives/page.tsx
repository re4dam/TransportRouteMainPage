import GenericArchiveTable from '@/components/ArchiveTable';

export default function CategoryArchivesPage() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800">Category Archives</h1>
            <p className="text-gray-600">Manage deactivated vehicle categories.</p>
            
            <GenericArchiveTable 
                domainName="Category"
                fetchEndpoint="/Category/archives"
                restoreEndpointTemplate="/Category/{id}/restore"
                activeEntitiesPath='categories/'
            />
        </div>
    );
}

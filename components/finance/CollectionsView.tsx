import React, { useState, useEffect, useContext } from 'react';
import { Collection, Project } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../contexts/AuthContext';
import Icon from '../common/Icon';
import CameraCaptureModal from './CameraCaptureModal';
import CollectionDetailsModal from './CollectionDetailsModal';

const CollectionsView: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [documents, setDocuments] = useState<Record<string, { name: string; type: 'file' | 'photo' }>>({});
    const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const api = useApi();
    const { hasPermission } = useContext(AuthContext)!;
    const projectMap = new Map(projects.map(p => [p.id, p.name]));
    const [isCameraOpen, setCameraOpen] = useState(false);
    
    useEffect(() => {
        Promise.all([api.getCollections(), api.getProjects()]).then(([collData, projData]) => {
            setCollections(collData);
            setProjects(projData);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, collectionId: string) => {
        if (e.target.files && e.target.files[0]) {
            console.log("File uploaded:", e.target.files[0].name);
            setDocuments(prev => ({ ...prev, [collectionId]: { name: e.target.files![0].name, type: 'file' } }));
            // In a real app, you'd upload this file and get a URL.
        }
    };
    
    const handlePhotoCapture = (dataUrl: string) => {
        if (activeCollectionId) {
            console.log("Photo captured for collection:", activeCollectionId);
            setDocuments(prev => ({ ...prev, [activeCollectionId]: { name: `photo_${new Date().toISOString()}.jpg`, type: 'photo' } }));
            // In a real app, you'd upload this data URL as a file.
        }
        setCameraOpen(false);
        setActiveCollectionId(null);
    };

    const openCamera = (collectionId: string) => {
        setActiveCollectionId(collectionId);
        setCameraOpen(true);
    };

    return (
        <>
            <div className="bg-white dark:bg-dark-bg-card rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Project</th>
                                <th className="px-6 py-3">Amount Received</th>
                                <th className="px-6 py-3">Outstanding</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Method</th>
                                <th className="px-6 py-3">Document</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map(c => (
                                <tr 
                                    key={c.id} 
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                                    onClick={() => setSelectedCollection(c)}
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{projectMap.get(c.projectId) || 'N/A'}</td>
                                    <td className="px-6 py-4">{c.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-red-500">{c.outstandingAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">{c.receivedDate}</td>
                                    <td className="px-6 py-4">{c.paymentMethod}</td>
                                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                        {documents[c.id] ? (
                                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                                <Icon name="check-circle" className="w-4 h-4" />
                                                <span className="text-xs truncate" title={documents[c.id].name}>{documents[c.id].name}</span>
                                            </div>
                                        ) : hasPermission('finance:create') ? (
                                            <div className="flex space-x-2">
                                                <label htmlFor={`upload-${c.id}`} className="cursor-pointer text-blue-500 hover:underline text-sm">Upload</label>
                                                <input id={`upload-${c.id}`} type="file" className="hidden" onChange={(e) => handleFileUpload(e, c.id)} />
                                                <button onClick={() => openCamera(c.id)} className="text-blue-500 hover:underline text-sm">Camera</button>
                                            </div>
                                        ) : <span className="text-gray-400">N/A</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setCameraOpen(false)} onCapture={handlePhotoCapture} />
            {selectedCollection && (
                <CollectionDetailsModal 
                    isOpen={!!selectedCollection}
                    onClose={() => setSelectedCollection(null)}
                    collection={selectedCollection}
                    projectName={projectMap.get(selectedCollection.projectId) || 'N/A'}
                />
            )}
        </>
    );
};

export default CollectionsView;
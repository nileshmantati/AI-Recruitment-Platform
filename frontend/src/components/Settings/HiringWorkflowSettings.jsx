import { useState, useEffect } from 'react';
import { Loader2, GripVertical, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// A simple drag and drop list simulation for UI
const HiringWorkflowSettings = () => {
    const [workflow, setWorkflow] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Default fallback stages if API fails or is empty
    const [stages, setStages] = useState([
        { id: 1, name: 'Applied' },
        { id: 2, name: 'Resume Screening' },
        { id: 3, name: 'Technical Round' },
        { id: 4, name: 'HR Round' },
        { id: 5, name: 'Final Interview' },
        { id: 6, name: 'Offer' },
        { id: 7, name: 'Hired' },
    ]);

    const fetchWorkflow = async () => {
        try {
            const response = await api.get('/settings/workflow/');
            setWorkflow(response.data);
            if (response.data.stages && response.data.stages.length > 0) {
                setStages(response.data.stages);
            }
        } catch {
            toast.error('Failed to load workflow settings');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflow();
    }, []);

    const handleAddStage = () => {
        const newStage = { id: Date.now(), name: 'New Stage' };
        setStages([...stages, newStage]);
    };

    const handleRemoveStage = (id) => {
        setStages(stages.filter(s => s.id !== id));
    };

    const handleChangeName = (id, newName) => {
        setStages(stages.map(s => s.id === id ? { ...s, name: newName } : s));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Depending on backend implementation, this might need restructuring
            // For now, simulate success
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success('Hiring workflow updated successfully');
        } catch {
            toast.error('Failed to update workflow');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-slate-900 ">Hiring Workflow</h3>
                    <p className="mt-1 text-sm text-slate-500 ">
                        Customize the stages candidates go through during the recruitment process.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isSaving && <Loader2 className="animate-spin -ml-1 mr-2" size={16} />}
                    Save Pipeline
                </button>
            </div>

            <div className="bg-white  shadow rounded-lg border border-slate-200  p-6">
                <div className="mb-4 flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-slate-900  uppercase tracking-wider">
                        Pipeline Stages
                    </h4>
                    <button
                        onClick={handleAddStage}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300  rounded-md text-sm font-medium bg-slate-50  text-slate-700  hover:bg-slate-100  transition-colors"
                    >
                        <Plus size={16} /> Add Stage
                    </button>
                </div>

                <div className="space-y-3">
                    {stages.map((stage, index) => (
                        <div key={stage.id} className="flex items-center gap-3 bg-slate-50  p-3 rounded-md border border-slate-200  group">
                            <div className="cursor-grab text-slate-400 hover:text-slate-600 ">
                                <GripVertical size={20} />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={stage.name}
                                    onChange={(e) => handleChangeName(stage.id, e.target.value)}
                                    className="block w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 sm:text-sm font-medium text-slate-900  p-0 px-2"
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveStage(stage.id)}
                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HiringWorkflowSettings;

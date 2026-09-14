import { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';


const IntegrationsSettings = () => {
    const [isLoading, setIsLoading] = useState(true);

    // Simulate integration state
    const [integrations, setIntegrations] = useState([
        { id: 'google_calendar', name: 'Google Calendar', description: 'Schedule interviews automatically.', connected: true, icon: '📅' },
        { id: 'google_meet', name: 'Google Meet', description: 'Generate meet links for interviews.', connected: false, icon: '📹' },
        { id: 'zoom', name: 'Zoom', description: 'Generate zoom links for interviews.', connected: false, icon: '🎥' },
        { id: 'slack', name: 'Slack', description: 'Get notifications in Slack channels.', connected: false, icon: '💬' },
        { id: 'linkedin', name: 'LinkedIn', description: 'Import candidates directly from LinkedIn.', connected: true, icon: '🔗' },
        { id: 'openai', name: 'OpenAI', description: 'Use GPT for resume parsing.', connected: true, icon: '🤖' },
        { id: 'stripe', name: 'Stripe', description: 'Manage billing and subscriptions.', connected: false, icon: '💳' },
    ]);

    useEffect(() => {
        // Fetch from API in real app
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    const toggleIntegration = (id) => {
        setIntegrations(integrations.map(integration => {
            if (integration.id === id) {
                const newState = !integration.connected;
                toast.success(`${integration.name} ${newState ? 'connected' : 'disconnected'}`);
                return { ...integration, connected: newState };
            }
            return integration;
        }));
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
            <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900 ">Integrations</h3>
                <p className="mt-1 text-sm text-slate-500 ">
                    Connect your workspace with third-party apps to streamline your workflow.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((integration) => (
                    <div key={integration.id} className="bg-white  shadow rounded-lg border border-slate-200  p-6 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-slate-100  flex items-center justify-center text-2xl">
                                    {integration.icon}
                                </div>
                                <div>
                                    <h4 className="text-base font-semibold text-slate-900 ">{integration.name}</h4>
                                    <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium ${integration.connected ? 'bg-green-100 text-green-800  ' : 'bg-slate-100 text-slate-800  '}`}>
                                        {integration.connected ? 'Connected' : 'Not Connected'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500  flex-1 mb-6">
                            {integration.description}
                        </p>
                        <button
                            onClick={() => toggleIntegration(integration.id)}
                            className={`w-full inline-flex justify-center items-center gap-2 px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${integration.connected
                                ? 'border-slate-300  bg-white  text-slate-700  hover:bg-slate-50 '
                                : 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {integration.connected ? (
                                <>Disconnect</>
                            ) : (
                                <><Plus size={16} /> Connect</>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IntegrationsSettings;

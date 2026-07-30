import { FileText } from 'lucide-react';

const DocumentsStep = () => {
    return (
        <div className="space-y-8 pb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-2">Company Documents</h3>
                <p className="text-slate-500 mb-6 text-sm max-w-md mx-auto">
                    Upload official documents (GST, PAN, ISO, Registration) securely from your Company Dashboard once the profile is created.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-sm font-semibold">
                    Available in Dashboard
                </div>
            </div>
        </div>
    );
};

export default DocumentsStep;

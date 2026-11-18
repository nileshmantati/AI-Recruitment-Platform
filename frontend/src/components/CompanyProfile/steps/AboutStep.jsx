import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean']
    ]
};

const AboutStep = ({ formData, setFormData }) => {
    const handleQuillChange = (field) => (val) => {
        setFormData((prev) => (prev[field] === val ? prev : { ...prev, [field]: val }));
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="space-y-1">
                <label className={labelClasses}>About Company</label>
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <ReactQuill
                        theme="snow"
                        value={formData.about || ''}
                        onChange={handleQuillChange('about')}
                        modules={quillModules}
                        className="h-48"
                    />
                </div>
            </div>

            <div className="space-y-1 mt-12 pt-4">
                <label className={labelClasses}>Mission Statement</label>
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <ReactQuill
                        theme="snow"
                        value={formData.mission || ''}
                        onChange={handleQuillChange('mission')}
                        modules={quillModules}
                        className="h-32"
                    />
                </div>
            </div>

            <div className="space-y-1 mt-12 pt-4">
                <label className={labelClasses}>Vision Statement</label>
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <ReactQuill
                        theme="snow"
                        value={formData.vision || ''}
                        onChange={handleQuillChange('vision')}
                        modules={quillModules}
                        className="h-32"
                    />
                </div>
            </div>

            <div className="space-y-1 mt-12 pt-4">
                <label className={labelClasses}>Why Join Us?</label>
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <ReactQuill
                        theme="snow"
                        value={formData.why_join_us || ''}
                        onChange={handleQuillChange('why_join_us')}
                        modules={quillModules}
                        className="h-32"
                    />
                </div>
            </div>

            {/* Adding margin bottom to make room for quill toolbar which sometimes overflows */}
            <div className="h-10"></div>
        </div>
    );
};

export default AboutStep;

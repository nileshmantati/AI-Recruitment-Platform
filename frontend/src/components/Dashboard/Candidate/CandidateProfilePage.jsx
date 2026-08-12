import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Code2, Edit3, Save, X, Plus, Trash2, Camera } from 'lucide-react';
import { T } from '../../../Js/theme';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const SectionCard = ({ title, icon: Icon, children }) => (
    <motion.div variants={fadeUp} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100" style={{ background: `${T.primary}06` }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                <Icon size={16} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base tracking-wide uppercase">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
    </motion.div>
);

const Field = ({ label, value, onChange, type = 'text', icon: Icon, placeholder, disabled }) => (
    <div>
        <label className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            {Icon && <Icon size={16} className="shrink-0 text-slate-400" />}
            <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
                className="w-full bg-transparent text-sm sm:text-base text-slate-800 outline-none placeholder:text-slate-400 disabled:text-slate-500 font-medium" />
        </div>
    </div>
);

const CandidateProfilePage = () => {
    const { auth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState({ full_name: '', email: '', phone: '', location: '', website: '', linkedin: '', bio: '', current_role: '', experience_years: '' });
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [education, setEducation] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('candidate/profile/');
                const d = res.data;
                setProfile({
                    full_name: d.full_name || auth.username || '',
                    email: d.email || '',
                    phone: d.phone || '',
                    location: d.location || '',
                    website: d.website || '',
                    linkedin: d.linkedin || '',
                    bio: d.bio || '',
                    current_role: d.current_role || '',
                    experience_years: d.experience_years || ''
                });
                setSkills(d.skills || []);
                setEducation(d.education || []);
            } catch {
                setProfile(p => ({ ...p, full_name: auth.username || '', email: auth.email || '' }));
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [auth]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('candidate/profile/', { ...profile, skills, education });
            toast.success('Profile updated!');
            setEditMode(false);
        } catch {
            toast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => { const s = newSkill.trim(); if (s && !skills.includes(s)) { setSkills(p => [...p, s]); setNewSkill(''); } };
    const removeSkill = (i) => setSkills(p => p.filter((_, idx) => idx !== i));
    const addEducation = () => setEducation(p => [...p, { degree: '', institution: '', year: '' }]);
    const updateEdu = (i, f, v) => setEducation(p => p.map((e, idx) => idx === i ? { ...e, [f]: v } : e));
    const removeEdu = (i) => setEducation(p => p.filter((_, idx) => idx !== i));

    const initials = (profile.full_name || auth.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Loading Profile data...</h4>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.main variants={container} initial="hidden" animate="show"
            className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">My Profile</h1>
                    <p className="mt-1 text-sm sm:text-base text-slate-500">Manage your personal information and career details</p>
                </div>
                <div className="flex gap-2">
                    {editMode ? (
                        <>
                            <button onClick={() => setEditMode(false)} className="flex items-center gap-2 !rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm sm:text-base font-semibold text-slate-600 hover:bg-slate-50 transition">
                                <X size={16} /> Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 !rounded-xl px-5 py-2 text-sm sm:text-base font-bold text-white shadow-md transition hover:scale-95 disabled:opacity-60"
                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 !rounded-xl px-5 py-2 text-sm sm:text-base font-bold text-white shadow-md transition hover:scale-95"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                            <Edit3 size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Avatar hero */}
            <motion.div variants={fadeUp} className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${T.primary}08, ${T.accent}08)` }} />
                <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl text-white text-3xl font-extrabold shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>{initials}</div>
                    {editMode && (
                        <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition">
                            <Camera size={14} className="text-slate-500" />
                        </button>
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{profile.full_name || auth.username}</h2>
                    <p className="text-sm sm:text-base font-medium text-slate-600 mt-0.5">{profile.current_role || 'Add your current role'}</p>
                    <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                        {profile.location && <span className="flex items-center gap-1"><MapPin size={13} />{profile.location}</span>}
                        {profile.experience_years && <span className="flex items-center gap-1"><Briefcase size={13} />{profile.experience_years} yrs exp</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5">
                        {skills.slice(0, 5).map((s, i) => (
                            <span key={i} className="rounded-lg px-2.5 py-1 text-xs sm:text-sm font-semibold" style={{ background: `${T.primary}12`, color: T.primary }}>{s}</span>
                        ))}
                        {skills.length > 5 && <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs sm:text-sm font-semibold text-slate-500">+{skills.length - 5}</span>}
                    </div>
                </div>
            </motion.div>

            {/* Personal Info */}
            <SectionCard title="Personal Information" icon={User}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Full Name" value={profile.full_name} icon={User} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" disabled={!editMode} />
                    <Field label="Email" value={profile.email} icon={Mail} type="email" onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" disabled={!editMode} />
                    <Field label="Phone" value={profile.phone} icon={Phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" disabled={!editMode} />
                    <Field label="Location" value={profile.location} icon={MapPin} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="Mumbai, India" disabled={!editMode} />
                    <Field label="Current Role" value={profile.current_role} icon={Briefcase} onChange={e => setProfile(p => ({ ...p, current_role: e.target.value }))} placeholder="Software Engineer" disabled={!editMode} />
                    <Field label="Experience (Years)" value={profile.experience_years} onChange={e => setProfile(p => ({ ...p, experience_years: e.target.value }))} placeholder="3" disabled={!editMode} />
                </div>
                <div className="mt-4">
                    <label className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">Bio</label>
                    <textarea rows={3} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} disabled={!editMode}
                        placeholder="A short description about yourself..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm sm:text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all disabled:text-slate-500 resize-none font-medium" />
                </div>
            </SectionCard>

            {/* Social */}
            <SectionCard title="Social Links" icon={Globe}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Website" value={profile.website} icon={Globe} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" disabled={!editMode} />
                    <Field label="LinkedIn" value={profile.linkedin} onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/you" disabled={!editMode} />
                </div>
            </SectionCard>

            {/* Skills */}
            <SectionCard title="Skills" icon={Code2}>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm sm:text-base font-semibold" style={{ background: `${T.primary}12`, color: T.primary }}>
                            {skill}
                            {editMode && <button onClick={() => removeSkill(i)} className="hover:text-red-500 transition ml-0.5"><X size={13} /></button>}
                        </div>
                    ))}
                    {skills.length === 0 && !editMode && <p className="text-sm sm:text-base text-slate-500">No skills added yet.</p>}
                </div>
                {editMode && (
                    <div className="mt-4 flex gap-2">
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                            <Code2 size={16} className="text-slate-400" />
                            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Add a skill (e.g. React)" className="w-full bg-transparent text-sm sm:text-base outline-none text-slate-800 font-medium" />
                        </div>
                        <button onClick={addSkill} className="flex items-center !rounded-xl px-4 py-2.5 text-sm sm:text-base font-bold text-white transition hover:scale-95"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}><Plus size={18} /></button>
                    </div>
                )}
            </SectionCard>

            {/* Education */}
            <SectionCard title="Education" icon={GraduationCap}>
                <div className="space-y-4">
                    {education.map((edu, i) => (
                        <div key={i} className="relative rounded-xl border border-slate-100 bg-slate-50 p-4">
                            {editMode && (
                                <button onClick={() => removeEdu(i)} className="absolute right-3 top-3 text-slate-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                            )}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <Field label="Degree" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="B.Tech Computer Science" disabled={!editMode} />
                                <Field label="Institution" value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} placeholder="IIT Bombay" disabled={!editMode} />
                                <Field label="Year" value={edu.year} onChange={e => updateEdu(i, 'year', e.target.value)} placeholder="2022" disabled={!editMode} />
                            </div>
                        </div>
                    ))}
                    {education.length === 0 && !editMode && <p className="text-sm sm:text-base text-slate-500">No education details added yet.</p>}
                    {editMode && (
                        <button onClick={addEducation} className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 text-sm sm:text-base font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all w-full justify-center">
                            <Plus size={16} /> Add Education
                        </button>
                    )}
                </div>
            </SectionCard>
        </motion.main>
    );
};

export default CandidateProfilePage;

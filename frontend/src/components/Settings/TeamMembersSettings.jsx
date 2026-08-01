import { useState, useEffect } from 'react';
import { Users, UserPlus, MoreVertical, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const TeamMembersSettings = () => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);const fetchMembers = async () => {
        try {
            const response = await api.get('/settings/team/');
            setMembers(response.data);
        } catch (error) {
            toast.error('Failed to load team members');
        } finally {
            setIsLoading(false);
        }
    };

    

    useEffect(() => {
        fetchMembers();
    }, []);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'OWNER': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'RECRUITER': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'HIRING_MANAGER': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'INTERVIEWER': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-slate-900 ">Team Members</h3>
                    <p className="mt-1 text-sm text-slate-500 ">
                        Manage who has access to your company workspace and their roles.
                    </p>
                </div>
                <button
                    onClick={() => toast('Invite feature coming soon!', { icon: '👏' })}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    <UserPlus size={16} />
                    Invite Member
                </button>
            </div>

            <div className="bg-white  shadow rounded-lg border border-slate-200  overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 ">
                        <thead className="bg-slate-50 ">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                                    Role
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                                    Joined Date
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white  divide-y divide-slate-200 ">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 ">
                                        <Users className="mx-auto h-12 w-12 text-slate-300  mb-3" />
                                        <p>No team members found.</p>
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50  transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200  flex items-center justify-center font-bold text-slate-600 ">
                                                    {(member.username || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900 ">
                                                        {member.username}
                                                    </div>
                                                    <div className="text-sm text-slate-500 ">
                                                        {member.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)}`}>
                                                {member.role === 'OWNER' && <Shield size={12} className="mr-1" />}
                                                {(member.role || 'USER').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.is_active ? 'bg-green-100 text-green-800  ' : 'bg-red-100 text-red-800  '}`}>
                                                {member.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 ">
                                            {new Date(member.joined_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-slate-400 hover:text-slate-600 ">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamMembersSettings;

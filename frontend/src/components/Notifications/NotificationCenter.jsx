import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCheck,
    CheckCircle2,
    Calendar,
    Award,
    XCircle,
    X,
    FileText,
    Sparkles,
    AlertCircle,
    Loader2
} from 'lucide-react';
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../../services/api';
import { T } from '../../Js/theme';

const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay === 1) return 'Yesterday';
        if (diffDay < 7) return `${diffDay}d ago`;

        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return '';
    }
};

const getEventVisuals = (eventType) => {
    switch (eventType) {
        case 'APPLICATION_SUBMITTED':
            return {
                icon: CheckCircle2,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 border-emerald-200'
            };
        case 'NEW_APPLICATION':
            return {
                icon: FileText,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50 border-indigo-200'
            };
        case 'APPLICATION_SHORTLISTED':
            return {
                icon: Award,
                color: 'text-amber-600',
                bg: 'bg-amber-50 border-amber-200'
            };
        case 'APPLICATION_REJECTED':
            return {
                icon: XCircle,
                color: 'text-rose-600',
                bg: 'bg-rose-50 border-rose-200'
            };
        case 'INTERVIEW_SCHEDULED':
        case 'INTERVIEW_RESCHEDULED':
            return {
                icon: Calendar,
                color: 'text-purple-600',
                bg: 'bg-purple-50 border-purple-200'
            };
        default:
            return {
                icon: Sparkles,
                color: 'text-blue-600',
                bg: 'bg-blue-50 border-blue-200'
            };
    }
};

const NotificationCenter = ({ role = '', className = '' }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextPage, setNextPage] = useState(1);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread'

    const containerRef = useRef(null);
    const isFetchingCountRef = useRef(false);

    // Fetch unread count lightweight
    const fetchUnreadCount = useCallback(async () => {
        if (isFetchingCountRef.current) return;
        isFetchingCountRef.current = true;
        try {
            const data = await getUnreadNotificationCount();
            if (typeof data?.unread_count === 'number') {
                setUnreadCount(data.unread_count);
            }
        } catch {
            // Silently ignore polling errors to avoid disrupting user experience
        } finally {
            isFetchingCountRef.current = false;
        }
    }, []);

    // Fetch notifications list
    const fetchNotificationList = useCallback(async (page = 1, append = false, unreadOnly = false) => {
        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
            setError(null);
        }

        try {
            const data = await getNotifications({ page, unreadOnly });
            const results = data.results || data || [];
            setNotifications(prev => append ? [...prev, ...results] : results);
            setHasMore(Boolean(data.next));
            setNextPage(page + 1);
        } catch (err) {
            setError('Could not load notifications. Please try again.');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    // Set up polling (every 30 seconds) and tab visibility listeners
    useEffect(() => {
        fetchUnreadCount();

        const pollInterval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchUnreadCount();
                if (isOpen) {
                    fetchNotificationList(1, false, filter === 'unread');
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(pollInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchUnreadCount, isOpen, filter, fetchNotificationList]);

    // Handle outside clicks to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // When dropdown opens, fetch the list
    const handleToggleOpen = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            fetchNotificationList(1, false, filter === 'unread');
            fetchUnreadCount();
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        fetchNotificationList(1, false, newFilter === 'unread');
    };

    // Mark single notification as read
    const handleMarkSingleAsRead = async (notification, e) => {
        if (e) e.stopPropagation();
        if (notification.is_read) return;

        // Optimistic UI update
        setNotifications(prev =>
            prev.map(item => item.id === notification.id ? { ...item, is_read: true } : item)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await markNotificationAsRead(notification.id);
        } catch {
            // Revert if API fails
            fetchUnreadCount();
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0 || isMarkingAll) return;
        setIsMarkingAll(true);

        // Optimistic UI update
        setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
        setUnreadCount(0);

        try {
            await markAllNotificationsAsRead();
        } catch {
            fetchUnreadCount();
            fetchNotificationList(1, false, filter === 'unread');
        } finally {
            setIsMarkingAll(false);
        }
    };

    // Click on notification item -> Mark as read and Navigate
    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            handleMarkSingleAsRead(notification);
        }

        setIsOpen(false);

        // Routing based on event type & role
        const isInterviewEvent =
            notification.event_type === 'INTERVIEW_SCHEDULED' ||
            notification.event_type === 'INTERVIEW_RESCHEDULED';

        if (isInterviewEvent) {
            navigate('/dashboard/interviews');
        } else if (notification.target_type === 'APPLICATION' || notification.event_type.includes('APPLICATION')) {
            navigate('/dashboard/applications');
        }
    };

    // Badge formatting: max 99+
    const displayBadgeCount = unreadCount > 99 ? '99+' : unreadCount;

    return (
        <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
            {/* Notification Bell Button */}
            <button
                type="button"
                onClick={handleToggleOpen}
                aria-label={`Notifications (${unreadCount} unread)`}
                aria-expanded={isOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95"
            >
                <Bell size={18} className="transition-transform duration-200 hover:rotate-6" />

                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white shadow-sm transition-transform animate-in zoom-in-50"
                        style={{ background: `linear-gradient(135deg, ${T.danger}, #dc2626)` }}
                    >
                        {displayBadgeCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown Panel */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-[340px] max-w-[92vw] sm:w-[390px] origin-top-right rounded-2xl border border-slate-200/90 bg-white shadow-2xl z-50 overflow-hidden ring-1 ring-black/10"
                    role="dialog"
                    aria-label="Notification list"
                >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 border border-indigo-100">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                disabled={unreadCount === 0 || isMarkingAll}
                                title="Mark all as read"
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600"
                            >
                                {isMarkingAll ? (
                                    <Loader2 size={13} className="animate-spin text-indigo-600" />
                                ) : (
                                    <CheckCheck size={14} />
                                )}
                                <span className="hidden sm:inline">Mark all read</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                aria-label="Close panel"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex border-b border-slate-100 bg-slate-50/60 px-4 pt-1 gap-4 text-xs font-medium">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('all')}
                            className={`pb-2 transition-colors border-b-2 ${filter === 'all'
                                ? 'border-indigo-600 text-indigo-600 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('unread')}
                            className={`pb-2 transition-colors border-b-2 ${filter === 'unread'
                                ? 'border-indigo-600 text-indigo-600 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                                <Loader2 size={24} className="animate-spin text-indigo-600" />
                                <span className="text-xs">Loading notifications...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                <AlertCircle size={28} className="text-rose-500 mb-2" />
                                <p className="text-xs text-slate-600 mb-3">{error}</p>
                                <button
                                    type="button"
                                    onClick={() => fetchNotificationList(1, false, filter === 'unread')}
                                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <Bell size={22} />
                                </div>
                                <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {filter === 'unread'
                                        ? "You've caught up with all your unread notifications."
                                        : "We'll notify you when an application, interview, or candidate status updates."}
                                </p>
                            </div>
                        ) : (
                            notifications.map((item) => {
                                const visual = getEventVisuals(item.event_type);
                                const IconComponent = visual.icon;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${item.is_read
                                            ? 'bg-white hover:bg-slate-50/80'
                                            : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                                            }`}
                                    >
                                        {/* Event Icon */}
                                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${visual.bg} ${visual.color}`}>
                                            <IconComponent size={17} />
                                        </div>

                                        {/* Notification Text */}
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <h4 className={`text-xs truncate ${item.is_read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>
                                                    {item.title || 'Notification'}
                                                </h4>
                                                <span className="shrink-0 text-[10px] text-slate-400">
                                                    {formatRelativeTime(item.created_at)}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                {item.message}
                                            </p>
                                        </div>

                                        {/* Status / Mark As Read Pill */}
                                        <div className="shrink-0 flex items-center pt-1">
                                            {!item.is_read ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleMarkSingleAsRead(item, e)}
                                                    title="Mark as read"
                                                    className="h-2.5 w-2.5 rounded-full bg-indigo-600 hover:scale-125 transition-transform"
                                                    aria-label="Mark as read"
                                                />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-transparent" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Panel Footer / Load More */}
                    {hasMore && !isLoading && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-2 text-center">
                            <button
                                type="button"
                                onClick={() => fetchNotificationList(nextPage, true, filter === 'unread')}
                                disabled={isLoadingMore}
                                className="w-full rounded-lg py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                            >
                                {isLoadingMore ? 'Loading older...' : 'Load more notifications'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;

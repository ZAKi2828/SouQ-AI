'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { insforge } from '@/lib/insforge';
import SOUQAILoader from '@/components/SOUQAILoader';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';
import { hasPermission } from '@/lib/rbac';

const AVATAR_STYLES = [
  { emoji: '', bg: 'bg-emerald-50' },
  { emoji: '', bg: 'bg-purple-50' },
  { emoji: '', bg: 'bg-green-50' },
  { emoji: '', bg: 'bg-teal-50' },
  { emoji: '', bg: 'bg-lime-50' },
  { emoji: '', bg: 'bg-blue-50' },
  { emoji: '', bg: 'bg-amber-50' },
  { emoji: '', bg: 'bg-red-50' },
];

export default function TeamManagement() {
    const { t, lang } = useI18n();
    const { planExpired, currentPlan: guardPlan } = useExpiredPlanGuard();

    const ROLE_CONFIG: Record<string, { label: string; en: string; bg: string; text: string }> = {
      owner: { label: t('t_2f17881'), en: 'Owner', bg: 'bg-[#E91E63]/10', text: 'text-[#E91E63]' },
      manager: { label: t('t_2f19731'), en: 'Manager', bg: 'bg-purple-50', text: 'text-purple-600' },
      editor: { label: t('t_2f18ca8'), en: 'Editor', bg: 'bg-emerald-50', text: 'text-emerald-600' },
      viewer: { label: t('t_5b431a40'), en: 'Viewer', bg: 'bg-teal-50', text: 'text-teal-600' },
    };

    const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
      active: { label: t('t_185349'), dot: 'bg-emerald-500', text: 'text-emerald-600' },
      pending: { label: t('t_11cfb700'), dot: 'bg-amber-500 animate-pulse', text: 'text-amber-600' },
      inactive: { label: t('t_744daf8a'), dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-400' },
    };

    const PERMISSIONS = [
      { name: t('t_28dc53ec'), owner: true, manager: true, editor: true, viewer: false },
      { name: t('t_709957ad'), owner: true, manager: true, editor: true, viewer: true },
      { name: t('t_252da8382'), owner: true, manager: false, editor: false, viewer: false },
      { name: t('t_8cd9bcfe'), owner: true, manager: true, editor: false, viewer: false },
    ];
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPlan, setUserPlan] = useState('free');
  const [teamLimit, setTeamLimit] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // Edit role modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);
  const [editRole, setEditRole] = useState('');

  // Action menu
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Success/Error messages
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type: string = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch team members
  useEffect(() => {
    async function fetchTeam() {
      try {
        const ctx = await getStoreContext();
        if (!ctx) { router.push('/login'); return; }

        // RBAC: Only owners can manage team
        if (!hasPermission(ctx.role, 'manage_team')) {
          router.push('/merchant');
          return;
        }

        // Fetch store context to get store name and user details
        const uid = ctx.targetUserId;
        const email = ctx.email;
        setUserId(uid);
        setUserEmail(email);
        setStoreName(ctx.storeName || t('t_3bd8f1f7'));

        const { data: profile } = await insforge.database
          .from('profiles')
          .select('plan, is_paid, full_name')
          .eq('id', uid)
          .single();
        
        setOwnerName(profile?.full_name || email?.split('@')[0] || t('t_dadd95ae'));

        let p = 'free';
        if (profile?.plan === 'vip' || profile?.plan === t('t_15187dfac')) p = 'vip';
        else if (profile?.plan === 'pro' || profile?.plan === t('t_74dcec9f') || profile?.is_paid) p = 'pro';
        setUserPlan(p);

        const { data: settings } = await insforge.database
          .from('platform_settings')
          .select('app_plans')
          .eq('id', 1)
          .single();
        
        const limit = settings?.app_plans?.team_limit?.[p] ?? (p === 'vip' ? 10 : p === 'pro' ? 3 : 1);
        setTeamLimit(limit);

        const { data, error } = await insforge.database
          .from('team_members')
          .select('*')
          .eq('store_owner_id', uid)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMembers(data);
        }

        // If no members exist, auto-add the owner
        if (!error && (!data || data.length === 0)) {
          const { data: ownerData, error: ownerErr } = await insforge.database
            .from('team_members')
            .insert({
              store_owner_id: uid,
              member_email: email,
              member_name: t('t_1a6ebf43a'),
              role: 'owner',
              status: 'active',
              last_active: new Date().toISOString(),
            })
            .select()
            .single();
          if (!ownerErr && ownerData) {
            setMembers([ownerData]);
          }
        }
      } catch (err) {
        console.error('Failed to load team', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [router]);

  // Invite member
  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);

    // ✅ حفظ القيم في متغيرات محلية قبل أي setState
    const finalEmail   = inviteEmail.trim().toLowerCase();
    const finalName    = inviteName.trim() || inviteEmail.split('@')[0];
    const finalRole    = inviteRole;
    const finalMessage = inviteMessage.trim() || null;

    try {
      // Check limits
      if (members.length >= teamLimit) {
        showToast(`لقد وصلت للحد الأقصى لعدد العاملين المسموح به في باقتك (${teamLimit}). يرجى ترقية الباقة لإضافة المزيد`, 'error');
        setInviting(false);
        return;
      }

      // Check duplicate
      const exists = members.find(m => m.member_email.toLowerCase() === finalEmail);
      if (exists) {
        showToast(t('t_113f8e7a7'), 'error');
        setInviting(false);
        return;
      }

      const { data, error } = await insforge.database
        .from('team_members')
        .insert({
          store_owner_id: userId,
          member_email: finalEmail,
          member_name: finalName,
          role: finalRole,
          status: 'pending',
          invite_message: finalMessage,
        })
        .select()
        .single();

      if (!error && data) {
        setMembers(prev => [...prev, data]);
        // ✅ تصفير الـ state بعد حفظ القيم
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteName('');
        setInviteRole('editor');
        setInviteMessage('');

        // Send Email Invitation seamlessly
        try {
          const emailResponse = await fetch('/api/emails/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memberEmail: finalEmail,
              memberName: finalName,
              role: finalRole,
              ownerName: ownerName,
              storeName: storeName,
              inviteMessage: finalMessage,
            }),
          });
          
          if (emailResponse.ok) {
            showToast(t('t_5673186b'));
          } else {
            showToast(t('t_13d1cb51'), 'warning');
          }
        } catch (emailErr) {
          console.error('Failed to send email:', emailErr);
          showToast(t('t_114a095b'), 'warning');
        }

      } else {
        const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
        console.error("DB Insert Error explicitly printed:", errorString);
        alert(`فشل الإضافة! الخطأ: ${error?.message || errorString}`);
        showToast(error?.message ? `فشل: ${error?.message}` : t('t_20949ca1'), 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(t('t_9634eda3'), 'error');
    } finally {
      setInviting(false);
    }
  };

  // Update role
  const handleUpdateRole = async () => {
    if (!editMember || !editRole) return;
    try {
      const { error } = await insforge.database
        .from('team_members')
        .update({ role: editRole })
        .eq('id', editMember.id);

      if (!error) {
        setMembers(prev => prev.map(m => m.id === editMember.id ? { ...m, role: editRole } : m));
        setShowEditModal(false);
        setEditMember(null);
        showToast(t('t_b294640f'));
      } else {
        showToast(t('t_c96c7340'), 'error');
      }
    } catch (err) { showToast(t('t_9634eda3'), 'error'); }
  };

  // Remove member
  const handleRemoveMember = async (member: any) => {
    if (member.role === 'owner') return;
    if (!confirm(`هل أنت متأكد من إزالة ${member.member_name} من الفريق؟`)) return;
    try {
      const { error } = await insforge.database
        .from('team_members')
        .delete()
        .eq('id', member.id);

      if (!error) {
        setMembers(prev => prev.filter(m => m.id !== member.id));
        showToast(t('t_899c28e4'));
      } else {
        showToast(t('t_167ab93bb'), 'error');
      }
    } catch (err) { showToast(t('t_9634eda3'), 'error'); }
    setShowActionMenu(null);
  };

  // Toggle status (active/inactive)
  const handleToggleStatus = async (member: any) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await insforge.database
        .from('team_members')
        .update({ status: newStatus, last_active: newStatus === 'active' ? new Date().toISOString() : member.last_active })
        .eq('id', member.id);

      if (!error) {
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
        showToast(newStatus === 'active' ? t('t_a042238d') : t('t_3fbc4dcb'));
      }
    } catch (err) { console.error(err); }
    setShowActionMenu(null);
  };

  // Accept pending
  const handleAcceptMember = async (member: any) => {
    try {
      const { error } = await insforge.database
        .from('team_members')
        .update({ status: 'active', last_active: new Date().toISOString() })
        .eq('id', member.id);

      if (!error) {
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: 'active' } : m));
        showToast(t('t_1358bd798'));
      }
    } catch (err) { console.error(err); }
    setShowActionMenu(null);
  };

  // Filtered + stats
  const filteredMembers = members.filter(m =>
    (m.member_name || '').includes(searchQuery) || (m.member_email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    pending: members.filter(m => m.status === 'pending').length,
    roles: new Set(members.map(m => m.role)).size,
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Intl.DateTimeFormat('ar-DZ', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d));
  };

  const getAvatar = (i: number) => AVATAR_STYLES[i % AVATAR_STYLES.length];

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Sidebar activePage="Team" />
        <main className="flex-1 flex items-center justify-center pt-16 md:pt-0"><SOUQAILoader size="md" text={t('t_19a2615bb')} /></main>
      </div>
    );
  }

  return (
    <>
    {planExpired && (
        <PlanExpiredOverlay planName={guardPlan === 'pro' ? 'خطة التاجر' : guardPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
    )}
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar activePage="Team" />

      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar pt-16 md:pt-0" onClick={() => setShowActionMenu(null)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 space-y-6">

          {/* ═══════════ TOAST ═══════════ */}
          {toast && (
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl text-[14px] font-bold animate-bounce ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
              {toast.msg}
            </div>
          )}

          {/* ═══════════ HEADER ═══════════ */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E91E63]/10 flex items-center justify-center text-[#E91E63]">
                <span className="material-symbols-outlined text-[26px]">groups</span>
              </div>
              <div>
                <h1 className="text-[24px] font-black text-[#111827] dark:text-white">{t('t_b9faaf50')}</h1>
                <p className="text-[13px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{t('t_2b8d23a16')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StoreLinkButton />
              <NotificationsDropdown />
              <button onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-6 h-11 rounded-xl bg-[#E91E63] text-white text-[14px] font-bold hover:bg-[#C2185B] transition-all shadow-lg shadow-[#E91E63]/20">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                
                {t('t_cdbd652')}
              </button>
            </div>
          </div>

          {/* ═══════════ STATS ═══════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('t_14217aaf4'), value: stats.total, icon: 'group', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
              { label: t('t_7dc954c5'), value: stats.active, icon: 'person', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
              { label: t('t_11cfb700'), value: stats.pending, icon: 'hourglass_top', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
              { label: t('t_ed2384cc'), value: stats.roles, icon: 'shield_person', iconBg: 'bg-[#E91E63]/10', iconColor: 'text-[#E91E63]' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-5 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{s.label}</span>
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center ${s.iconColor}`}>
                    <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                  </div>
                </div>
                <h3 className="text-[28px] font-black text-[#111827] dark:text-white">{s.value}</h3>
              </div>
            ))}
          </div>

          {/* ═══════════ TEAM TABLE ═══════════ */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm ">
            <div className="p-5 md:p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-stretch gap-4">
              <div className="relative w-full md:w-[320px]">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 h-11 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-[14px] font-medium focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63] placeholder:text-gray-400"
                  placeholder={t('t_ab08405f')} type="text" />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-all">
                  <span className="material-symbols-outlined text-[18px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">filter_list</span>
                  
                  {t('t_59c775f5')}
                </button>
                <button className="flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-all">
                  <span className="material-symbols-outlined text-[18px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">swap_vert</span>
                  
                  {t('t_59c54e21')}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800/30">
                    <th className="py-3 px-5 font-bold">{t('t_59a3e0ae')}</th>
                    <th className="py-3 px-3 font-bold">{t('t_11f05e453')}</th>
                    <th className="py-3 px-3 font-bold text-center">{t('t_59a3bd3b')}</th>
                    <th className="py-3 px-3 font-bold text-center">{t('t_252d7204')}</th>
                    <th className="py-3 px-3 font-bold text-center">{t('t_bf5898cf')}</th>
                    <th className="py-3 px-3 font-bold text-center">{t('t_fcda610a')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr><td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-[48px] text-gray-300">group_off</span>
                        <p className="text-[15px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_676bceec')}</p>
                        <button onClick={() => setShowInviteModal(true)} className="text-[13px] font-bold text-[#E91E63] hover:underline">{t('t_19f901ce3')}</button>
                      </div>
                    </td></tr>
                  ) : filteredMembers.map((member, idx) => {
                    const role = ROLE_CONFIG[member.role] || ROLE_CONFIG.viewer;
                    const status = STATUS_CONFIG[member.status] || STATUS_CONFIG.pending;
                    const av = getAvatar(idx);
                    return (
                      <tr key={member.id} className="group border-b border-gray-50 dark:border-zinc-800/30 transition-colors">
                        <td className="py-4 px-5 group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-800/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${av.bg} flex items-center justify-center text-[18px] flex-shrink-0`}>
                              {av.emoji}
                            </div>
                            <span className="text-[14px] font-black text-[#111827] dark:text-white">{member.member_name || member.member_email.split('@')[0]}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-800/20 transition-colors">
                          <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400" dir="ltr">{member.member_email}</span>
                        </td>
                        <td className="py-4 px-3 text-center group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-800/20 transition-colors">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold ${role.bg} ${role.text}`}>
                            {role.label} ({role.en})
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-800/20 transition-colors">
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                            <span className={`text-[12px] font-bold ${status.text}`}>{status.label}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-800/20 transition-colors">
                          <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{formatDate(member.created_at)}</span>
                        </td>
                        <td className="py-4 px-3 text-center relative group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-800/20 transition-colors">
                          <button onClick={(e) => { e.stopPropagation(); setShowActionMenu(showActionMenu === member.id ? null : member.id); }}
                            className="text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 hover:text-[#111827] dark:text-white transition-colors text-[20px] font-black">
                            ···
                          </button>
                          {showActionMenu === member.id && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800/30 z-50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                              {member.status === 'pending' && (
                                <button onClick={() => handleAcceptMember(member)}
                                  className="w-full flex items-center gap-2 px-4 py-3 text-[13px] font-bold text-emerald-600 hover:bg-emerald-50">
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                  
                                  {t('t_5f2ad50')}
                                </button>
                              )}
                              <button onClick={() => { setEditMember(member); setEditRole(member.role); setShowEditModal(true); setShowActionMenu(null); }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-[13px] font-bold text-[#111827] dark:text-white hover:bg-gray-50 dark:bg-zinc-900/50">
                                <span className="material-symbols-outlined text-[16px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">edit</span>
                                
                                {t('t_acf7195')}
                              </button>
                              {member.role !== 'owner' && (
                                <>
                                  <button onClick={() => handleToggleStatus(member)}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-[13px] font-bold text-amber-600 hover:bg-amber-50">
                                    <span className="material-symbols-outlined text-[16px]">{member.status === 'active' ? 'pause_circle' : 'play_circle'}</span>
                                    {member.status === 'active' ? t('t_acf30d10') : t('t_57d083ad')}
                                  </button>
                                  <button onClick={() => handleRemoveMember(member)}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50">
                                    <span className="material-symbols-outlined text-[16px]">person_remove</span>
                                    
                                    {t('t_cea33a4d')}
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════ PERMISSIONS MATRIX ═══════════ */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-[18px] font-black text-[#111827] dark:text-white mb-1">{t('t_2c016db55')}</h3>
              <p className="text-[13px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{t('t_1096299bd')}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b-2 border-gray-100 dark:border-zinc-800/30">
                    <th className="py-3 px-4 text-[14px] font-black text-[#111827] dark:text-white">{t('t_8065e90f')}</th>
                    <th className="py-3 px-4 text-[14px] font-black text-[#E91E63] text-center">{t('t_25228902')}</th>
                    <th className="py-3 px-4 text-[14px] font-black text-purple-600 text-center">{t('t_25226a52')}</th>
                    <th className="py-3 px-4 text-[14px] font-black text-emerald-600 text-center">{t('t_252274db')}</th>
                    <th className="py-3 px-4 text-[14px] font-black text-teal-600 text-center">{t('t_80d6eb63')}</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((perm, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-4 px-4 text-[14px] font-bold text-[#111827] dark:text-white">{perm.name}</td>
                      {(['owner', 'manager', 'editor', 'viewer'] as const).map(r => (
                        <td key={r} className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${perm[r] ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-400'}`}>
                            <span className="material-symbols-outlined text-[18px]">{perm[r] ? 'check_circle' : 'cancel'}</span>
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ═══════════ INVITE MODAL ═══════════ */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-[520px] mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-[#E91E63]">person_add</span>
                <h3 className="text-[17px] font-black text-[#111827] dark:text-white">{t('t_cdbd652')}</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[#6B7280] dark:text-gray-400 hover:bg-gray-200">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[13px] font-bold text-[#111827] dark:text-white mb-2 block">{t('t_1751e1f9d')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pr-10 pl-4 h-11 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-[14px] focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63]"
                    placeholder="example@team.dz" type="email" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-[#111827] dark:text-white mb-2 block">{t('t_5e2e1581')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </div>
                  <input value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                    className="w-full pr-10 pl-4 h-11 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-[14px] focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63]"
                    placeholder={t('t_61a08ca7')} type="text" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-[#111827] dark:text-white mb-3 block">{t('t_59a3bd3b')}</label>
                <div className="space-y-2">
                  {[
                    { value: 'manager', label: t('t_2f19731'), desc: t('t_2e118bea0'), icon: 'admin_panel_settings', color: 'purple' },
                    { value: 'editor', label: t('t_2f18ca8'), desc: t('t_23922e91'), icon: 'edit', color: 'blue' },
                    { value: 'viewer', label: t('t_5b431a40'), desc: t('t_189aeca26'), icon: 'visibility', color: 'gray' },
                  ].map(r => (
                    <button key={r.value} onClick={() => setInviteRole(r.value)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right ${inviteRole === r.value ? 'border-[#E91E63] bg-[#E91E63]/5' : 'border-gray-100 dark:border-zinc-800/30 hover:border-gray-200 dark:border-zinc-800'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.color === 'purple' ? 'bg-purple-50 text-purple-500' :
                        r.color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-500 dark:text-gray-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[14px] font-bold text-[#111827] dark:text-white">{r.label}</h4>
                        <p className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{r.desc}</p>
                      </div>
                      {inviteRole === r.value && <span className="material-symbols-outlined text-[20px] text-[#E91E63]">check_circle</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-[#111827] dark:text-white mb-2 block">{t('t_94ceeaaa')}</label>
                <textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-[14px] focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63] resize-none h-[80px]"
                  placeholder={t('t_b780bd04')} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-zinc-800/30">
              <button onClick={() => setShowInviteModal(false)}
                className="px-6 h-10 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#6B7280] dark:text-gray-400 text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50">
                
                {t('t_5987b375')}
              </button>
              <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
                className="flex items-center gap-2 px-6 h-10 rounded-xl bg-[#E91E63] text-white text-[13px] font-bold hover:bg-[#C2185B] disabled:opacity-50 transition-all">
                {inviting ? <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[16px]">mail</span>}
                {inviting ? t('t_95163c53') : t('t_cbb1f8a7')}
              </button>
            </div>
            <div className="px-6 pb-5 flex items-center gap-2 text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500">
              <span className="material-symbols-outlined text-[14px]">info</span>
              سيصل للعامل بريد إلكتروني يحتوي على رابط تسجيل الدخول وتفاصيل دوره
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ EDIT ROLE MODAL ═══════════ */}
      {showEditModal && editMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-[440px] mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800/30">
              <h3 className="text-[17px] font-black text-[#111827] dark:text-white">{t('t_7a86fdce')} {editMember.member_name}</h3>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[#6B7280] dark:text-gray-400 hover:bg-gray-200">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-2">
              {[
                { value: 'manager', label: t('t_12062bcb') },
                { value: 'editor', label: t('t_113544874') },
                { value: 'viewer', label: t('t_69fef8ef') },
              ].map(r => (
                <button key={r.value} onClick={() => setEditRole(r.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-[14px] font-bold transition-all ${editRole === r.value ? 'border-[#E91E63] bg-[#E91E63]/5 text-[#E91E63]' : 'border-gray-100 dark:border-zinc-800/30 text-[#111827] dark:text-white hover:border-gray-200 dark:border-zinc-800'}`}>
                  {r.label}
                  {editRole === r.value && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-zinc-800/30">
              <button onClick={() => setShowEditModal(false)} className="px-6 h-10 rounded-xl border border-gray-200 dark:border-zinc-800 text-[#6B7280] dark:text-gray-400 text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50">{t('t_5987b375')}</button>
              <button onClick={handleUpdateRole} className="px-6 h-10 rounded-xl bg-[#E91E63] text-white text-[13px] font-bold hover:bg-[#C2185B]">{t('t_333adbff')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

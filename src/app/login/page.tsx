'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { useI18n } from "@/context/I18nContext";

export default function LoginPage() {
    const { t } = useI18n();
    const router = useRouter();
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password' | 'verify_email' | 'reset_password_code' | 'reset_password_new'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const handlePhoneChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        setPhone(digitsOnly);
        if (digitsOnly.length === 0) {
            setPhoneError('');
        } else if (digitsOnly.length < 10) {
            setPhoneError(t('t_d587ead7'));
        } else if (digitsOnly.length === 10 && !/^0[567]/.test(digitsOnly)) {
            setPhoneError(t('t_ac66aafc'));
        } else if (digitsOnly.length > 10) {
            setPhoneError(t('t_a8357a0f'));
        } else {
            setPhoneError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (authMode === 'login') {
                const { error } = await insforge.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/merchant');
            } else if (authMode === 'signup') {
                const cleanPhone = phone.replace(/\s+/g, '');
                const isValidAlgerianPhone = /^0?(5|6|7)\d{8}$/.test(cleanPhone);
                
                if (!isValidAlgerianPhone) {
                    setErrorMsg(t('t_ce16aaa0'));
                    setLoading(false);
                    return;
                }
                
                const formattedPhone = cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone;

                const { error, data } = await insforge.auth.signUp({
                    email,
                    password,
                    name: name
                });
                if (error) throw error;
                
                // Save profile data to localStorage to be applied after verification
                if (typeof window !== 'undefined') {
                    localStorage.setItem('pending_signup_profile', JSON.stringify({
                        full_name: name,
                        whatsapp_number: formattedPhone
                    }));
                }

                if (data?.accessToken) {
                    // User got token immediately (no email verification needed)
                    // Save phone to auth profile AND to profiles table
                    await insforge.auth.setProfile({ phone_number: formattedPhone });
                    
                    await insforge.database.from('profiles').update({
                        full_name: name,
                        whatsapp_number: formattedPhone
                    }).eq('id', data.user!.id);
                    
                    // Cleanup since we successfully updated
                    if (typeof window !== 'undefined') localStorage.removeItem('pending_signup_profile');
                    
                    router.push('/merchant/onboarding');
                } else {
                    setAuthMode('verify_email');
                    setSuccessMsg(t('t_2c836992'));
                }
            } else if (authMode === 'forgot_password') {
                const { error } = await insforge.auth.sendResetPasswordEmail({ email });
                if (error) throw error;
                setAuthMode('reset_password_code');
                setSuccessMsg(t('t_9307873d'));
            } else if (authMode === 'verify_email') {
                const { error, data } = await insforge.auth.verifyEmail({ email, otp: verificationCode });
                if (error) throw error;
                
                if (data?.user) {
                    // Try state variables first, then fallback to localStorage
                    let profileName = name;
                    let profilePhone = phone;
                    
                    if (!profileName || !profilePhone) {
                        try {
                            const pending = JSON.parse(localStorage.getItem('pending_signup_profile') || '{}');
                            if (!profileName && pending.full_name) profileName = pending.full_name;
                            if (!profilePhone && pending.whatsapp_number) profilePhone = pending.whatsapp_number;
                        } catch (e) {}
                    }
                    
                    if (profileName || profilePhone) {
                        const updates: any = {};
                        if (profileName) updates.full_name = profileName;
                        if (profilePhone) {
                            const cleanPhone = profilePhone.replace(/\s+/g, '');
                            const finalPhone = cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone;
                            updates.whatsapp_number = finalPhone;
                            // Also save to auth profile for consistency
                            await insforge.auth.setProfile({ phone_number: finalPhone });
                        }
                        await insforge.database.from('profiles').update(updates).eq('id', data.user.id);
                    }
                }
                
                // Cleanup pending profile
                if (typeof window !== 'undefined') localStorage.removeItem('pending_signup_profile');
                
                router.push('/merchant/onboarding');
            } else if (authMode === 'reset_password_code') {
                const { error, data } = await insforge.auth.exchangeResetPasswordToken({ email, code: resetCode });
                if (error) throw error;
                setResetToken(data?.token || '');
                setAuthMode('reset_password_new');
            } else if (authMode === 'reset_password_new') {
                const { error } = await insforge.auth.resetPassword({ newPassword: password, otp: resetToken });
                if (error) throw error;
                setAuthMode('login');
                setSuccessMsg(t('t_d171fdea'));
            }
        } catch (error: any) {
            setErrorMsg(error.message || t('t_1000802c'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-zinc-800 relative z-10 flex flex-col justify-center">
                <div className="flex justify-center mb-6">
                    <Link href="/" className="h-12 flex items-center justify-center">
                        <img src="/logo_cropped.png" alt="SOUQ AI" className="h-12 object-contain dark:hidden" />
                        <img src="/logo_dark.png" alt="SOUQ AI" className="h-12 object-contain hidden dark:block" />
                    </Link>
                </div>
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        {authMode === 'login' ? t('t_caa97c66') : authMode === 'signup' ? t('t_a62132ae') : ['verify_email', 'reset_password_code'].includes(authMode) ? t('t_66657693') : authMode === 'reset_password_new' ? t('t_5867c231') : t('t_adfccfba')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                        {authMode === 'login' ? t('t_9fa4599b') : authMode === 'signup' ? t('t_485206af') : ['verify_email', 'reset_password_code'].includes(authMode) ? t('t_61d4f5a8') : authMode === 'reset_password_new' ? t('t_305806e5') : t('t_1fe4f2c5')}
                    </p>
                </div>

                <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-full mb-8 relative">
                    <label className="flex-1 cursor-pointer">
                        <input checked={authMode === 'login'} onChange={() => {setAuthMode('login'); setErrorMsg(''); setSuccessMsg('');}} className="peer sr-only" name="auth-type" type="radio" value="login" />
                        <div className="h-12 flex items-center justify-center rounded-full text-sm font-bold text-slate-500 dark:text-slate-400 transition-all peer-checked:bg-white dark:bg-zinc-900 peer-checked:dark:bg-slate-700 peer-checked:text-slate-900 dark:text-white peer-checked:dark:text-white peer-checked:shadow-md">{t("t_f4e5e49b")}</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input checked={authMode === 'signup'} onChange={() => {setAuthMode('signup'); setErrorMsg(''); setSuccessMsg('');}} className="peer sr-only" name="auth-type" type="radio" value="signup" />
                        <div className="h-12 flex items-center justify-center rounded-full text-sm font-bold text-slate-500 dark:text-slate-400 transition-all peer-checked:bg-white dark:bg-zinc-900 peer-checked:dark:bg-slate-700 peer-checked:text-slate-900 dark:text-white peer-checked:dark:text-white peer-checked:shadow-md">
                            إنشاء حساب
                        </div>
                    </label>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-bold mb-4 border border-red-200 dark:border-red-800">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm text-center font-bold mb-4 border border-emerald-200 dark:border-emerald-800">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {authMode === 'signup' && (
                        <>
                            <div className="flex flex-col gap-2 input-group group">
                                <label className="text-sm font-bold text-slate-900 dark:text-white">الاسم الكامل</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 transition-colors group-focus-within:text-primary">person</span>
                                    </div>
                                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm  focus:ring-2 focus:ring-primary focus:border-primary py-3.5 pr-12 pl-6 transition-all outline-none" placeholder={t("t_2cebdc32")} required type="text" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 input-group group">
                                <label className="text-sm font-bold text-slate-900 dark:text-white">رقم الهاتف</label>
                                <div className="relative flex">
                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-200 dark:border-zinc-800 rounded-r-full px-4 text-sm font-bold text-slate-600 dark:text-slate-300 select-none" dir="ltr">
                                        <span>🇩🇿</span>
                                        <span>+213</span>
                                    </div>
                                    <input value={phone} onChange={(e) => handlePhoneChange(e.target.value)} className={`w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-l-full border ${phoneError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary'} shadow-sm focus:ring-2 py-3.5 px-4 transition-all outline-none`} placeholder="5XX XX XX XX" required type="tel" dir="ltr" maxLength={10} />
                                </div>
                                {phoneError && <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{phoneError}</p>}
                            </div>
                        </>
                    )}

                    {['verify_email', 'reset_password_code'].includes(authMode) && (
                        <div className="flex flex-col gap-2 input-group group">
                            <label className="text-sm font-bold text-slate-900 dark:text-white text-center">{t("t_1461ff22")}</label>
                            <div className="relative mt-2">
                                <input value={authMode === 'verify_email' ? verificationCode : resetCode} onChange={(e) => authMode === 'verify_email' ? setVerificationCode(e.target.value) : setResetCode(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-full border border-slate-200 dark:border-zinc-800 shadow-inner focus:ring-2 focus:ring-primary focus:border-primary py-4 px-6 transition-all outline-none text-center text-3xl font-black tracking-[0.5em]" placeholder="------" required type="text" dir="ltr" maxLength={6} />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">تم الإرسال إلى {email}</p>
                        </div>
                    )}

                    {['login', 'signup', 'forgot_password'].includes(authMode) && (
                        <div className="flex flex-col gap-2 input-group group">
                            <label className="text-sm font-bold text-slate-900 dark:text-white">البريد الإلكتروني</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 transition-colors group-focus-within:text-primary">mail</span>
                                </div>
                                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm  focus:ring-2 focus:ring-primary focus:border-primary py-3.5 pr-12 pl-6 transition-all outline-none" placeholder="name@company.com" required type="email" />
                            </div>
                        </div>
                    )}

                    {['login', 'signup', 'reset_password_new'].includes(authMode) && (
                        <div className="flex flex-col gap-2 input-group group">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-900 dark:text-white">{authMode === 'reset_password_new' ? 'كلمة المرور الجديدة' : 'كلمة المرور'}</label>
                                {authMode === 'login' && (
                                    <button type="button" onClick={() => { setAuthMode('forgot_password'); setErrorMsg(''); setSuccessMsg(''); }} className="text-xs font-semibold text-primary hover:text-primary-dark">{t("t_119d2da5")}</button>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 transition-colors group-focus-within:text-primary">lock</span>
                                </div>
                                <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm  focus:ring-2 focus:ring-primary focus:border-primary py-3.5 pr-12 pl-12 transition-all outline-none" placeholder="••••••••" required type={showPassword ? 'text' : 'password'} dir="ltr" minLength={6} />
                                <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" type="button">
                                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <button disabled={loading} className={`mt-2 w-full bg-gradient-to-r from-primary to-[#ff4081] hover:from-primary-dark hover:to-primary text-white font-bold py-3.5 rounded-full shadow-[0_4px_14px_0_rgba(233,32,99,0.39)] hover:shadow-[0_6px_20px_rgba(233,32,99,0.23)] transition-all duration-200 flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`} type="submit">
                        <span>{loading ? 'جاري التحميل...' : (authMode === 'login' ? t('t_f4e5e49b') : authMode === 'signup' ? t('t_a62132ae') : ['verify_email', 'reset_password_code'].includes(authMode) ? 'تأكيد' : authMode === 'reset_password_new' ? t('t_4af58fd0') : t('t_9d550b85'))}</span>
                        {!loading && <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>}
                    </button>
                    
                    {['forgot_password', 'verify_email', 'reset_password_code', 'reset_password_new'].includes(authMode) && (
                        <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                            الرجوع لتسجيل الدخول
                        </button>
                    )}
                </form>

                {['login', 'signup'].includes(authMode) && (
                    <>
                        <div className="relative flex items-center gap-4 py-2">
                            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                            <span className="text-slate-400 text-sm font-medium">{t("t_d177a6e7")}</span>
                            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => insforge.auth.signInWithOAuth({ provider: 'google', redirectTo: window.location.origin + '/merchant' })} className="flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold py-3 rounded-full transition-colors">
                                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAn7vXPE7M2Mfnbvo0r8fxZe3MkSoWAsvUG0DK6j01Q6-KttIdKDncnD3ev8PamX6JdRpgBZBw_juKHTphE2B2EKT8lhGNhR6XYPetlEf4l7SkCRqCkUXZcZYoF7QAe7N-zmvECmo1N3p-7KBpb2vqFJwaZSZ9Jfy3UT8r6QDGYwCx2PPFDc4-MMcVj78n9TmsXyrTzGZYcZGOaJM6fW-BXdGm113R2DZrwxvjry1biMIsQMX0SbfMg9LiZ035apd5v-Fw9hdu8dQs" />
                                <span className="text-sm">Google</span>
                            </button>
                            <button type="button" onClick={() => insforge.auth.signInWithOAuth({ provider: 'apple', redirectTo: window.location.origin + '/merchant' })} className="flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold py-3 rounded-full transition-colors">
                                <span className="material-symbols-outlined">ios</span>
                                <span className="text-sm">Apple</span>
                            </button>
                        </div>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                            {authMode === 'login' ? (
                                <>{t("t_102c9d4f")}<button type="button" onClick={() => setAuthMode('signup')} className="text-primary font-bold hover:underline">{t("t_a62132ae")}</button></>
                            ) : (
                                <>لديك حساب بالفعل؟ <button type="button" onClick={() => setAuthMode('login')} className="text-primary font-bold hover:underline">{t("t_f4e5e49b")}</button></>
                            )}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

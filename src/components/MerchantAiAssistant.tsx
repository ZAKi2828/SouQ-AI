"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Sparkles, Send, X, User, 
  RefreshCw, TrendingUp, ShoppingCart, Package, HelpCircle
} from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { useStoreContext } from '@/lib/useStoreContext';
import { useI18n } from '@/context/I18nContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function MerchantAiAssistant() {
  const { lang, t } = useI18n();
  const isAr = lang === 'ar';
  const { context, loading: contextLoading } = useStoreContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiCredits, setAiCredits] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState('free');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts in Arabic
  const quickPrompts = [
    { text: '📊 إحصائيات المتجر اليوم', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { text: '📦 الطلبات الجديدة المعلقة', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
    { text: '⚠️ المنتجات منخفضة المخزون', icon: <Package className="w-3.5 h-3.5" /> },
  ];

  // Fetch AI credits and Plan on mount or when context loads
  useEffect(() => {
    if (context?.targetUserId) {
      const fetchCredits = async () => {
        try {
          const { data: profile } = await insforge.database
            .from('profiles')
            .select('plan, ai_text_credits')
            .eq('id', context.targetUserId)
            .maybeSingle();
          
          if (profile) {
            setAiCredits(profile.ai_text_credits ?? 0);
            setUserPlan(profile.plan?.toLowerCase() || 'free');
          }
        } catch (err) {
          console.error('Error fetching AI credits:', err);
        }
      };
      fetchCredits();
    }
  }, [context]);

  // Scroll to bottom when messages or thinking state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && context) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: isAr
            ? `مرحباً بك يا ${context.ownerName || 'شريكنا'}! 👋 أنا مساعدك الذكي في منصة SOUQai.\n\nكيف يمكنني مساعدتك اليوم؟ يمكنك أن تسألني عن مبيعاتك، الطلبات المعلقة، أو المخزون مباشرة!`
            : `Welcome ${context.ownerName || 'Partner'}! 👋 I am your SOUQai AI Assistant.\n\nHow can I help you today? Ask me about your store sales, pending orders, or inventory!`,
          timestamp: new Date()
        }
      ]);
    }
  }, [context, messages.length]);

  // Deduct 1 credit helper
  const deductCredit = async () => {
    if (aiCredits === null || aiCredits === 999999999) return;
    const newBalance = Math.max(0, aiCredits - 1);
    setAiCredits(newBalance);
    
    try {
      // Call RPC to deduct credit
      const { error: rpcErr } = await insforge.database.rpc('deduct_ai_credit', {
        p_user_id: context.targetUserId,
        p_credit_type: 'ai_text_credits',
        p_new_balance: newBalance
      });
      if (rpcErr) throw rpcErr;
    } catch (err) {
      console.error('RPC credit deduction failed, falling back to direct update:', err);
      try {
        await insforge.database
          .from('profiles')
          .update({ ai_text_credits: newBalance })
          .eq('id', context.targetUserId);
      } catch (fallbackErr) {
        console.error('Fallback credit update failed:', fallbackErr);
      }
    }
  };

  // Database Tools executed on behalf of the AI Agent
  const executeTool = async (action: string, parameters: any) => {
    const storeDomain = context?.storeDomain;
    if (!storeDomain) {
      return { error: 'Store domain not found in context' };
    }

    try {
      switch (action) {
        case 'get_store_stats': {
          // 1. Fetch Orders
          const { data: orders } = await insforge.database
            .from('orders')
            .select('total_price, status, customer_phone')
            .eq('store_domain', storeDomain);

          const validOrders = (orders || []).filter((o: any) => !['cancelled', 'returned'].includes(o.status));
          const totalSales = validOrders.reduce((sum: number, o: any) => sum + (Number(o.total_price) || 0), 0);
          const uniqueCustomers = new Set((orders || []).map((o: any) => o.customer_phone).filter(Boolean));

          // 2. Fetch Active Products Count
          const { count: productsCount } = await insforge.database
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('store_domain', storeDomain)
            .eq('status', 'active');

          return {
            total_sales_dzd: totalSales,
            total_orders: (orders || []).length,
            unique_customers: uniqueCustomers.size,
            active_products: productsCount || 0
          };
        }

        case 'get_recent_orders': {
          const limit = parameters?.limit || 5;
          const { data: orders } = await insforge.database
            .from('orders')
            .select('id, product_name, customer_name, customer_phone, total_price, status, created_at')
            .eq('store_domain', storeDomain)
            .order('created_at', { ascending: false })
            .limit(limit);
          return orders || [];
        }

        case 'get_low_stock_products': {
          const { data: products } = await insforge.database
            .from('products')
            .select('id, name, price, quantity')
            .eq('store_domain', storeDomain)
            .eq('status', 'active')
            .lte('quantity', 5)
            .order('quantity', { ascending: true });
          return products || [];
        }

        default:
          return { error: `أداة غير معروفة: ${action}` };
      }
    } catch (err: any) {
      console.error(`Error executing tool ${action}:`, err);
      return { error: err.message || 'حدث خطأ أثناء الاتصال بقاعدة البيانات' };
    }
  };

  // AI Agent Conversation Loop (ReAct pattern)
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    // Check credits for free plan users
    const isVip = userPlan === 'vip';
    if (!isVip && aiCredits !== null && aiCredits <= 0) {
      const limitMsg: Message = {
        id: `limit-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ نعتذر منك! لقد نفذ رصيدك من الأسئلة الذكية المتاحة لخطتك الحالية. يرجى ترقية خطتك من صفحة الاشتراكات للحصول على رصيد إضافي ومميزات غير محدودة. 🚀',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, { id: `${Date.now()}-user`, role: 'user', content: textToSend, timestamp: new Date() }, limitMsg]);
      setInputText('');
      return;
    }

    const newUserMsg: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsThinking(true);

    let apiMessages = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: textToSend }
    ];

    let loopCount = 0;
    const maxLoops = 3;
    let finalAnswer = '';

    const systemPrompt = `أنت المساعد الذكي لمنصة التجارة الإلكترونية SOUQai. وظيفتك هي مساعدة التاجر في إدارة متجره والإجابة على استفساراته بلغة عربية احترافية، ودية وواضحة.
اسم التاجر: ${context?.ownerName || 'التاجر'}
اسم المتجر: ${context?.storeName || 'المتجر'}
اسم نطاق المتجر (domain): ${context?.storeDomain || 'العام'}

لديك القدرة على تنفيذ إجراءات وجلب بيانات من قاعدة البيانات مباشرة. للقيام بذلك، يجب أن ترد حصراً بصيغة JSON التالية إذا كنت بحاجة لبيانات أو لإجراء تغيير:
{
  "action": "ACTION_NAME",
  "parameters": { ... },
  "thought": "شرح باللغة العربية لسبب استخدام هذه الأداة"
}

الأدوات المتاحة لك:
1. get_store_stats: جلب إحصائيات المتجر العامة (إجمالي المبيعات، عدد الطلبات، عدد العملاء، عدد المنتجات النشطة). لا تتطلب معاملات.
2. get_recent_orders: جلب أحدث الطلبات. المعاملات: { limit: number } (افتراضياً 5).
3. get_low_stock_products: جلب المنتجات التي مخزونها منخفض (أقل من أو يساوي 5 وحدات). لا تتطلب معاملات.

إذا حصلت على البيانات من الأداة أو لم تكن بحاجة لأي أداة للإجابة، يجب أن ترد بصيغة JSON التالية:
{
  "response": "الإجابة الكاملة والمنسقة باللغة العربية للتاجر هنا. استخدم التنسيق الجميل والرموز التعبيرية المناسبة."
}

تنبيهات هامة:
- لا تكتب أي كلام خارج صيغة الـ JSON. يجب أن يكون ردك كاملاً عبارة عن كود JSON صالح فقط.
- التزم باللغة العربية الفصحى المبسطة والمشجعة.
- رصيد التاجر الحالي من العمليات الذكية هو: ${aiCredits ?? 'غير معروف'}.`;

    try {
      while (loopCount < maxLoops) {
        loopCount++;

        const completion = await insforge.ai.chat.completions.create({
          model: 'deepseek/deepseek-v3.2',
          messages: [
            { role: 'system', content: systemPrompt },
            ...apiMessages
          ],
          temperature: 0.5,
        });

        const rawContent = completion.choices[0]?.message?.content?.trim() || '';
        
        let cleanJson = rawContent;
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        }

        let parsed;
        try {
          parsed = JSON.parse(cleanJson);
        } catch (jsonErr) {
          console.warn('Failed to parse AI response as JSON, retrying raw text recovery:', rawContent);
          finalAnswer = rawContent;
          break;
        }

        if (parsed.action) {
          const toolResult = await executeTool(parsed.action, parsed.parameters);
          
          apiMessages.push({ role: 'assistant', content: rawContent });
          apiMessages.push({ 
            role: 'system', 
            content: `[Tool Result for ${parsed.action}]: ${JSON.stringify(toolResult)}` 
          });
          
          continue;
        } else if (parsed.response) {
          finalAnswer = parsed.response;
          break;
        } else {
          finalAnswer = rawContent;
          break;
        }
      }

      if (!finalAnswer) {
        finalAnswer = 'عذراً، لم أتمكن من معالجة طلبك حالياً. يرجى المحاولة مرة أخرى.';
      }

      const newAssistantMsg: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: finalAnswer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAssistantMsg]);
      await deductCredit();

    } catch (err) {
      console.error('AI assistant processing error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: 'assistant',
          content: '❌ حدث خطأ أثناء الاتصال بالخادم السحابي للذكاء الاصطناعي. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  if (contextLoading || !context) return null;

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 ${isAr ? 'left-6' : 'right-6'} z-40 group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#E91E63] to-purple-600 dark:from-[#E91E63] dark:to-purple-500 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 border border-pink-400/30`}
        style={{
          boxShadow: '0 10px 25px -5px rgba(233, 30, 99, 0.4), 0 8px 10px -6px rgba(233, 30, 99, 0.4)'
        }}
      >
        <span className="absolute inset-0 rounded-full border-2 border-pink-400 animate-ping opacity-25 scale-105 pointer-events-none"></span>
        <Bot className="w-6 h-6 text-white transition-transform duration-500 group-hover:rotate-12" />
        
        <span className={`absolute -top-1 ${isAr ? '-left-1' : '-right-1'} w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center`}>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
        </span>

        <div className={`absolute ${isAr ? 'left-full ml-3 -translate-x-2 group-hover:translate-x-0' : 'right-full mr-3 translate-x-2 group-hover:translate-x-0'} bg-slate-900/90 dark:bg-zinc-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl backdrop-blur-sm border border-white/10`}>
          {isAr ? 'المساعد الذكي للتاجر ✨' : lang === 'fr' ? 'Assistant IA Marchand ✨' : 'Merchant AI Assistant ✨'}
        </div>
      </button>

      {/* Slide-over Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-xs transition-opacity"
            />

            <div className={`fixed inset-y-0 ${isAr ? 'right-0 md:right-auto md:left-0 pr-0 md:pr-10' : 'left-0 md:left-auto md:right-0 pl-0 md:pl-10'} max-w-full flex`}>
              <motion.div
                initial={{ x: isAr ? '-100%' : '100%' }}
                animate={{ x: 0 }}
                exit={{ x: isAr ? '-100%' : '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className={`w-screen max-w-md h-full bg-white dark:bg-zinc-950 shadow-2xl flex flex-col ${isAr ? 'border-e' : 'border-s'} border-gray-150 dark:border-zinc-800`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800/80 bg-gradient-to-r from-pink-50/20 to-purple-50/20 dark:from-pink-950/10 dark:to-purple-950/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E91E63] to-pink-500 flex items-center justify-center text-white shadow-md">
                      <Bot className="w-5.5 h-5.5" />
                    </div>
                    <div className="text-start">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{isAr ? 'مساعد SOUQai الذكي' : 'SOUQai AI Assistant'}</h3>
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-0.5">
                        {isAr ? 'مستعد لتنفيذ أوامرك وجلب إحصائياتك' : lang === 'fr' ? 'Prêt à exécuter vos commandes et apporter vos statistiques' : 'Ready to analyze your store and execute tasks'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/30 dark:bg-zinc-950/20">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${
                        msg.role === 'user' ? 'ms-auto flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-[#E91E63] dark:bg-[#E91E63]'
                            : 'bg-gradient-to-br from-[#E91E63] to-pink-500'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1 text-start">
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs border ${
                            msg.role === 'user'
                              ? 'bg-[#E91E63] dark:bg-[#E91E63] text-white border-pink-700/10 rounded-te-none'
                              : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-zinc-800 rounded-ts-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-gray-400 px-1 block mt-0.5">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Thinking Loader */}
                  {isThinking && (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E91E63] to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-3.5 rounded-2xl rounded-ts-none shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#E91E63] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#E91E63] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#E91E63] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold ms-1">جاري الاستعلام وتنسيق الإجابة...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>

                {/* Quick actions Panel */}
                {messages.length > 0 && !isThinking && (
                  <div className="p-3 border-t border-gray-100 dark:border-zinc-850 bg-gray-50/50 dark:bg-zinc-950/40">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mb-2 flex items-center gap-1 text-start">
                      <Sparkles className="w-3 h-3 text-[#E91E63]" />
                      إجراءات سريعة مقترحة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt.text.replace(/^[^\s]+\s/, ''))}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-pink-50/30 dark:hover:bg-pink-950/20 text-gray-700 dark:text-gray-300 hover:text-[#E91E63] dark:hover:text-[#E91E63] border border-gray-200 dark:border-zinc-800 rounded-xl text-[10px] font-bold transition-all duration-200 active:scale-95 shadow-3xs"
                        >
                          {prompt.icon}
                          {prompt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Controls */}
                <div className="p-4 border-t border-gray-150 dark:border-zinc-850 space-y-3 bg-gray-50/90 dark:bg-zinc-900/95 backdrop-blur-md">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={isThinking}
                      placeholder="اسألني عن مبيعاتك أو مخزونك المعلق..."
                      className="flex-1 px-4 py-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-[#E91E63] focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-3xs text-start font-bold"
                    />
                    <button
                      onClick={() => handleSendMessage(inputText)}
                      disabled={!inputText.trim() || isThinking}
                      className="px-4 py-3 bg-gradient-to-r from-[#E91E63] to-pink-600 text-white rounded-xl font-bold text-xs hover:opacity-95 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 scale-x-[-1]" />
                    </button>
                  </div>

                  {/* Footnote showing remaining credits */}
                  <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 px-1 font-medium">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      استهلاك: 1 رصيد ذكي لكل رد
                    </span>
                    {aiCredits !== null && (
                      <span className="font-bold text-[#E91E63] dark:text-pink-400 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                        الرصيد المتبقي: {aiCredits === 999999999 ? 'غير محدود' : `${aiCredits} نقطة`}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

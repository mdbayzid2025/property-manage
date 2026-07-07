import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Invoice, Unit, Tenant } from '../services/db';
import { Send, Bot, X, Sparkles } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function AIChatSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, lang } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: lang === 'bn' ? 'আসসালামু আলাইকুম! আমি বঙ্গ প্রোপার্টি এআই চ্যাট অ্যাসিস্ট্যান্ট। আমি আপনাকে কীভাবে সাহায্য করতে পারি?' : 'Hello! I am the Bongo Property AI Chat Assistant. How can I help you today?' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    // Simulate AI thinking and querying local database
    setTimeout(() => {
      let reply = '';
      const query = userMsg.toLowerCase();

      // Fetch tables from mock db
      const invoices = MockDB.getTable<Invoice>('invoices');
      const units = MockDB.getTable<Unit>('units');
      const tenants = MockDB.getTable<Tenant>('tenants');

      // Calculations
      const totalDue = invoices.filter(i => i.status === 'due' || i.status === 'pending')
                               .reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
      const totalPaid = invoices.filter(i => i.status === 'paid' || i.status === 'partial')
                                 .reduce((sum, i) => sum + i.paidAmount, 0);
      const vacantCount = units.filter(u => u.status === 'vacant').length;
      const occupiedCount = units.filter(u => u.status === 'occupied').length;

      // Intelligent rule-based parsing for English & Bangla queries
      if (query.includes('বকেয়া') || query.includes('due') || query.includes('আউটস্ট্যান্ডিং')) {
        reply = lang === 'bn' 
          ? `সিস্টেমের হিসাব অনুযায়ী মোট বকেয়া টাকার পরিমাণ ৳${totalDue.toLocaleString()}। এর মধ্যে Flat A1 এবং Shop 101 এর কিছু বিল চলমান রয়েছে।`
          : `According to the system ledger, the total outstanding due is ৳${totalDue.toLocaleString()}. This includes pending amounts on Flat A1 and Shop 101.`;
      } 
      else if (query.includes('কালেকশন') || query.includes('আদায়') || query.includes('collection') || query.includes('revenue') || query.includes('টাকা জমা')) {
        reply = lang === 'bn'
          ? `চলতি মাসে মোট সংগ্রহ বা আদায় হয়েছে ৳${totalPaid.toLocaleString()}। রিসিট ম্যানেজারে এর সম্পূর্ণ বিবরণ দেখতে পারেন।`
          : `Total revenue collected this cycle is ৳${totalPaid.toLocaleString()}. You can view individual transaction details in the Receipt Manager.`;
      } 
      else if (query.includes('ফাঁকা') || query.includes('vacant') || query.includes('खाली') || query.includes('খালি')) {
        reply = lang === 'bn'
          ? `বর্তমানে মোট ফাঁকা ইউনিটের সংখ্যা ${vacantCount}টি (যেমন: Flat A2 এবং Office 301)। এআই রেট প্রিডিকশন অনুযায়ী এগুলো দ্রুত ভাড়া হওয়ার সম্ভাবনা ৯২%।`
          : `Currently, there are ${vacantCount} vacant units (e.g. Flat A2 and Office 301). AI predicts a 92% occupancy rate fill within 14 days.`;
      }
      else if (query.includes('কামরুল') || query.includes('kamrul')) {
        const kamrul = tenants.find(t => t.name.includes('কামরুল') || t.name.toLowerCase().includes('kamrul'));
        if (kamrul) {
          reply = lang === 'bn'
            ? `ভাড়াটিয়া: ${kamrul.name}। মোবাইল: ${kamrul.phone}। তিনি Flat A1 এ থাকেন এবং উনার চুক্তির মেয়াদ এখনও সক্রিয়। পেমেন্ট হিস্ট্রি অনুযায়ী তিনি একজন বিশ্বস্ত ভাড়াটিয়া (রিস্ক স্কোর: ৮.৫/১০)।`
            : `Tenant Name: ${kamrul.name}. Mobile: ${kamrul.phone}. Rents Flat A1 with active lease agreement. Risk score is excellent (8.5/10).`;
        } else {
          reply = lang === 'bn' ? 'দুঃখিত, কামরুল হাসান নামে কোনো ভাড়াটিয়া তথ্য পাওয়া যায়নি।' : 'Sorry, tenant Kamrul Hasan could not be located in the CRM records.';
        }
      }
      else {
        reply = lang === 'bn'
          ? `আমি বঙ্গ ইআরপি-র ডেটাবেজ বিশ্লেষণ করে হিসাব দিতে পারি। বকেয়া ভাড়া দেখতে 'বকেয়া কত?', আদায় দেখতে 'কালেকশন কত?' অথবা ফাঁকা ফ্ল্যাটের সংখ্যা জানতে 'ফাঁকা ফ্ল্যাট কয়টি?' লিখে প্রশ্ন করুন।`
          : `I can search Bongo ERP database tables. Try asking: "What is the total due?", "Show collections", or "Who is Kamrul Hasan?".`;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 glass-panel border-l border-slate-200 dark:border-blue-900/30 shadow-2xl flex flex-col z-50 animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-blue-950/40 flex justify-between items-center bg-sky-500/5">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-sky-400" />
          <span className="font-bold text-sm">{t('aiChatAssistant')}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-sky-500 text-white rounded-tr-none' 
                : 'bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-blue-950/40 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-slate-200 dark:border-blue-950/40 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('aiChatPlaceholder')}
            className="flex-1 p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none focus:border-sky-500"
          />
          <button 
            onClick={handleSend}
            className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-md shadow-sky-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

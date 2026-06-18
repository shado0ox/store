import React, { useState } from 'react';
import { AppwriteConfig } from '../types';
import { appwriteService } from '../lib/appwrite';
import { Database, HelpCircle, CheckCircle2, AlertCircle, RefreshCw, Key, Shield } from 'lucide-react';
import { Client, Databases } from 'appwrite';

interface AppwriteSetupProps {
  onConfigApplied: () => void;
}

export default function AppwriteSetup({ onConfigApplied }: AppwriteSetupProps) {
  const currentConfig = appwriteService.getConfig();
  const isCurrentlyConnected = appwriteService.isConnected();

  const [endpoint, setEndpoint] = useState(currentConfig?.endpoint || 'https://cloud.appwrite.io/v1');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [databaseId, setDatabaseId] = useState(currentConfig?.databaseId || '');
  const [productsCollectionId, setProductsCollectionId] = useState(currentConfig?.productsCollectionId || '');
  const [ordersCollectionId, setOrdersCollectionId] = useState(currentConfig?.ordersCollectionId || '');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    if (!endpoint || !projectId || !databaseId || !productsCollectionId || !ordersCollectionId) {
      setTestResult({
        success: false,
        message: 'يرجى ملء جميع حقول الاتصال وقواعد البيانات للمتابعة.'
      });
      setTesting(false);
      return;
    }

    try {
      // Create temporary client to test
      const testClient = new Client().setEndpoint(endpoint).setProject(projectId);
      const testDbs = new Databases(testClient);
      
      // Attempt to query the products collection (just list 1 item to test schema & read permission)
      await testDbs.listDocuments(databaseId, productsCollectionId, []);
      
      setTestResult({
        success: true,
        message: 'تم الاتصال بقاعدة بيانات Appwrite بنجاح! تم التحقق من قراءة البيانات الكلية.'
      });
    } catch (err: any) {
      console.error(err);
      setTestResult({
        success: false,
        message: `فشل الاتصال: ${err.message || 'تأكد من صحة معرف المشروع وقواعد البيانات، وصلاحيات الوصول (Permissions) في Appwrite'}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const config: AppwriteConfig = {
      endpoint,
      projectId,
      databaseId,
      productsCollectionId,
      ordersCollectionId
    };
    appwriteService.setConfig(config);
    onConfigApplied();
  };

  const handleReset = () => {
    appwriteService.setConfig(null);
    setEndpoint('https://cloud.appwrite.io/v1');
    setProjectId('');
    setDatabaseId('');
    setProductsCollectionId('');
    setOrdersCollectionId('');
    setTestResult(null);
    onConfigApplied();
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs rtl-grid" id="appwrite-setup-panel">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="text-amber-500" size={24} />
            ربط قاعدة بيانات Appwrite
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            قم بربط متجرك بـ Appwrite لتخزين بيانات الأحذية، والطلبات على خادم سحابي مخصص.
          </p>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 px-3 py-1.5 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
        >
          <HelpCircle size={18} />
          {showGuide ? 'إخفاء دليل الإعداد' : 'عرض دليل الإعداد والأعمدة'}
        </button>
      </div>

      {/* Guide Box */}
      {showGuide && (
        <div className="mb-8 p-6 bg-amber-50/50 rounded-2xl border border-amber-100 text-sm text-gray-700 leading-relaxed space-y-4">
          <h3 className="font-bold text-amber-900 flex items-center gap-1.5 text-base">
            <Shield size={18} />
            خطوات إعداد خادم Appwrite وشبكة الجداول والأعمدة:
          </h3>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>سجل دخولك في موقع <a href="https://appwrite.io" target="_blank" rel="noreferrer" className="underline font-bold text-amber-700">Appwrite Cloud</a> وأنشئ مشروعاً جديداً.</li>
            <li>اذهب لقسم <strong>Database</strong> وأنشئ قاعدة بيانات جديدة، انسخ معرفها (Database ID).</li>
            <li>أنشئ جدولين (Collections) في قواعد البيانات:
              <ul className="list-disc list-inside mr-6 mt-1.5 space-y-1.5">
                <li>الأول للمنتجات باسم <strong>Products</strong></li>
                <li>الثاني للطلبات باسم <strong>Orders</strong></li>
              </ul>
            </li>
            <li>في إعدادات كل Collection، تأكد من تعديل الصلاحيات (Settings &rarr; Permissions) لتسمح للـ <strong>Any</strong> (أو الـ Guests) بالعمليات (Read للعميل، و Create/Update إذا لزم).</li>
          </ol>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-2">1. سمات جدول المنتجات (Products Attributes):</h4>
              <ul className="text-xs space-y-1 font-mono text-gray-600">
                <li>- <strong className="text-gray-800">name</strong>: String (سلسلة نصية)</li>
                <li>- <strong className="text-gray-800">description</strong>: String (نص كبير أو مفصل)</li>
                <li>- <strong className="text-gray-800">price</strong>: Float / Integer (رقم ثنائي الماركر)</li>
                <li>- <strong className="text-gray-800">originalPrice</strong>: Float / Integer (اختياري)</li>
                <li>- <strong className="text-gray-800">images</strong>: String (مصفوفة الروابط كـ JSON)</li>
                <li>- <strong className="text-gray-800">category</strong>: String (النوع)</li>
                <li>- <strong className="text-gray-800">sizes</strong>: String (القرارات والمقاسات كـ JSON)</li>
                <li>- <strong className="text-gray-800">colors</strong>: String (مصفوفة الألوان كـ JSON)</li>
                <li>- <strong className="text-gray-800">inStock</strong>: Boolean (متوفر بالمخزن)</li>
                <li>- <strong className="text-gray-800">featured</strong>: Boolean (مميز)</li>
                <li>- <strong className="text-gray-800">brand</strong>: String (الماركة)</li>
                <li>- <strong className="text-gray-800">createdAt</strong>: String (تاريخ الإنشاء)</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-2">2. سمات جدول الطلبات (Orders Attributes):</h4>
              <ul className="text-xs space-y-1 font-mono text-gray-600">
                <li>- <strong className="text-gray-800">customerName</strong>: String (اسم العميل)</li>
                <li>- <strong className="text-gray-800">customerPhone</strong>: String (هاتف للتواصل)</li>
                <li>- <strong className="text-gray-800">customerAddress</strong>: String (عنوان العميل)</li>
                <li>- <strong className="text-gray-800">items</strong>: String (تفاصيل سلة الشراء كـ JSON)</li>
                <li>- <strong className="text-gray-800">totalPrice</strong>: Float / Integer (الأجمالي الكلي)</li>
                <li>- <strong className="text-gray-800">status</strong>: String (الحالة: pending, completed... الخ)</li>
                <li>- <strong className="text-gray-800">notes</strong>: String (ملاحظات العميل، اختياري)</li>
                <li>- <strong className="text-gray-800">createdAt</strong>: String (تاريخ الشراء)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Banner */}
      <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between ${
        isCurrentlyConnected 
          ? 'bg-green-50 border border-green-100 text-green-800' 
          : 'bg-amber-50 border border-amber-100 text-amber-800'
      }`}>
        <div className="flex items-center gap-2.5">
          {isCurrentlyConnected ? <CheckCircle2 className="text-green-600" size={20} /> : <AlertCircle className="text-amber-600" size={20} />}
          <div>
            <p className="font-bold text-sm">
              {isCurrentlyConnected ? 'متصل بقاعدة البيانات السحابية الحية' : 'يعمل الآن بوضعية التخزين المحلي المؤقت (Local Offline Mode)'}
            </p>
            <p className="text-xs opacity-80 mt-0.5">
              {isCurrentlyConnected 
                ? `مشروع Appwrite الحالي: ${currentConfig?.projectId}` 
                : 'الأحذية والبيانات محفوظة مؤقتاً بالمتصفح، قم بتكبير المشروع بربطه مع خادمك.'
              }
            </p>
          </div>
        </div>

        {isCurrentlyConnected && (
          <button
            onClick={handleReset}
            className="text-xs bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bold hover:bg-red-50 cursor-pointer"
          >
            فصل الاتصال بالسيرفر
          </button>
        )}
      </div>

      {/* Setup Form */}
      <form onSubmit={handleTestConnection} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">رابط السيرفر الرئيسي (Endpoint):</label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://cloud.appwrite.io/v1"
              className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">معرف المشروع (Project ID):</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="مثال: 65cb465fd8aa4..."
              className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">معرف قاعدة البيانات (Database ID):</label>
            <input
              type="text"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              placeholder="مثال: main-shoe-db"
              className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">معرف جدول المنتجات (Products Collection ID):</label>
            <input
              type="text"
              value={productsCollectionId}
              onChange={(e) => setProductsCollectionId(e.target.value)}
              placeholder="مثال: products_list"
              className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-500">معرف جدول الطلبات (Orders Collection ID):</label>
            <input
              type="text"
              value={ordersCollectionId}
              onChange={(e) => setOrdersCollectionId(e.target.value)}
              placeholder="مثال: customer_orders"
              className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              required
            />
          </div>
        </div>

        {/* Connection status feedback */}
        {testResult && (
          <div className={`p-4 rounded-xl flex items-start gap-2 text-sm ${
            testResult.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {testResult.success ? <CheckCircle2 className="text-green-600 relative top-0.5 shrink-0" size={18} /> : <AlertCircle className="text-red-600 relative top-0.5 shrink-0" size={18} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3 justify-end pt-3">
          <button
            type="submit"
            disabled={testing}
            className="px-5 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer text-sm"
          >
            {testing ? <RefreshCw className="animate-spin" size={18} /> : <Key size={18} />}
            اختبار الاتصال
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={testResult === null || !testResult.success}
            className={`px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm cursor-pointer ${
              testResult && testResult.success
                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            حفظ وتفعيل الاتصال السحابي
          </button>
        </div>
      </form>
    </div>
  );
}

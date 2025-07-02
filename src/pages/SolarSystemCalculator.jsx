import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// مكون حاسبة نظام الطاقة الشمسية مع اختيار المستخدم للمنتجات وحساب الكميات والتكلفة والتشغيل والشحن
function SolarSystemCalculator() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiredPower, setRequiredPower] = useState('');
  const [backupHours, setBackupHours] = useState('');
  const [activeTab, setActiveTab] = useState('calculator');

  // القوائم المفلترة حسب النوع
  const [panelList, setPanelList] = useState([]);
  const [inverterList, setInverterList] = useState([]);
  const [batteryList, setBatteryList] = useState([]);

  // اختيارات المستخدم
  const [selectedPanelId, setSelectedPanelId] = useState('');
  const [panelQuantity, setPanelQuantity] = useState(1);
  const [selectedInverterId, setSelectedInverterId] = useState('');
  const [selectedBatteryId, setSelectedBatteryId] = useState('');
  const [batteryParallelCount, setBatteryParallelCount] = useState(1);

  // نتائج الملخص
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState({
    panel: null,
    inverter: null,
    battery: null
  });

  // عوامل التهيئة
  const SAFETY_FACTOR = 1.1; // هامش الأمان للإنفيرتر
  const EFFICIENCY = 0.8;    // كفاءة التشغيل الفعلية للبطارية
  const CHARGE_OVERHEAD = 1.15; // زيادة الشحن بنسبة 15%

  // جلب البيانات من API مع دعم pagination
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        let all = [];
        let page = 1;
        let lastPage = 1;
        while (page <= lastPage) {
          const res = await api.get(`allproducts`);
          const respData = res.data;
          let list = [];
          if (Array.isArray(respData.data)) list = respData.data;
          else if (Array.isArray(respData)) list = respData;
          all = all.concat(list);
          if (respData.meta && respData.meta.last_page) lastPage = respData.meta.last_page;
          else break;
          page += 1;
          console.log(list);
        }
        // تحويل القيم النصية إلى أرقام
        all.forEach(p => {
          if (!p.specifications) return;
          if (p.type === 'solar_panel') {
            p.specifications.output = Number(p.specifications.output) || 0;
          } else if (p.type === 'inverter') {
            p.specifications.input = Number(p.specifications.input) || 0;
            p.specifications.charging_current = Number(p.specifications.charging_current) || 0;
            p.specifications.DC_volr = Number(p.specifications.DC_volr) || 0;
          } else if (p.type === 'battery') {
            p.specifications.capacity = Number(p.specifications.capacity) || 0;
            p.specifications.voltage = Number(p.specifications.voltage) || 0;
          }
        });
        setProducts(all);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء جلب البيانات من الخادم');
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    console.log(summary);
  }, [summary]);

  // تحديث القوائم عند تغيير المنتجات أو مدخلات القدرة أو اختيار الإنفيرتر
  useEffect(() => {
    // تصنيف الألواح
    const panels = products.filter(p => p.type === 'solar_panel' && p.specifications.output > 0);
    setPanelList(panels);
    // فلترة الإنفيرترات حسب القدرة والجهد
    const rp = Number(requiredPower) || 0;
    let dcVoltage = 0;
    if (rp > 0) {
      dcVoltage = rp < 1500 ? 12 : rp < 3000 ? 24 : 48;
    }
    const inverters = products.filter(p => p.type === 'inverter' && p.specifications.DC_volr === dcVoltage && p.specifications.input >= rp * SAFETY_FACTOR);
    setInverterList(inverters);
    // فلترة البطاريات بعد اختيار إنفيرتر
    if (selectedInverterId) {
      const inv = products.find(p => p.id.toString() === selectedInverterId);
      const voltage = inv?.specifications.DC_volr || dcVoltage;
      const batteries = products.filter(p => p.type === 'battery' && voltage % p.specifications.voltage === 0);
      setBatteryList(batteries);
    } else {
      setBatteryList([]);
      setSelectedBatteryId('');
    }
  }, [products, requiredPower, selectedInverterId]);

  // ضبط كمية الألواح الافتراضية عند اختيار اللوح
  useEffect(() => {
    if (selectedPanelId && requiredPower) {
      const panel = panelList.find(p => p.id.toString() === selectedPanelId);
      const rp = Number(requiredPower);
      if (panel && panel.specifications.output > 0) {
        const suggested = Math.ceil(rp / panel.specifications.output);
        setPanelQuantity(suggested);
      }
    }
  }, [selectedPanelId, panelList, requiredPower]);

  // دالة لحساب الملخص
  const handleShowSummary = () => {
    const rp = Number(requiredPower);
    const bh = Number(backupHours) || 0;
    if (isNaN(rp) || rp <= 0) {
      alert('يرجى إدخال قدرة صحيحة أكبر من صفر');
      return;
    }
    // تحقق من الاختيارات
    const panel = panelList.find(p => p.id.toString() === selectedPanelId);
    const inverterItem = inverterList.find(i => i.id.toString() === selectedInverterId);
    const battery = batteryList.find(b => b.id.toString() === selectedBatteryId);
    if (!panel || !inverterItem || !battery) {
      alert('يرجى اختيار لوح، إنفيرتر، وبطارية صحيحة');
      return;
    }
    // حساب تكلفة الألواح
    const panelsCost = panelQuantity * (panel.price || 0);
    // تكلفة الإنفيرتر
    const inverterCost = inverterItem.price || 0;
    // حساب سلسلة البطاريات
    const dcVoltage = inverterItem.specifications.DC_volr;
    const battV = battery.specifications.voltage;
    const seriesCount = battV > 0 ? dcVoltage / battV : 0;
    // runtime لكل سلسلة
    const capacityWh = battery.specifications.capacity * dcVoltage;
    const runtimeActualPerString = rp > 0 ? (capacityWh / rp) * EFFICIENCY : 0;
    // عدد السلاسل الموازية بناءً على اختيار المستخدم
    const parallelCount = Number(batteryParallelCount) || 1;
    // إجمالي runtime
    const totalRuntime = runtimeActualPerString * parallelCount;
    // حساب تكلفة البطاريات
    const totalBatteries = seriesCount * parallelCount;
    const batteriesCost = totalBatteries * (battery.price || 0);
    // حساب وقت الشحن لسلسلة واحدة
    const chargingCurrent = inverterItem.specifications.charging_current || 0;
    const chargingTimePerString = chargingCurrent > 0 ? battery.specifications.capacity / chargingCurrent : null;
    const chargingTimeAdjusted = chargingTimePerString ? chargingTimePerString * CHARGE_OVERHEAD : null;
    // التكلفة الكلية
    const totalCost = panelsCost + inverterCost + batteriesCost;
    setSummary({ panel, panelQuantity, panelsCost, inverter: inverterItem, inverterCost, battery, seriesCount, parallelCount, totalBatteries, batteriesCost, runtimeActualPerString, totalRuntime, chargingTimePerString, chargingTimeAdjusted, totalCost, backupHours: bh });
  };

  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

    // if (!selectedComponents.panel || !selectedComponents.inverter) {
    //   // toast.error('يرجى اختيار الألواح الشمسية ومحول الطاقة على الأقل');
    //   return;
    // }

    // إضافة الألواح الشمسية
    cartItems.push({
      id: summary.panel.id,
      name: summary.panel.name,
      price: summary.panel.price,
      quantity: summary.panelQuantity,
      max_quantity: summary.panel.quantity,
      image: summary.panel.primary_image?.image_path
      ,
      // type: 'solar_panel'
    });

    // إضافة محول الطاقة
    cartItems.push({
      id: summary.inverter.id,
      name: summary.inverter.name,
      price: summary.inverter.price,
      quantity: 1,
      max_quantity: summary.inverter.quantity,
      image: summary.inverter.primary_image?.image_path,
      // type: 'inverter'
    });

    // إضافة البطاريات إذا تم اختيارها
    
      

      cartItems.push({
        id: summary.battery.id,
        name: summary.battery.name,
        price: summary.battery.price,
        quantity: 1,
        max_quantity: summary.battery.quantity,
        image: summary.battery.primary_image?.image_path,
        // type: 'battery'
      });
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    localStorage.setItem('cartCount', cartCount.toString());

    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { count: cartCount }
    }));
    toast.success('تمت إضافة المكونات إلى السلة بنجاح!');
    navigate('/cart');
    // toast.success('تمت إضافة المكونات إلى السلة بنجاح');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100" dir="rtl">
        <svg className="animate-spin h-16 w-16 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-500 p-4 text-center text-lg" dir="rtl">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">حاسبة نظام الطاقة الشمسية</h1>
          {/* تبويبات */}
          <div className="flex justify-center mb-8">
            <button onClick={() => setActiveTab('calculator')} className={`px-6 py-2 rounded-l-lg ${activeTab==='calculator'?'bg-blue-500 text-white':'bg-gray-200 text-gray-700'}`}>الحاسبة</button>
            <button onClick={() => setActiveTab('guide')} className={`px-6 py-2 rounded-r-lg ${activeTab==='guide'?'bg-blue-500 text-white':'bg-gray-200 text-gray-700'}`}>دليل الاستخدام</button>
          </div>

          {activeTab === 'calculator' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* إدخال القدرة والنسخ الاحتياطي */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1">
                    القدرة المطلوبة (واط)
                    <span className="ml-2 cursor-pointer" title="أدخل مجموع الأحمال الكهربائية المطلوبة">🛈</span>
                  </label>
                  <input type="number" value={requiredPower} onChange={e=>{ setRequiredPower(e.target.value); setSelectedInverterId(''); setSelectedBatteryId(''); setSummary(null); }} className="w-full p-2 border rounded" placeholder="مثال: 1500" />
                </div>
                <div>
                  <label className="block mb-1">مدة التشغيل الاحتياطي (ساعات) اختياري</label>
                  <input type="number" value={backupHours} onChange={e=>{ setBackupHours(e.target.value); setSummary(null); }} className="w-full p-2 border rounded" placeholder="مثال: 4" />
                </div>
              </div>

              {/* اختيار اللوح */}
              {panelList.length > 0 && (
                <div>
                  <label className="block mb-1">اختر لوحًا شمسيًا</label>
                  <select value={selectedPanelId} onChange={e=>{ setSelectedPanelId(e.target.value); setSummary(null); }} className="w-full p-2 border rounded">
                    <option value="">-- اختر --</option>
                    {panelList.map(p=> (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.specifications.output}W - السعر: {p.price}
                      </option>
                    ))}
                  </select>
                  {selectedPanelId && (
                    <div className="mt-2">
                      <label className="block mb-1">كمية الألواح</label>
                      <input type="number" min="1" value={panelQuantity} onChange={e=>{ setPanelQuantity(Number(e.target.value)); setSummary(null); }} className="w-full p-2 border rounded" />
                    </div>
                  )}
                </div>
              )}

              {/* اختيار الإنفيرتر */}
              {inverterList.length > 0 && (
                <div>
                  <label className="block mb-1">اختر محول (إنفيرتر)</label>
                  <select value={selectedInverterId} onChange={e=>{ setSelectedInverterId(e.target.value); setSelectedBatteryId(''); setSummary(null); }} className="w-full p-2 border rounded">
                    <option value="">-- اختر --</option>
                    {inverterList.map(inv=> (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} - القدرة: {inv.specifications.input}W - جهد: {inv.specifications.DC_volr}V - التيار: {inv.specifications.charging_current}A - السعر: {inv.price}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* اختيار البطارية */}
              {batteryList.length > 0 && (
                <div>
                  <label className="block mb-1">اختر بطارية</label>
                  <select value={selectedBatteryId} onChange={e=>{ setSelectedBatteryId(e.target.value); setSummary(null); }} className="w-full p-2 border rounded">
                    <option value="">-- اختر --</option>
                    {batteryList.map(b=> (
                      <option key={b.id} value={b.id}>
                        {b.name} - {b.specifications.capacity}Ah/{b.specifications.voltage}V - السعر: {b.price}
                      </option>
                    ))}
                  </select>
                  {selectedBatteryId && (
                    <div className="mt-2 space-y-2">
                      <label className="block mb-1">عدد السلاسل (Series) لحساب الجهد</label>
                      <input type="number" readOnly value={(() => {
                        const inv = inverterList.find(i=>i.id.toString()===selectedInverterId);
                        const batt = batteryList.find(b=>b.id.toString()===selectedBatteryId);
                        if (inv && batt) return inv.specifications.DC_volr / batt.specifications.voltage;
                        return '';
                      })()} className="w-full p-2 border rounded bg-gray-100" />
                      <label className="block mb-1">عدد السلاسل الموازية (Parallel) لتحقيق النسخ الاحتياطي</label>
                      <input type="number" min="1" value={batteryParallelCount} onChange={e=>{ setBatteryParallelCount(Number(e.target.value)); setSummary(null); }} className="w-full p-2 border rounded" placeholder="مثال: 1" />
                    </div>
                  )}
                </div>
              )}

              {/* زر الملخص */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleShowSummary} className="w-full bg-green-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors">
                اعرض الملخص والتكلفة والتشغيل والشحن
              </motion.button>

              {/* عرض الملخص */}
              {summary && (
                <>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-6 space-y-2">
                  <h3 className="text-xl font-bold mb-4">ملخص الاختيارات</h3>
                  <p><strong>لوح شمسي:</strong> {summary.panel.name} x {summary.panelQuantity} = {summary.panelsCost.toLocaleString()} $</p>
                  <p><strong>إنفيرتر:</strong> {summary.inverter.name} = {summary.inverterCost.toLocaleString()} $</p>
                  <p><strong>بطارية:</strong> {summary.battery.name}</p>
                  <p>سلاسل: {summary.seriesCount} على التوالي، موازية: {summary.parallelCount} → إجمالي وحدات: {summary.totalBatteries}</p>
                  <p><strong>تكلفة البطاريات:</strong> {summary.batteriesCost.toLocaleString()} $</p>
                  <p><strong>إجمالي التكلفة:</strong> {summary.totalCost.toLocaleString()} $</p>
                  <hr />
                  <p><strong>وقت التشغيل الفعلي لكل سلسلة:</strong> {summary.runtimeActualPerString.toFixed(2)} ساعة</p>
                  <p><strong>إجمالي وقت التشغيل للنسخ الاحتياطي ({summary.backupHours} ساعات مطلوب):</strong> {summary.totalRuntime.toFixed(2)} ساعة</p>
                  {summary.totalRuntime < summary.backupHours && (
                    <p className="text-red-500">تنبيه: التكوين الحالي لا يغطي مدة النسخ الاحتياطي المطلوبة.</p>
                  )}
                  <p><strong>وقت الشحن النظري لسلسلة واحدة:</strong> {summary.chargingTimePerString ? summary.chargingTimePerString.toFixed(2) + ' ساعة' : 'غير متوفر'}</p>
                  <p><strong>وقت الشحن الفعلي (+15%):</strong> {summary.chargingTimeAdjusted ? summary.chargingTimeAdjusted.toFixed(2) + ' ساعة' : 'غير متوفر'}</p>
                </motion.div>
                <button  onClick={handleAddToCart} className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-800 transition-colors">
                اضافة الى السلة
              </button>
                </>
              )}
             
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose max-w-none space-y-4" dir="rtl">
              <h2 className="text-2xl font-bold mb-4">دليل استخدام الحاسبة</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">1. إدخال القدرة المطلوبة</h3>
                <p>أدخل القدرة المطلوبة بالواط لتحديد جهد النظام.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">2. إدخال مدة النسخ الاحتياطي (اختياري)</h3>
                <p>إذا كنت تريد احتساب عدد البطاريات للنسخ الاحتياطي، أدخل عدد الساعات.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">3. اختيار المنتجات</h3>
                <p>بعد الحساب، اختر اللوح الشمسي، الإنفيرتر، والبطارية المناسبة من القوائم المعروضة.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">4. عرض الملخص</h3>
                <p>اضغط على "اعرض الملخص والتكلفة والتشغيل والشحن" لعرض ملخص التكاليف، وقت التشغيل، ووقت الشحن.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <ToastContainer position="top-center" rtl autoClose={3000} />
    </div>
  );
}

export default SolarSystemCalculator;

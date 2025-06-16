import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

function SolarSystemCalculator() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiredPower, setRequiredPower] = useState('');
  const [backupHours, setBackupHours] = useState('');
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    // جلب المنتجات عند التحميل الأولي
    api.get('products')
      .then(res => {
        // تحويل الحقول النصية إلى أرقام كما في القسم السابق
        const data = res.data.data;
        data.forEach(p => {
          if (p.type === 'solar_panel') {
            p.specifications.output = Number(p.specifications.output);
          } else if (p.type === 'inverter') {
            p.specifications.input = Number(p.specifications.input);
            p.specifications.charging_current = Number(p.specifications.charging_current || 0);
            p.specifications.DC_volr = Number(p.specifications.DC_volr);
          } else if (p.type === 'battery') {
            p.specifications.capacity = Number(p.specifications.capacity);
            p.specifications.voltage = Number(p.specifications.voltage);
          }
        });
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('حدث خطأ أثناء جلب البيانات');
        setLoading(false);
      });
  }, []);
  
  const handleCalculate = () => {
    const rp = Number(requiredPower);
    const bh = backupHours ? Number(backupHours) : null;
    if (isNaN(rp) || rp <= 0) {
      alert('يرجى إدخال قدرة صحيحة أكبر من صفر');
      return;
    }
    // تقسيم المنتجات
    const panels = products.filter(p => p.type === 'solar_panel');
    const inverters = products.filter(p => p.type === 'inverter');
    const batteries = products.filter(p => p.type === 'battery');
    const res = suggestComponents({ requiredPower: rp, backupHours: bh }, { panels, inverters, batteries });
    setResults(res);
  };
  
  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">حساب الاقتراحات بناءً على القدرة المطلوبة</h2>
      <div className="mb-4">
        <label className="block mb-1">القدرة المطلوبة (واط):</label>
        <input
          type="number"
          value={requiredPower}
          onChange={e => setRequiredPower(e.target.value)}
          className="border p-2 w-full"
          placeholder="مثال: 1500"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">مدة تشغيل احتياطي (ساعات) (اختياري):</label>
        <input
          type="number"
          value={backupHours}
          onChange={e => setBackupHours(e.target.value)}
          className="border p-2 w-full"
          placeholder="مثال: 4"
        />
      </div>
      <button
        onClick={handleCalculate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        احسب الاقتراحات
      </button>
      
      {results && (
        <div className="mt-6 space-y-6">
          {/* اقتراح الألواح */}
          {results.panelSuggestion && (
            <div>
              <h3 className="text-lg font-semibold mb-2">اقتراح الألواح</h3>
              <div className="border p-4 rounded">
                <p>اللوح المُختار: <strong>{results.panelSuggestion.panel.name}</strong></p>
                <p>قدرة اللوح الواحدة: {results.panelSuggestion.panel.specifications.output} واط</p>
                <p>عدد الألواح المقترح: {results.panelSuggestion.count}</p>
                <p>إجمالي القدرة المحتملة: {results.panelSuggestion.totalOutput} واط</p>
                <p>السعر لكل لوح: {results.panelSuggestion.panel.price} (الوحدة)</p>
                <p>الإجمالي التقريبي للسعر: {results.panelSuggestion.count * results.panelSuggestion.panel.price}</p>
              </div>
            </div>
          )}
          
          {/* اقتراح الإنفيرترات */}
          <div>
            <h3 className="text-lg font-semibold mb-2">اقتراح الإنفيرترات (جهد DC = {(() => {
              if (Number(requiredPower) < 1500) return 12;
              else if (Number(requiredPower) < 3000) return 24;
              else return 48;
            })()}V)</h3>
            {results.inverterSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.inverterSuggestions.map(inv => (
                  <div key={inv.id} className="border p-4 rounded">
                    <img src={inv.primary_image?.image_url} alt={inv.name} className="w-full h-32 object-cover mb-2"/>
                    <p><strong>{inv.name}</strong></p>
                    <p>القدرة المدخلة المدعومة: {inv.specifications.input} واط</p>
                    <p>تيار الشحن: {inv.specifications.charging_current} A</p>
                    <p>السعر: {inv.price}</p>
                    {/* يمكن رابط التفاصيل */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500">لا يوجد إنفيرتر متوافق مع الشروط (قد تزيد القدرة أو تأكد من البيانات).</p>
            )}
          </div>
          
          {/* اقتراح البطاريات */}
          <div>
            <h3 className="text-lg font-semibold mb-2">اقتراح البطاريات (جهد DC = {(() => {
              if (Number(requiredPower) < 1500) return 12;
              else if (Number(requiredPower) < 3000) return 24;
              else return 48;
            })()}V)</h3>
            {results.batterySuggestions.length > 0 ? (
              <div className="space-y-4">
                {results.batterySuggestions.map(item => (
                  <div key={item.battery.id} className="border p-4 rounded">
                    <p><strong>{item.battery.name}</strong></p>
                    <p>سعة البطارية: {item.battery.specifications.capacity} Ah</p>
                    <p>جهد البطارية: {item.battery.specifications.voltage} V</p>
                    <p>سعة Wh: {(item.capacityWh).toFixed(2)} Wh</p>
                    <p>الوقت النظري للتشغيل عند {requiredPower}W: {item.runtimeIdeal.toFixed(2)} ساعة</p>
                    <p>الوقت الفعلي للتشغيل (80%): {item.runtimeActual.toFixed(2)} ساعة</p>
                    {item.chargingTimeIdeal ? (
                      <>
                        <p>الوقت النظري للشحن: {item.chargingTimeIdeal.toFixed(2)} ساعة</p>
                        <p>الوقت الفعلي للشحن (+15%): {item.chargingTimeActual.toFixed(2)} ساعة</p>
                      </>
                    ) : (
                      <p>لا توجد معلومات تيار الشحن للإنفيرتر لتقدير وقت الشحن.</p>
                    )}
                    <p>السعر: {item.battery.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500">لا توجد بطاريات متوافقة مع هذا الجهد.</p>
            )}
            
            {/* إذا المستخدم أدخل backupHours */}
            {results.batteryCountForBackup && results.batteryCountForBackup.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">اقتراح عدد بطاريات لضمان تشغيل احتياطي</h4>
                {results.batteryCountForBackup.map(item => (
                  <p key={item.battery.id}>
                    إذا اخترت البطارية "{item.battery.name}" تحتاج إلى عدد {item.count} وحدة لتحقيق تشغيل احتياطي لمدة {backupHours} ساعة.
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// دالة suggestComponents يمكن وضعها في ملف منفصل واستيرادها هنا:
function suggestComponents({ requiredPower, backupHours }, { panels, inverters, batteries }) {
  // كما في القسم السابق تمامًا
  // ... (انظر الكود المشروح أعلاه)
  let panelSuggestion = null;
  const sortedPanels = panels.slice().sort((a, b) => b.specifications.output - a.specifications.output);
  if (sortedPanels.length > 0) {
    const top = sortedPanels[0];
    const count = Math.ceil(requiredPower / top.specifications.output);
    panelSuggestion = { panel: top, count, totalOutput: count * top.specifications.output };
  }
  let dcVoltage;
  if (requiredPower < 1500) dcVoltage = 12;
  else if (requiredPower < 3000) dcVoltage = 24;
  else dcVoltage = 48;
  const safetyFactor = 1.1;
  const minInput = requiredPower * safetyFactor;
  const inverterSuggestions = inverters.filter(inv =>
    inv.specifications.DC_volr === dcVoltage &&
    inv.specifications.input >= minInput
  );
  const batterySuggestions = batteries
    .filter(batt => batt.specifications.voltage === dcVoltage)
    .map(batt => {
      const Ah = batt.specifications.capacity;
      const V = batt.specifications.voltage;
      const capacityWh = Ah * V;
      const runtimeIdeal = capacityWh / requiredPower;
      const runtimeActual = runtimeIdeal * 0.8;
      const invForCharging = inverters.find(inv => inv.specifications.DC_volr === dcVoltage);
      const chargingCurrent = invForCharging ? invForCharging.specifications.charging_current : 0;
      let chargingTimeIdeal = chargingCurrent > 0 ? Ah / chargingCurrent : null;
      let chargingTimeActual = chargingTimeIdeal ? chargingTimeIdeal * 1.15 : null;
      return {
        battery: batt,
        capacityWh,
        runtimeIdeal,
        runtimeActual,
        chargingTimeIdeal,
        chargingTimeActual
      };
    });
  let batteryCountForBackup = null;
  if (backupHours && !isNaN(backupHours) && backupHours > 0) {
    batteryCountForBackup = batterySuggestions.map(item => {
      const count = Math.ceil(backupHours / item.runtimeActual);
      return { battery: item.battery, count, totalCapacityWh: item.capacityWh * count };
    });
  }
  return {
    panelSuggestion,
    inverterSuggestions,
    batterySuggestions,
    batteryCountForBackup
  };
}

export default SolarSystemCalculator;

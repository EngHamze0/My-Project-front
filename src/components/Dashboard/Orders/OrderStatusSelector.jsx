import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../services/api';

/**
 * مكون لتغيير حالة الطلب
 * @param {Object} props - خصائص المكون
 * @param {number} props.orderId - معرف الطلب
 * @param {string} props.currentStatus - الحالة الحالية للطلب
 * @param {function} props.onStatusChange - دالة يتم استدعاؤها عند تغيير الحالة بنجاح
 */
const OrderStatusSelector = ({ orderId, currentStatus, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  // قائمة حالات الطلب
  const orderStatuses = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'processing', label: 'قيد المعالجة' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'refunded', label: 'مسترجع' }
  ];

  // تحديث حالة الطلب
  const updateOrderStatus = async (newStatus) => {
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    try {
      await api.post(`/admin/orders/${orderId}/status`, { status: newStatus });
      
      setStatus(newStatus);
      toast.success('تم تحديث حالة الطلب بنجاح');
      
      // استدعاء الدالة المرجعية لإعلام المكون الأب بالتغيير
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
      
      // إعادة الحالة إلى القيمة السابقة في حالة الخطأ
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <select
        className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-8 pr-3 text-sm leading-4 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        value={status}
        onChange={(e) => updateOrderStatus(e.target.value)}
        disabled={isUpdating}
      >
        {orderStatuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
        {isUpdating ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default OrderStatusSelector; 
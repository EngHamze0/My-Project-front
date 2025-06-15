import React from 'react';

/**
 * مكون لعرض حالة الطلب بلون مناسب
 * @param {Object} props - خصائص المكون
 * @param {string} props.status - حالة الطلب (pending, processing, completed, cancelled, refunded)
 * @param {string} [props.className] - فئات CSS إضافية
 */
const OrderStatusBadge = ({ status, className = '' }) => {
  // قائمة حالات الطلب وترجمتها وألوانها
  const orderStatuses = {
    pending: {
      label: 'قيد الانتظار',
      color: 'bg-yellow-100 text-yellow-800'
    },
    processing: {
      label: 'قيد المعالجة',
      color: 'bg-blue-100 text-blue-800'
    },
    completed: {
      label: 'مكتمل',
      color: 'bg-green-100 text-green-800'
    },
    cancelled: {
      label: 'ملغي',
      color: 'bg-red-100 text-red-800'
    },
    refunded: {
      label: 'مسترجع',
      color: 'bg-purple-100 text-purple-800'
    }
  };

  // الحصول على معلومات الحالة أو استخدام قيم افتراضية
  const statusInfo = orderStatuses[status] || {
    label: status || 'غير معروف',
    color: 'bg-gray-100 text-gray-800'
  };

  return (
    <span 
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color} ${className}`}
    >
      {statusInfo.label}
    </span>
  );
};

export default OrderStatusBadge; 
# دليل البدء السريع - إزالة المشارك

## ⚡ 5 دقائق للبدء

### 📋 نظرة عامة
ميزة تسمح للمضيف بإزالة أي مشارك من المقابلة الجماعية.

---

## 🚀 الاستخدام السريع

### للمضيف
```
1. افتح المقابلة الجماعية
2. انقر على زر "✕" بجانب المشارك
3. أكد الإزالة
```

### للمطورين - Backend
```javascript
// في signalingService.js
socket.on('remove-participant', (data) => 
  this.handleRemoveParticipant(socket, data)
);
```

### للمطورين - Frontend
```javascript
// إزالة مشارك
const removeParticipant = (socketId) => {
  if (!isHost) return;
  if (window.confirm('هل أنت متأكد؟')) {
    socketRef.current.emit('remove-participant', {
      roomId,
      hostId: userId,
      targetSocketId: socketId
    });
  }
};

// معالجة الأحداث
socketRef.current.on('removed-from-room', (data) => {
  alert(`تم إزالتك بواسطة ${data.byUserName}`);
  onLeave();
});

socketRef.current.on('user-removed', (data) => {
  setParticipants(prev => 
    prev.filter(p => p.socketId !== data.socketId)
  );
});
```

---

## 🧪 الاختبار السريع

### Backend
```bash
cd backend
npm test -- signalingService.hostControls.test.js
```

**النتيجة المتوقعة**: ✅ 21/21 اختبارات نجحت

### Frontend
```bash
cd frontend
npm test -- HostControls.test.jsx
```

---

## 🔒 الأمان

```javascript
// التحقق من الصلاحيات
if (requester.userId !== room.hostId) {
  socket.emit('action-rejected', {
    reason: 'Only the host can remove participants'
  });
  return;
}
```

---

## 📊 الأحداث (Events)

| الحدث | الاتجاه | الوصف |
|-------|---------|-------|
| `remove-participant` | Client → Server | طلب إزالة مشارك |
| `removed-from-room` | Server → Client | إشعار المشارك المُزال |
| `user-removed` | Server → Client | تحديث باقي المشاركين |
| `action-rejected` | Server → Client | رفض العملية |

---

## 🐛 استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| زر الإزالة لا يظهر | تحقق من `isHost === true` |
| الإزالة لا تعمل | تحقق من اتصال Socket.IO |
| المشارك لا يُزال | تحقق من معالجة `user-removed` |

---

## 📝 ملاحظات سريعة

- ✅ للمضيف فقط
- ✅ تأكيد قبل الإزالة
- ✅ إشعارات فورية
- ✅ أمان محكم
- ✅ 21/21 اختبارات ✅

---

## 🔗 التوثيق الكامل
📄 `docs/VIDEO_INTERVIEWS_REMOVE_PARTICIPANT.md`

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ مكتمل

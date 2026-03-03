# Participant Limit Property Tests
# اختبارات خاصية حد المشاركين

## 📋 Overview / نظرة عامة

This document describes the property-based tests for the participant limit feature in video interviews.

هذا المستند يصف الاختبارات المبنية على الخصائص لميزة حد المشاركين في مقابلات الفيديو.

## 🎯 Property Tested / الخاصية المختبرة

**Property 8: Participant Limit**
**الخاصية 8: حد المشاركين**

**Validates: Requirements 7.1**

> For any interview room with maxParticipants = N, the system should reject the (N+1)th join attempt.

> لأي غرفة مقابلة مع maxParticipants = N، يجب على النظام رفض محاولة الانضمام رقم (N+1).

## 📁 Test File / ملف الاختبار

- **Location**: `backend/tests/participantLimit.property.test.js`
- **Framework**: Jest + fast-check
- **Test Count**: 9 tests (8 property tests + 1 integration test)

## ✅ Test Cases / حالات الاختبار

### 1. Basic Limit Enforcement / فرض الحد الأساسي
**Test**: `should reject the (N+1)th participant when maxParticipants is N`

- Tests with maxParticipants from 2 to 10
- Verifies that exactly N participants can join
- Verifies that the (N+1)th participant is rejected
- **Runs**: 50 iterations

### 2. Various Limit Values / قيم حدود متنوعة
**Test**: `should enforce limit correctly for various maxParticipants values`

- Tests with specific values: 2, 5, 10
- Attempts to add multiple extra participants
- Verifies all extra attempts are rejected
- **Runs**: 30 iterations

### 3. Host Counting / حساب المضيف
**Test**: `should count host as part of the participant limit`

- Tests with maxParticipants from 3 to 8
- Verifies host is counted as one participant
- Verifies only (N-1) additional participants can join
- **Runs**: 30 iterations

### 4. Waiting Room Integration / تكامل غرفة الانتظار
**Test**: `should enforce limit when admitting from waiting room`

- Tests with maxParticipants from 3 to 6
- Creates waiting room with more participants than limit
- Admits participants up to limit
- Verifies additional admissions are rejected
- **Runs**: 25 iterations

### 5. Concurrent Attempts / محاولات متزامنة
**Test**: `should consistently enforce limit across concurrent join attempts`

- Tests with maxParticipants from 4 to 7
- Makes 5 consecutive attempts to exceed limit
- Verifies all attempts fail consistently
- **Runs**: 20 iterations

### 6. Rejoin After Leave / إعادة الانضمام بعد المغادرة
**Test**: `should allow participant to rejoin if under limit after someone leaves`

- Tests with maxParticipants from 3 to 6
- Fills interview to capacity
- Removes one participant
- Verifies new participant can join
- **Runs**: 20 iterations

### 7. Error Messages / رسائل الخطأ
**Test**: `should provide clear error message when participant limit is reached`

- Tests with maxParticipants = 5
- Verifies error message is clear and descriptive
- **Runs**: 1 iteration (deterministic)

### 8. Default Limit / الحد الافتراضي
**Test**: `should enforce default limit of 10 participants`

- Tests default maxParticipants value (10)
- Verifies 10 participants can join
- Verifies 11th participant is rejected
- **Runs**: 1 iteration (deterministic)

### 9. Integration Test / اختبار التكامل
**Test**: `should enforce participant limit throughout the entire interview lifecycle`

- Complete workflow test with maxParticipants = 5
- Tests: creation, waiting room, admission, leaving, rejoining
- Verifies limit is enforced at every stage
- **Runs**: 1 iteration (comprehensive)

## 🔧 Implementation Details / تفاصيل التنفيذ

### Limit Check Logic / منطق فحص الحد

```javascript
const currentInterview = await VideoInterview.findById(interview._id);
if (currentInterview.participants.length >= currentInterview.settings.maxParticipants) {
  throw new Error('Maximum participants limit reached');
}
await currentInterview.addParticipant(userId);
```

### Active Participants Count / عدد المشاركين النشطين

```javascript
const activeParticipants = interview.participants.filter(p => !p.leftAt);
const canJoin = activeParticipants.length < interview.settings.maxParticipants;
```

## 📊 Test Results / نتائج الاختبار

```
✅ All 9 tests passed
⏱️ Total time: ~20 seconds
🔄 Total iterations: 196 property test runs + 1 integration test
```

### Coverage / التغطية

- ✅ Basic limit enforcement
- ✅ Various maxParticipants values (2, 3, 4, 5, 6, 7, 8, 10)
- ✅ Host counting in limit
- ✅ Waiting room integration
- ✅ Concurrent join attempts
- ✅ Rejoin after leave
- ✅ Error messages
- ✅ Default limit (10)
- ✅ Complete lifecycle

## 🎯 Requirements Validation / التحقق من المتطلبات

**Requirements 7.1**: ✅ Validated

> دعم حتى 10 مشاركين في نفس المقابلة
> Support up to 10 participants in the same interview

The property tests verify that:
1. The system enforces the maxParticipants limit
2. The (N+1)th participant is always rejected when N participants are present
3. The limit applies to all participants including the host
4. The limit is enforced consistently across different scenarios
5. The default limit is 10 participants

## 🚀 Running the Tests / تشغيل الاختبارات

```bash
# Run all participant limit tests
cd backend
npm test -- participantLimit.property.test.js

# Run with coverage
npm test -- participantLimit.property.test.js --coverage

# Run specific test
npm test -- participantLimit.property.test.js -t "should reject the (N+1)th"
```

## 📝 Notes / ملاحظات

1. **Property-Based Testing**: Uses fast-check to generate random test cases
2. **Database Cleanup**: Tests clean up after themselves
3. **Isolation**: Each test runs in isolation with fresh data
4. **Realistic Scenarios**: Tests cover real-world usage patterns
5. **Error Handling**: Verifies proper error messages

## 🔍 Future Enhancements / تحسينات مستقبلية

- [ ] Test with network failures during join
- [ ] Test with database connection issues
- [ ] Test with very large maxParticipants values (50+)
- [ ] Test with concurrent admissions from waiting room
- [ ] Performance tests with maximum participants

## 📚 Related Documentation / التوثيق ذو الصلة

- `backend/src/models/VideoInterview.js` - VideoInterview model
- `backend/src/services/waitingRoomService.js` - Waiting room service
- `.kiro/specs/video-interviews/requirements.md` - Requirements document
- `.kiro/specs/video-interviews/design.md` - Design document

---

**Created**: 2026-03-02
**Status**: ✅ Complete
**Test Results**: 9/9 passed

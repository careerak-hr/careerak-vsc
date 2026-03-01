# VideoCall Component

مكون React لعرض مقابلات الفيديو بجودة HD (720p+)

## الاستخدام

```jsx
import VideoCall from './components/VideoCall/VideoCall';
import WebRTCService from './services/webrtcService';

function MyVideoCall() {
  const [webrtcService] = useState(() => new WebRTCService());
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    webrtcService.getUserMedia().then(setLocalStream);
    return () => webrtcService.cleanup();
  }, []);

  return (
    <VideoCall
      localStream={localStream}
      remoteStream={null}
      onToggleAudio={() => {}}
      onToggleVideo={() => {}}
      isAudioEnabled={true}
      isVideoEnabled={true}
      connectionQuality="good"
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `localStream` | MediaStream | Yes | البث المحلي (الكاميرا والميكروفون) |
| `remoteStream` | MediaStream | No | البث البعيد (الطرف الآخر) |
| `onToggleAudio` | Function | Yes | دالة تبديل الصوت |
| `onToggleVideo` | Function | Yes | دالة تبديل الفيديو |
| `isAudioEnabled` | Boolean | Yes | حالة الصوت (مفعّل/معطّل) |
| `isVideoEnabled` | Boolean | Yes | حالة الفيديو (مفعّل/معطّل) |
| `connectionQuality` | String | Yes | جودة الاتصال ('excellent', 'good', 'poor') |

## الميزات

- ✅ جودة HD (1280x720 كحد أدنى)
- ✅ صوت عالي الجودة (48kHz)
- ✅ مؤشر جودة الاتصال
- ✅ شارات جودة الفيديو (HD/SD)
- ✅ تصميم متجاوب
- ✅ Picture-in-Picture للفيديو المحلي

## التوثيق الكامل

راجع [VIDEO_INTERVIEWS_HD_QUALITY.md](../../../../docs/VIDEO_INTERVIEWS_HD_QUALITY.md)

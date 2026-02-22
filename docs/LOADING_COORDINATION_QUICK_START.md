# Loading Coordination - Quick Start

## 🚀 Quick Start (30 seconds)

### 1. Import Components

```jsx
import { LoadingCoordinator, LoadingSection } from './components/Loading/LoadingCoordinator';
```

### 2. Wrap Your Page

```jsx
function MyPage() {
  return (
    <LoadingCoordinator>
      <LoadingSection id="header" minHeight="100px">
        {(loading, setLoading) => {
          // Your component logic here
          useEffect(() => {
            fetchData().then(() => setLoading(false));
          }, []);
          
          return loading ? <Skeleton /> : <Header />;
        }}
      </LoadingSection>
    </LoadingCoordinator>
  );
}
```

### 3. Done! 🎉

Your page now coordinates loading states and prevents layout shifts.

## 📋 Cheat Sheet

### Basic Pattern

```jsx
<LoadingCoordinator>
  <LoadingSection id="unique-id" minHeight="200px">
    {(loading, setLoading) => (
      loading ? <Skeleton /> : <Content />
    )}
  </LoadingSection>
</LoadingCoordinator>
```

### With Progress Callback

```jsx
<LoadingCoordinator onAllLoaded={() => console.log('Done!')}>
  {/* sections */}
</LoadingCoordinator>
```

### Simple Hook (No Context)

```jsx
const { sections, updateSection, loadingPercentage } = useSimpleCoordination([
  { id: 'header', minHeight: '100px', loading: true },
  { id: 'content', minHeight: '400px', loading: true },
]);
```

## ⚡ Common Patterns

### Pattern 1: Fetch Data

```jsx
<LoadingSection id="data" minHeight="300px">
  {(loading, setLoading) => {
    const [data, setData] = useState(null);
    
    useEffect(() => {
      fetchData()
        .then(result => {
          setData(result);
          setLoading(false);
        });
    }, []);
    
    return loading ? <Skeleton /> : <DataDisplay data={data} />;
  }}
</LoadingSection>
```

### Pattern 2: Multiple Sections

```jsx
<LoadingCoordinator>
  <LoadingSection id="header" minHeight="100px">
    {(loading, setLoading) => /* ... */}
  </LoadingSection>
  
  <LoadingSection id="content" minHeight="400px">
    {(loading, setLoading) => /* ... */}
  </LoadingSection>
  
  <LoadingSection id="footer" minHeight="80px">
    {(loading, setLoading) => /* ... */}
  </LoadingSection>
</LoadingCoordinator>
```

### Pattern 3: With Error Handling

```jsx
<LoadingSection id="data" minHeight="300px">
  {(loading, setLoading) => {
    const [error, setError] = useState(null);
    
    useEffect(() => {
      fetchData()
        .then(() => setLoading(false))
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    }, []);
    
    if (error) return <ErrorMessage error={error} />;
    return loading ? <Skeleton /> : <Content />;
  }}
</LoadingSection>
```

## 🎯 Best Practices

1. ✅ Use unique IDs for each section
2. ✅ Set minHeight to match actual content
3. ✅ Match skeleton dimensions to content
4. ✅ Call setLoading(false) when done
5. ✅ Handle errors gracefully

## 🔗 Full Documentation

See [LOADING_COORDINATION_GUIDE.md](./LOADING_COORDINATION_GUIDE.md) for complete documentation.


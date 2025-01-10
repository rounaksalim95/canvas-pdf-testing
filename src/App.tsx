import { useEffect, useState } from 'react';
import { Workbook } from './components/Workbook';

function App() {
  const [isPdfMode, setIsPdfMode] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsPdfMode(searchParams.get('pdf') === 'true');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Workbook isPdfMode={isPdfMode} />
    </div>
  );
}

export default App;

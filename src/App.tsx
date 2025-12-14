import Map from './components/Map';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">City Mobility Explorer</h1>
      <Map />
    </div>
  );
}

export default App;

import Map from './components/Map';

function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      <header className="p-4 shadow-lg bg-white z-10">
        <h1 className="text-2xl font-bold text-slate-800">City Mobility Explorer</h1>
      </header>
      <main className="flex-1 relative">
        <Map />
      </main>
    </div>
  );
}

export default App;

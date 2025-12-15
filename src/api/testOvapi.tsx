import { useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://v0.ovapi.nl';

export default function TestOVAPI() {
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${BASE_URL}/stations`);
        console.log(response.data); // <-- this shows the raw nested object
      } catch (err) {
        console.error('OVAPI fetch error:', err);
      }
    }
    fetchData();
  }, []);

  return <div>Check your console for OVAPI data</div>;
}

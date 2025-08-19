import { useEffect } from 'react';
import Main from './Main';
// import { incrementTimesAppOpened } from './utils';

function App() {
  useEffect(() => {
    (async () => {
      // await incrementTimesAppOpened();
    })();
  }, []);

  return <Main />;
}

export default App;
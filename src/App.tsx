import { useEffect } from 'react';
import Main from './Main';
import { incrementTimesAppOpened } from 'shared/utils/app-initialization';
import { DatabaseProvider } from 'shared/context/DatabaseContext';

function App() {
  useEffect(() => {
    (async () => {
      await incrementTimesAppOpened();
    })();
  }, []);

  return (
    <DatabaseProvider>
      <Main />
    </DatabaseProvider>
  );
}

export default App;
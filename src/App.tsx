import { useEffect } from 'react';
import Main from './Main';
import { incrementTimesAppOpened } from 'shared/utils/app-initialization';

function App() {
  useEffect(() => {
    (async () => {
      await incrementTimesAppOpened();
    })();
  }, []);

  return <Main/>;
}

export default App;
import { TaskInput, TaskTree } from './components/index.js';

function App() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <TaskInput />
      <hr style={{ margin: '24px 0' }} />
      <TaskTree />
    </div>
  );
}

export default App;

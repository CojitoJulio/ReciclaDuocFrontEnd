import './App.css'
import AppRouter from './app/routes/AppRoutes';
import { RecycleProvider } from '@/app/context/RecycleStore';

function App() {
    return (
        <RecycleProvider>
            <AppRouter />
        </RecycleProvider>
    );
}

export default App;

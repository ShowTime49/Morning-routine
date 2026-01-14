import { RoutineProvider } from '@/context/RoutineContext'
import Index from '@/pages/Index'

function App() {
    return (
        <RoutineProvider>
            <Index />
        </RoutineProvider>
    )
}

export default App

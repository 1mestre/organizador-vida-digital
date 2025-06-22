
import React, { useState, useEffect, useCallback } from 'react';
import MainNavigation from './components/layout/MainNavigation';
import PageContainer from './components/layout/PageContainer';
import LoadingIndicator from './components/common/LoadingIndicator';
import FloatingEmojis from './components/common/FloatingEmojis';

import CalendarioPage from './pages/CalendarioPage';
import IngresosPage from './pages/IngresosPage';
import UniversidadPage from './pages/UniversidadPage';
import ProductividadPage from './pages/ProductividadPage';

import { AppState, PageId, FirebaseData } from './types';
import { initializeFirebase, loadSharedData, saveSharedData } from './services/firebaseService';
import { DEFAULT_OVERALL_TARGET_COP } from './constants';


const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('calendario-page');
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>({
    contributions: [],
    monthlyTargets: {},
    selectedInputCurrencyIngresos: 'USD',
    timetableData: [],
    calendarEventsData: [],
    overallTargetCOP: DEFAULT_OVERALL_TARGET_COP,
  });
  const [isSaving, setIsSaving] = useState(false); // Para intentar prevenir onSnapshot durante guardado


  const updateAndPersistAppState = useCallback(async (data: Partial<AppState>) => {
    console.log("[App.tsx] updateAndPersistAppState llamado con:", data);
    setIsSaving(true); // Indica que estamos a punto de guardar

    setAppState(prev => {
      const tempNewState = { ...prev, ...data };
      const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const authoritativeOverallTargetCOP = tempNewState.monthlyTargets[currentMonthKey] || DEFAULT_OVERALL_TARGET_COP;
      const newState = { ...tempNewState, overallTargetCOP: authoritativeOverallTargetCOP };
      console.log("[App.tsx] Nuevo estado local ANTES de guardar en Firebase:", newState);

      const { overallTargetCOP, ...dataToSave } = newState;
      saveSharedData(dataToSave)
        .then(() => {
          console.log("[App.tsx] Guardado en Firebase exitoso.");
        })
        .catch(error => {
          console.error("[App.tsx] Falló el guardado en Firebase:", error);
          alert("Error: No se pudieron guardar tus cambios en la nube.");
        })
        .finally(() => {
          // Pequeño retraso antes de permitir que onSnapshot actualice de nuevo,
          // para dar tiempo a que la escritura se propague si es posible.
          setTimeout(() => setIsSaving(false), 500); 
        });
      return newState;
    });
  }, []);

  useEffect(() => {
    initializeFirebase();
    console.log("[App.tsx] Suscribiéndose a loadSharedData (onSnapshot)");
    const unsubscribe = loadSharedData(
      (dataFromFirestore: FirebaseData | null) => {
        console.log("[App.tsx] onSnapshot RECIBIÓ datos de Firestore:", dataFromFirestore);
        
        if (isSaving) {
            console.warn("[App.tsx] onSnapshot: Detectado 'isSaving' true, IGNORANDO datos de Firestore temporalmente para evitar reversión.");
            return; 
        }

        if (dataFromFirestore) {
          const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
          const overallTarget = dataFromFirestore.monthlyTargets?.[currentMonthKey] || DEFAULT_OVERALL_TARGET_COP;
          
          setAppState(prevState => {
            const newStateFromFirestore = {
                contributions: dataFromFirestore.contributions || [],
                monthlyTargets: dataFromFirestore.monthlyTargets || {},
                selectedInputCurrencyIngresos: dataFromFirestore.selectedInputCurrencyIngresos || 'USD',
                timetableData: dataFromFirestore.timetableData || [],
                calendarEventsData: dataFromFirestore.calendarEventsData || [],
                overallTargetCOP: overallTarget,
            };
            // Compara si el estado que viene de Firestore es significativamente diferente
            // Esta comparación puede ser más profunda si es necesario
            if (JSON.stringify(newStateFromFirestore.contributions) !== JSON.stringify(prevState.contributions) ||
                JSON.stringify(newStateFromFirestore.monthlyTargets) !== JSON.stringify(prevState.monthlyTargets)) {
                   console.log("[App.tsx] onSnapshot: Datos de Firestore son diferentes. Actualizando estado local.");
                   console.log("[App.tsx] onSnapshot: Estado ANTES de actualizar desde Firestore:", prevState);
                   console.log("[App.tsx] onSnapshot: Estado DESPUÉS de actualizar desde Firestore:", newStateFromFirestore);
                  return newStateFromFirestore;
            } else {
                  console.log("[App.tsx] onSnapshot: Datos de Firestore son iguales al estado local, no se actualiza.");
                  return prevState;
            }
          });
        } else {
          console.log("[App.tsx] onSnapshot: No hay datos en Firestore. Usando/Guardando datos iniciales.");
          const initialDataForFirebase: Omit<AppState, 'overallTargetCOP'> = { 
            contributions: [],
            monthlyTargets: {},
            selectedInputCurrencyIngresos: 'USD',
            timetableData: [],
            calendarEventsData: [],
          };
          setAppState({
            ...initialDataForFirebase,
            overallTargetCOP: DEFAULT_OVERALL_TARGET_COP,
          });
          if (!isSaving) { // Solo guarda si no estamos ya en un proceso de guardado
            setIsSaving(true);
            saveSharedData(initialDataForFirebase)
              .catch(e => console.error("[App.tsx] Error guardando datos iniciales:", e))
              .finally(() => setTimeout(() => setIsSaving(false), 500));
          }
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("[App.tsx] Error en Firestore listener (onSnapshot):", error);
        alert("No se pudieron cargar los datos compartidos. Revisa la conexión o la configuración de Firebase.");
        setIsLoading(false);
      }
    );
    return () => {
      console.log("[App.tsx] Desuscribiéndose de loadSharedData (onSnapshot)");
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // isSaving no debe estar aquí para evitar re-suscripciones múltiples


  const handleNavigation = (pageId: PageId) => {
    setActivePage(pageId);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-2.5 sm:p-4 md:p-6 bg-custom-crimson relative">
      <LoadingIndicator isVisible={isLoading} />
      <FloatingEmojis />
      
      {!isLoading && (
        <div className="w-full max-w-7xl flex flex-col items-center relative z-10">
          <MainNavigation activePage={activePage} onNavigate={handleNavigation} />
          
          <PageContainer id="calendario-page" isActive={activePage === 'calendario-page'}>
            <CalendarioPage appState={appState} updateAppState={updateAndPersistAppState} />
          </PageContainer>
          <PageContainer id="ingresos-page" isActive={activePage === 'ingresos-page'}>
            <IngresosPage appState={appState} updateAppState={updateAndPersistAppState} />
          </PageContainer>
          <PageContainer id="universidad-page" isActive={activePage === 'universidad-page'}>
            <UniversidadPage appState={appState} updateAppState={updateAndPersistAppState} />
          </PageContainer>
          <PageContainer 
            id="productividad-page" 
            isActive={activePage === 'productividad-page'} 
            className="!p-0 sm:!p-0 md:!p-0 lg:!p-0 xl:!p-0 2xl:!p-0 max-w-full bg-gradient-to-br from-gray-900 to-cyan-900 rounded-2xl"
          >
            <ProductividadPage />
          </PageContainer>
        </div>
      )}
    </div>
  );
};

export default App;

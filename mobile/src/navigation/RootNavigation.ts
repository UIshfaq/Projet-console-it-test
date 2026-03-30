import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Référence globale typée pour le NavigationContainer
 */
export const navigationRef = createNavigationContainerRef<any>();

/**
 * Fonction utilitaire pour naviguer depuis l'extérieur des composants React
 * @param name Nom de la route cible
 * @param params Paramètres de navigation optionnels
 */
export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  } else {
    console.warn("RootNavigation: Tentative de navigation avant que le container ne soit prêt.");
  }
}


export type RootStackParamList = {
    Login: undefined;      // Pas de paramètre nécessaire
    Main: undefined;       // C'est l'écran qui contient les onglets (pas de paramètre)
    Detail: { interventionId: number }; // 🚨 OBLIGATOIRE : Il faut un ID (nombre) pour aller ici
    Inventaires: undefined; // Pas de paramètre
};

// 2. La liste de tes onglets (Tab)
export type TabParamList = {
    Dashboard: undefined;
    Missions: undefined;
    Archives: undefined;
    Profil: undefined;
};
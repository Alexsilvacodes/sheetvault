export type Locale = 'en' | 'es';

export const translations = {
  en: {
    // App
    appName: 'SheetVault',
    tagline: 'Your RPG character sheets, anywhere.',

    // Auth
    enterUsername: 'Enter your username',
    username: 'Username',
    usernamePlaceholder: 'username',
    continue: 'Continue',
    loading: 'Loading...',
    noPasswordNeeded: 'No password needed. Just enter a username to get started.',
    pleaseEnterUsername: 'Please enter a username',
    failedToLogin: 'Failed to login',
    logout: 'Logout',

    // Navigation
    mySheets: 'My Sheets',
    allSheets: 'All Sheets',
    templates: 'Templates',

    // Role
    player: 'Player',
    master: 'Master',

    // Sheets
    newSheet: 'New Sheet',
    noSheets: "You don't have any character sheets yet.",
    createFirstSheet: 'Create your first sheet',
    deleteSheet: 'Delete sheet',
    confirmDelete: 'Are you sure you want to delete this sheet?',
    failedToDelete: 'Failed to delete sheet',
    updated: 'Updated',
    saving: 'Saving...',
    saved: 'Saved',

    // Templates
    chooseTemplate: 'Choose a Template',
    noTemplates: 'No templates available yet.',
    createNew: 'Create a new',
    characterSheet: 'character sheet',

    // Create sheet modal
    newCharacter: 'New {template} Character',
    characterName: 'Character Name',
    enterCharacterName: 'Enter character name',
    cancel: 'Cancel',
    create: 'Create',
    creating: 'Creating...',
    failedToCreate: 'Failed to create sheet',

    // Create sheet modal (crew)
    newCrew: 'New {template} Crew',
    crewName: 'Crew Name',
    enterCrewName: 'Enter crew name',

    // Crew sheet
    crewInfo: 'Crew Info',
    crewType: 'Crew Type',
    selectCrewType: 'Select crew type...',
    reputation: 'Reputation',
    reputationPlaceholder: 'Ambitious, Brutal, Daring...',
    tier: 'Tier',
    hold: 'Hold',
    holdWeak: 'Weak',
    holdStrong: 'Strong',
    repAndHeat: 'Rep & Heat',
    rep: 'Rep',
    heat: 'Heat',
    wantedLevel: 'Wanted Level',
    coinAndVaults: 'Coin & Vaults',
    vaults: 'Vaults',
    crewXp: 'Crew XP',
    crewUpgrades: 'Crew Upgrades',
    lairUpgrades: 'Lair Upgrades',
    territoryClaims: 'Territory Claims',
    huntingGrounds: 'Hunting Grounds',
    cohorts: 'Cohorts',
    cohort: 'Cohort',
    addCohort: 'Add Cohort',
    remove: 'Remove',
    cohortType: 'Type',
    selectCohortType: 'Select type...',
    edge: 'Edge',
    flaw: 'Flaw',
    quality: 'Quality',
    factionStanding: 'Faction Standing',
    deity: 'Deity',
    deityName: 'Deity Name',
    deityCharacteristics: 'Characteristics',
    vehicle: 'Vehicle',
    vehicleAdvantages: 'Advantages',
    vehicleDefects: 'Defects',
    contacts: 'Contacts',
    crewMembers: 'Crew Members',
    noMembers: 'No characters have joined this crew yet.',

    // Character sheet
    characterInfo: 'Character Info',
    name: 'Name',
    alias: 'Alias',
    playbook: 'Playbook',
    selectPlaybook: 'Select playbook...',
    crew: 'Crew',
    heritage: 'Heritage',
    selectHeritage: 'Select heritage...',
    background: 'Background',
    selectBackground: 'Select background...',
    vice: 'Vice',
    selectVice: 'Select vice...',
    vicePurveyor: 'Vice Purveyor',
    look: 'Look',

    // Actions
    actions: 'Actions',

    // Stress & Trauma
    stressAndTrauma: 'Stress & Trauma',
    stress: 'Stress',
    trauma: 'Trauma',
    traumaConditions: 'Trauma Conditions',

    // Harm
    harm: 'Harm',
    harmLevel3: 'Level 3 - Fatal',
    harmLevel2: 'Level 2 - Serious',
    harmLevel1: 'Level 1 - Minor',
    needHelp: 'Need help',
    reducedEffect: 'Reduced effect',
    needFatal: 'Need fatal',
    healingClock: 'Healing',
    armor: 'Armor',
    heavy: 'Heavy',
    special: 'Special',

    // XP
    experience: 'Experience',
    insightXp: 'Insight XP',
    prowessXp: 'Prowess XP',
    resolveXp: 'Resolve XP',
    playbookXp: 'Playbook XP',
    xpTrigger: 'XP Trigger',
    nextCost: 'Next cost',

    // Special Abilities
    specialAbilities: 'Special Abilities',

    // Items & Load
    itemsAndLoad: 'Items & Load',
    sharedItems: 'Shared Items',
    playbookItems: 'Playbook Items',
    loadLevel: 'Load Level',
    currentLoad: 'Current Load',

    // Coin & Stash
    coinAndStash: 'Coin & Stash',
    coin: 'Coin',
    stash: 'Stash',

    // Friends & Rivals
    friendsAndRivals: 'Friends & Rivals',
    friends: 'Friends',
    rivals: 'Rivals',
    closeFriend: 'Close friend',
    rival: 'Rival',
    customContacts: 'Custom Contacts',
    addFriend: 'Add Friend',
    addRival: 'Add Rival',
    contactName: 'Name',
    contactDescription: 'Description',

    // Gather Info
    gatherInfo: 'Gather Info',

    // Custom Clocks
    customClocks: 'Custom Clocks',
    addClock: 'Add Clock',
    clockDescription: 'Description...',
    segments: 'Segments',

    // Notes
    notes: 'Notes',
    notesPlaceholder: 'Character notes, session logs, etc.',

    // Crew selection
    selectCrew: 'Select crew...',
    noCrew: 'No crew',

    // Sharing & permissions
    sharedWithYou: 'Shared',
    crewMember: 'Crew',
    viewOnly: 'View only',
    share: 'Share',
    shareSheet: 'Share Sheet',
    shareWithUser: 'Share with user',
    enterUsernameToShare: 'Enter username to share with',
    sharedWith: 'Shared with',
    removeShare: 'Remove',
    noShares: 'Not shared with anyone yet.',
    shareSuccess: 'Sheet shared successfully',
    shareError: 'Failed to share sheet',
    userNotFound: 'User not found',
    cannotShareWithSelf: 'Cannot share with yourself',
    alreadyShared: 'Already shared with this user',
    viewOnlyBanner: 'You are viewing this sheet in read-only mode.',
    crewEditBanner: 'You are editing this sheet as a crew member.',
    close: 'Close',
    owner: 'Owner',

    // Language
    language: 'Language',
    english: 'English',
    spanish: 'Spanish'
  },

  es: {
    // App
    appName: 'SheetVault',
    tagline: 'Tus hojas de personaje, en cualquier lugar.',

    // Auth
    enterUsername: 'Introduce tu nombre de usuario',
    username: 'Usuario',
    usernamePlaceholder: 'usuario',
    continue: 'Continuar',
    loading: 'Cargando...',
    noPasswordNeeded: 'Sin contraseña. Solo introduce un nombre de usuario para empezar.',
    pleaseEnterUsername: 'Por favor, introduce un nombre de usuario',
    failedToLogin: 'Error al iniciar sesión',
    logout: 'Cerrar sesión',

    // Navigation
    mySheets: 'Mis Hojas',
    allSheets: 'Todas las Hojas',
    templates: 'Plantillas',

    // Role
    player: 'Jugador',
    master: 'Máster',

    // Sheets
    newSheet: 'Nueva Hoja',
    noSheets: 'Aún no tienes hojas de personaje.',
    createFirstSheet: 'Crea tu primera hoja',
    deleteSheet: 'Eliminar hoja',
    confirmDelete: '¿Estás seguro de que quieres eliminar esta hoja?',
    failedToDelete: 'Error al eliminar la hoja',
    updated: 'Actualizado',
    saving: 'Guardando...',
    saved: 'Guardado',

    // Templates
    chooseTemplate: 'Elige una Plantilla',
    noTemplates: 'No hay plantillas disponibles todavía.',
    createNew: 'Crea una nueva hoja de',
    characterSheet: 'personaje',

    // Create sheet modal
    newCharacter: 'Nuevo Personaje de {template}',
    characterName: 'Nombre del Personaje',
    enterCharacterName: 'Introduce el nombre del personaje',
    cancel: 'Cancelar',
    create: 'Crear',
    creating: 'Creando...',
    failedToCreate: 'Error al crear la hoja',

    // Create sheet modal (crew)
    newCrew: 'Nueva Banda de {template}',
    crewName: 'Nombre de la Banda',
    enterCrewName: 'Introduce el nombre de la banda',

    // Crew sheet
    crewInfo: 'Info de la Banda',
    crewType: 'Tipo de Banda',
    selectCrewType: 'Selecciona tipo de banda...',
    reputation: 'Reputación',
    reputationPlaceholder: 'Ambiciosos, Brutales, Audaces...',
    tier: 'Nivel',
    hold: 'Control',
    holdWeak: 'Débil',
    holdStrong: 'Fuerte',
    repAndHeat: 'Rep y Calor',
    rep: 'Rep',
    heat: 'Calor',
    wantedLevel: 'Nivel de Búsqueda',
    coinAndVaults: 'Monedas y Bóvedas',
    vaults: 'Bóvedas',
    crewXp: 'XP de Banda',
    crewUpgrades: 'Mejoras de Banda',
    lairUpgrades: 'Mejoras de Guarida',
    territoryClaims: 'Reclamaciones de Territorio',
    huntingGrounds: 'Coto de Caza',
    cohorts: 'Cohortes',
    cohort: 'Cohorte',
    addCohort: 'Añadir Cohorte',
    remove: 'Eliminar',
    cohortType: 'Tipo',
    selectCohortType: 'Selecciona tipo...',
    edge: 'Ventaja',
    flaw: 'Defecto',
    quality: 'Calidad',
    factionStanding: 'Posición de Facciones',
    deity: 'Deidad',
    deityName: 'Nombre de la Deidad',
    deityCharacteristics: 'Características',
    vehicle: 'Vehículo',
    vehicleAdvantages: 'Ventajas',
    vehicleDefects: 'Defectos',
    contacts: 'Contactos',
    crewMembers: 'Miembros de la Banda',
    noMembers: 'Ningún personaje se ha unido a esta banda aún.',

    // Character sheet
    characterInfo: 'Info del Personaje',
    name: 'Nombre',
    alias: 'Alias',
    playbook: 'Libreto',
    selectPlaybook: 'Selecciona libreto...',
    crew: 'Banda',
    heritage: 'Legado',
    selectHeritage: 'Selecciona legado...',
    background: 'Antecedentes',
    selectBackground: 'Selecciona antecedentes...',
    vice: 'Vicio',
    selectVice: 'Selecciona vicio...',
    vicePurveyor: 'Proveedor de Vicio',
    look: 'Apariencia',

    // Actions
    actions: 'Acciones',

    // Stress & Trauma
    stressAndTrauma: 'Estrés y Trauma',
    stress: 'Estrés',
    trauma: 'Trauma',
    traumaConditions: 'Condiciones de Trauma',

    // Harm
    harm: 'Daño',
    harmLevel3: 'Nivel 3 - Fatal',
    harmLevel2: 'Nivel 2 - Grave',
    harmLevel1: 'Nivel 1 - Leve',
    needHelp: 'Necesitas ayuda',
    reducedEffect: 'Efecto reducido',
    needFatal: 'Necesita fatal',
    healingClock: 'Curación',
    armor: 'Protección',
    heavy: 'Pesada',
    special: 'Especial',

    // XP
    experience: 'Experiencia',
    insightXp: 'XP Perspicacia',
    prowessXp: 'XP Destreza',
    resolveXp: 'XP Voluntad',
    playbookXp: 'XP Libreto',
    xpTrigger: 'Disparador de XP',
    nextCost: 'Próximo coste',

    // Special Abilities
    specialAbilities: 'Capacidades Especiales',

    // Items & Load
    itemsAndLoad: 'Objetos y Carga',
    sharedItems: 'Objetos Compartidos',
    playbookItems: 'Objetos del Libreto',
    loadLevel: 'Nivel de Carga',
    currentLoad: 'Carga Actual',

    // Coin & Stash
    coinAndStash: 'Monedas y Depósito',
    coin: 'Monedas',
    stash: 'Depósito',

    // Friends & Rivals
    friendsAndRivals: 'Amigos y Rivales',
    friends: 'Amigos',
    rivals: 'Rivales',
    closeFriend: 'Amigo cercano',
    rival: 'Rival',
    customContacts: 'Contactos Personalizados',
    addFriend: 'Añadir Amigo',
    addRival: 'Añadir Rival',
    contactName: 'Nombre',
    contactDescription: 'Descripción',

    // Gather Info
    gatherInfo: 'Buscar Información',

    // Custom Clocks
    customClocks: 'Relojes Personalizados',
    addClock: 'Añadir Reloj',
    clockDescription: 'Descripción...',
    segments: 'Segmentos',

    // Notes
    notes: 'Notas',
    notesPlaceholder: 'Notas del personaje, registros de sesión, etc.',

    // Crew selection
    selectCrew: 'Seleccionar banda...',
    noCrew: 'Sin banda',

    // Sharing & permissions
    sharedWithYou: 'Compartido',
    crewMember: 'Banda',
    viewOnly: 'Solo lectura',
    share: 'Compartir',
    shareSheet: 'Compartir Hoja',
    shareWithUser: 'Compartir con usuario',
    enterUsernameToShare: 'Introduce el nombre de usuario',
    sharedWith: 'Compartido con',
    removeShare: 'Eliminar',
    noShares: 'Aún no se ha compartido con nadie.',
    shareSuccess: 'Hoja compartida con éxito',
    shareError: 'Error al compartir la hoja',
    userNotFound: 'Usuario no encontrado',
    cannotShareWithSelf: 'No puedes compartir contigo mismo',
    alreadyShared: 'Ya está compartido con este usuario',
    viewOnlyBanner: 'Estás viendo esta hoja en modo de solo lectura.',
    crewEditBanner: 'Estás editando esta hoja como miembro de la banda.',
    close: 'Cerrar',
    owner: 'Propietario',

    // Language
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español'
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

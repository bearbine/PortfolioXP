// Centralna mapa assetow.
// Dzieki temu ścieżki do ikon, tapet i dźwiękow nie sa rozsypane po calym kodzie.
// Jedna mapa assetow. Jak zmienia sie ścieżka pliku, poprawiam tutaj i reszta projektu żyje.
export const ASSETS = Object.freeze({
  boot: Object.freeze({
    progressChunk: "/assets/ekran_startowy/progress-chunk.png"
  }),
  branding: Object.freeze({
    xpProductLogoHq: "/assets/ekran_startowy/branding/xp-product-logo-hq.png"
  }),
  login: Object.freeze({
    miniLogo: "/assets/logowanie/mini-logo.png",
    accountDialogLogo: "/assets/logowanie/account-dialog-logo.png",
    accountDialogWordmark: "/assets/logowanie/account-dialog-wordmark.png",
    accountDialogIcon: "/assets/logowanie/account-dialog-icon.png",
    goButton: "/assets/logowanie/go-button.png",
    hintButton: "/assets/logowanie/hint-button.png",
    shutdownButton: "/assets/logowanie/shutdown-button.png",
    error: "/assets/logowanie/error.png"
  }),
  power: Object.freeze({
    windowsOff: "/assets/interfejs/zasilanie/windows-off.png",
    standBy: "/assets/interfejs/zasilanie/turn-off.png",
    turnOff: "/assets/interfejs/zasilanie/turn-off.png",
    restart: "/assets/interfejs/zasilanie/restart.ico",
    switchUser: "/assets/interfejs/zasilanie/switch-user.png",
    logOff: "/assets/interfejs/zasilanie/logoff.png"
  }),
  icons: Object.freeze({
    myComputer: "/assets/ikony/my-computer.png",
    myDocuments: "/assets/ikony/my-documents.png",
    recycleBinEmpty: "/assets/ikony/recycle-bin-empty.png",
    recycleBinFull: "/assets/ikony/recycle-bin-full.png",
    internetExplorer: "/assets/ikony/internet-explorer.png",
    notepad: "/assets/ikony/notepad.png",
    paint: "/assets/ikony/paint.png",
    controlPanel: "/assets/ikony/control-panel.png",
    settings: "/assets/ikony/settings.png",
    run: "/assets/ikony/run.png",
    help: "/assets/ikony/help.png",
    folder: "/assets/ikony/folder.png",
    hardDrive: "/assets/ikony/hard-drive.png",
    network: "/assets/ikony/network.png",
    wyloguj: "/assets/ikony/logoff.png",
    wylaczKomputer: "/assets/ikony/shutdown.png",
    volumeOn: "/assets/ikony/volume-on.png"
  }),
  cursors: Object.freeze({
    arrow: "/assets/kursory/arrow.png",
    hand: "/assets/kursory/hand.png",
    text: "/assets/kursory/text-select.png",
    move: "/assets/kursory/move.png",
    resizeH: "/assets/kursory/resize-h.png",
    resizeV: "/assets/kursory/resize-v.png",
    resizeNwSe: "/assets/kursory/resize-nw-se.png",
    resizeSwNe: "/assets/kursory/resize-sw-ne.png",
    busy: "/assets/kursory/busy.png",
    unavailable: "/assets/kursory/unavailable.png"
  }),
  sounds: Object.freeze({
    startup: Object.freeze({ ogg: "/assets/dzwieki/startup.ogg", wav: "/assets/dzwieki/startup.wav" }),
    wylaczKomputer: Object.freeze({ ogg: "/assets/dzwieki/shutdown.ogg", wav: "/assets/dzwieki/shutdown.wav" }),
    logon: Object.freeze({ ogg: "/assets/dzwieki/logon.ogg", wav: "/assets/dzwieki/logon.wav" }),
    wyloguj: Object.freeze({ ogg: "/assets/dzwieki/logoff.ogg", wav: "/assets/dzwieki/logoff.wav" }),
    menuCommand: Object.freeze({ ogg: "/assets/dzwieki/menu-command.ogg", wav: "/assets/dzwieki/menu-command.wav" }),
    click: Object.freeze({ ogg: "/assets/dzwieki/ding.ogg", wav: "/assets/dzwieki/ding.wav" }),
    select: Object.freeze({ ogg: "/assets/dzwieki/start.ogg", wav: "/assets/dzwieki/start.wav" }),
    error: Object.freeze({ ogg: "/assets/dzwieki/error.ogg", wav: "/assets/dzwieki/error.wav" }),
    notification: Object.freeze({ ogg: "/assets/dzwieki/notify.ogg", wav: "/assets/dzwieki/notify.wav" }),
    windowOpen: Object.freeze({ ogg: "/assets/dzwieki/default.ogg", wav: "/assets/dzwieki/default.wav" }),
    windowClose: Object.freeze({ ogg: "/assets/dzwieki/restore.ogg", wav: "/assets/dzwieki/restore.wav" }),
    minimize: Object.freeze({ ogg: "/assets/dzwieki/minimize.ogg", wav: "/assets/dzwieki/minimize.wav" }),
    restore: Object.freeze({ ogg: "/assets/dzwieki/restore.ogg", wav: "/assets/dzwieki/restore.wav" })
  }),
  systemUi: Object.freeze({
    startFlag: "/assets/interfejs/pasek_zadan/start-flag.png",
    przyciskStart: "/assets/interfejs/pasek_zadan/start.png",
    xpTrayVolume: "/assets/interfejs/pasek_zadan/tray-volume.png",
    xpTrayDevice: "/assets/interfejs/pasek_zadan/tray-device.png",
    xpTrayRisk: "/assets/interfejs/pasek_zadan/tray-risk.png",
    xpTrayHelp: "/assets/interfejs/pasek_zadan/tray-help.png",
    trayVolume: "/assets/interfejs/pasek_zadan/tray-volume.png",
    trayNetwork: "/assets/interfejs/pasek_zadan/tray-network.png",
    trayNotification: "/assets/interfejs/pasek_zadan/tray-notification.png",
    trayBattery: "/assets/interfejs/pasek_zadan/tray-battery.png"
  }),
  menuStart: Object.freeze({
    internet: "/assets/interfejs/menu_start/internet.png",
    email: "/assets/interfejs/menu_start/email.png",
    minesweeper: "/assets/interfejs/menu_start/minesweeper.png",
    notepad: "/assets/interfejs/menu_start/notepad.png",
    winamp: "/assets/interfejs/menu_start/winamp.png",
    paint: "/assets/interfejs/menu_start/paint.png",
    mediaPlayer: "/assets/interfejs/menu_start/media-player.png",
    messenger: "/assets/interfejs/menu_start/messenger.png",
    myDocuments: "/assets/interfejs/menu_start/my-documents.png",
    recentDocuments: "/assets/interfejs/menu_start/recent-documents.png",
    myPictures: "/assets/interfejs/menu_start/my-pictures.png",
    myMusic: "/assets/interfejs/menu_start/my-music.png",
    myComputer: "/assets/interfejs/menu_start/my-computer.png",
    controlPanel: "/assets/interfejs/menu_start/control-panel.png",
    setAccess: "/assets/interfejs/menu_start/set-access.png",
    connectTo: "/assets/interfejs/menu_start/connect-to.png",
    printers: "/assets/interfejs/menu_start/printers.png",
    help: "/assets/interfejs/menu_start/help.png",
    search: "/assets/interfejs/menu_start/search.png",
    run: "/assets/interfejs/menu_start/run.png",
    wyloguj: "/assets/interfejs/menu_start/logoff.png",
    wylaczKomputer: "/assets/interfejs/menu_start/shutdown.png",
    allPrograms: "/assets/interfejs/menu_start/all-programs.ico",
    user: "/assets/interfejs/menu_start/user.png",
    submenu: "/assets/interfejs/menu_start/submenu.png",
    security: "/assets/interfejs/menu_start/security.png",
    systemInfo: "/assets/interfejs/menu_start/system-info.png",
    windowsUpdate: "/assets/interfejs/menu_start/windows-update.png",
    commandPrompt: "/assets/interfejs/menu_start/command-prompt.png",
    calculator: "/assets/interfejs/menu_start/calculator.png",
    wordpad: "/assets/interfejs/menu_start/wordpad.png",
    explorer: "/assets/interfejs/menu_start/explorer.png",
    network: "/assets/interfejs/menu_start/network.png",
    windowsCatalog: "/assets/interfejs/menu_start/windows-catalog.png",
    windowsUpdate16: "/assets/interfejs/menu_start/windows-update-16.png",
    accessibility: "/assets/interfejs/menu_start/accessibility.png",
    magnifier: "/assets/interfejs/menu_start/magnifier.png",
    narrator: "/assets/interfejs/menu_start/narrator.ico",
    keyboard: "/assets/interfejs/menu_start/keyboard.png",
    utilityManager: "/assets/interfejs/menu_start/utility-manager.png",
    hyperTerminal: "/assets/interfejs/menu_start/hyperterminal.png",
    networkConnections: "/assets/interfejs/menu_start/network-connections.png",
    networkSetupWizard: "/assets/interfejs/menu_start/network-setup-wizard.png",
    newConnectionWizard: "/assets/interfejs/menu_start/new-connection-wizard.png",
    wirelessSetup: "/assets/interfejs/menu_start/wireless-setup.png",
    soundRecorder: "/assets/interfejs/menu_start/sound-recorder.png",
    volumeControl: "/assets/interfejs/menu_start/volume-control.png",
    mediaPlayer16: "/assets/interfejs/menu_start/media-player-16.png",
    backup: "/assets/interfejs/menu_start/backup.png",
    characterMap: "/assets/interfejs/menu_start/character-map.png",
    diskCleanup: "/assets/interfejs/menu_start/disk-cleanup.png",
    diskDefragmenter: "/assets/interfejs/menu_start/disk-defragmenter.png",
    filesTransfer: "/assets/interfejs/menu_start/files-transfer.png",
    scheduledTasks: "/assets/interfejs/menu_start/scheduled-tasks.png",
    systemRestore: "/assets/interfejs/menu_start/system-restore.ico",
    addressBook: "/assets/interfejs/menu_start/address-book.png",
    programCompatibility: "/assets/interfejs/menu_start/program-compatibility.png",
    remoteDesktop: "/assets/interfejs/menu_start/remote-desktop.png",
    synchronize: "/assets/interfejs/menu_start/synchronize.png",
    tourWindowsXp: "/assets/interfejs/menu_start/tour-windows-xp.png",
    windowsExplorer16: "/assets/interfejs/menu_start/windows-explorer-16.png",
    freecell: "/assets/interfejs/menu_start/freecell.png",
    hearts: "/assets/interfejs/menu_start/hearts.png",
    internetBackgammon: "/assets/interfejs/menu_start/internet-backgammon.png",
    internetCheckers: "/assets/interfejs/menu_start/internet-checkers.png",
    internetHearts: "/assets/interfejs/menu_start/internet-hearts.png",
    internetReversi: "/assets/interfejs/menu_start/internet-reversi.png",
    internetSpades: "/assets/interfejs/menu_start/internet-spades.png",
    pinball: "/assets/interfejs/menu_start/pinball.png",
    solitaire: "/assets/interfejs/menu_start/solitaire.png",
    spiderSolitaire: "/assets/interfejs/menu_start/spider-solitaire.png",
    outlookExpress16: "/assets/interfejs/menu_start/outlook-express-16.png",
    remoteAssistance: "/assets/interfejs/menu_start/remote-assistance.png",
    movieMaker: "/assets/interfejs/menu_start/movie-maker.png",
    minesweeper16: "/assets/interfejs/menu_start/minesweeper-16.png",
    empty: "/assets/interfejs/menu_start/empty.png"
  })
});

export const WALLPAPERS = Object.freeze([
  { id: "bliss", label: "Bliss", path: "/assets/tapety/bliss.jpg", optimizedPath: "/assets/tapety/bliss.avif", fit: "cover" },
  { id: "azul", label: "Azul", path: "/assets/tapety/azul.jpg", optimizedPath: "/assets/tapety/azul.avif", fit: "cover" },
  { id: "autumn", label: "Autumn", path: "/assets/tapety/autumn.jpg", optimizedPath: "/assets/tapety/autumn.avif", fit: "cover" },
  { id: "crystal", label: "Crystal", path: "/assets/tapety/crystal.jpg", optimizedPath: "/assets/tapety/crystal.avif", fit: "cover" },
  { id: "tulips", label: "Tulips", path: "/assets/tapety/tulips.jpg", optimizedPath: "/assets/tapety/tulips.avif", fit: "cover" },
  { id: "wind", label: "Wind", path: "/assets/tapety/wind.jpg", optimizedPath: "/assets/tapety/wind.avif", fit: "cover" }
]);

export const AVATARS = Object.freeze([
  { id: "guest", label: "Default", path: "/assets/logowanie/avatars/guest.jpg" },
  { id: "kick", label: "Kick", path: "/assets/logowanie/avatars/kick.jpg" },
  { id: "chess", label: "Chess", path: "/assets/logowanie/avatars/chess.jpg" },
  { id: "dog", label: "Dog", path: "/assets/logowanie/avatars/dog.jpg" },
  { id: "cat", label: "Cat", path: "/assets/logowanie/avatars/cat.jpg" },
  { id: "duck", label: "Duck", path: "/assets/logowanie/avatars/duck.jpg" },
  { id: "fish", label: "Fish", path: "/assets/logowanie/avatars/fish.jpg" },
  { id: "airplane", label: "Airplane", path: "/assets/logowanie/avatars/airplane.jpg" },
  { id: "astronaut", label: "Astronaut", path: "/assets/logowanie/avatars/astronaut.jpg" },
  { id: "ball", label: "Ball", path: "/assets/logowanie/avatars/ball.jpg" },
  { id: "beach", label: "Beach", path: "/assets/logowanie/avatars/beach.jpg" },
  { id: "car", label: "Car", path: "/assets/logowanie/avatars/car.jpg" },
  { id: "drip", label: "Drip", path: "/assets/logowanie/avatars/drip.jpg" },
  { id: "guitar", label: "Guitar", path: "/assets/logowanie/avatars/guitar.jpg" },
  { id: "lift-off", label: "Lift-off", path: "/assets/logowanie/avatars/lift-off.jpg" },
  { id: "red-flower", label: "Red flower", path: "/assets/logowanie/avatars/red-flower.jpg" },
  { id: "snowflake", label: "Snowflake", path: "/assets/logowanie/avatars/snowflake.jpg" }
]);

export const THEMES = Object.freeze([
  { id: "luna-blue", label: "Windows XP Blue" },
  { id: "luna-olive", label: "Olive Green" },
  { id: "luna-silver", label: "Silver" }
]);

export function getWallpaper(id) {
  return WALLPAPERS.find((wallpaper) => wallpaper.id === id) || WALLPAPERS[0];
}

export function wallpaperBackgroundImage(wallpaper) {
  const item = wallpaper || WALLPAPERS[0];
  if (item.optimizedPath) {
    return `image-set(url("${item.optimizedPath}") type("image/avif"), url("${item.path}") type("image/jpeg"))`;
  }
  return `url("${item.path}")`;
}

export function getAvatar(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}

export function isKnownTheme(id) {
  return THEMES.some((theme) => theme.id === id);
}

export function safeAssetPath(path) {
  return typeof path === "string" && path.length > 0 ? path : "";
}

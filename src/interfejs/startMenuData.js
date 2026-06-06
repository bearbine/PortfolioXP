// Dane menu Start.
// Latwiej dopisywac pozycje tutaj niz grzebac w samym renderowaniu menu.
import { ASSETS } from "../konfiguracja/assets.js";

export const LEFT_MENU_ITEMS = Object.freeze([
  {
    id: "internet",
    label: "Internet",
    subLabel: "Internet Explorer",
    icon: ASSETS.menuStart.internet,
    appId: "internet-explorer",
    strong: true
  },
  {
    id: "email",
    label: "E-mail",
    subLabel: "Outlook Express",
    icon: ASSETS.menuStart.email,
    placeholder: "Outlook Express is not implemented yet.",
    strong: true
  },
  { type: "separator" },
  { id: "minesweeper", label: "Minesweeper", icon: ASSETS.menuStart.minesweeper, placeholder: "Minesweeper is planned for a later desktop expansion." },
  { id: "notepad", label: "Notepad", icon: ASSETS.menuStart.notepad, appId: "notepad" },
  { id: "winamp", label: "Winamp", icon: ASSETS.menuStart.winamp, placeholder: "Winamp is not implemented yet." },
  { id: "paint", label: "Paint", icon: ASSETS.menuStart.paint, appId: "paint" },
  { id: "media-player", label: "Windows Media Player", icon: ASSETS.menuStart.mediaPlayer, placeholder: "Windows Media Player is not implemented yet." },
  { id: "messenger", label: "Windows Messenger", icon: ASSETS.menuStart.messenger, placeholder: "Windows Messenger is not implemented yet." },
  { type: "spacer" },
  { type: "separator" },
  {
    id: "all-programs",
    label: "All Programs",
    icon: ASSETS.menuStart.empty,
    arrowIcon: ASSETS.menuStart.allPrograms,
    strong: true,
    submenu: "allPrograms"
  }
]);

export const RIGHT_MENU_ITEMS = Object.freeze([
  { id: "my-documents", label: "My Documents", icon: ASSETS.menuStart.myDocuments, appId: "my-documents", strong: true },
  { id: "recent-documents", label: "My Recent Documents", icon: ASSETS.menuStart.recentDocuments, strong: true, submenu: "recentDocuments" },
  { id: "my-pictures", label: "My Pictures", icon: ASSETS.menuStart.myPictures, placeholder: "My Pictures folder is not implemented yet.", strong: true },
  { id: "my-music", label: "My Music", icon: ASSETS.menuStart.myMusic, placeholder: "My Music folder is not implemented yet.", strong: true },
  { id: "my-computer", label: "My Computer", icon: ASSETS.menuStart.myComputer, appId: "my-computer", strong: true },
  { type: "separator" },
  { id: "control-panel", label: "Control Panel", icon: ASSETS.menuStart.controlPanel, appId: "control-panel" },
  { id: "set-access", label: "Set Program Access and Defaults", icon: ASSETS.menuStart.setAccess, placeholder: "Set Program Access and Defaults is not implemented yet." },
  { id: "connect-to", label: "Connect To", icon: ASSETS.menuStart.connectTo, submenu: "connectTo" },
  { id: "printers", label: "Printers and Faxes", icon: ASSETS.menuStart.printers, placeholder: "Printers and Faxes is not implemented yet." },
  { type: "separator" },
  { id: "help", label: "Help and Support", icon: ASSETS.menuStart.help, appId: "help" },
  { id: "search", label: "Search", icon: ASSETS.menuStart.search, placeholder: "Search Companion is not implemented yet." },
  { id: "run", label: "Run...", icon: ASSETS.menuStart.run, appId: "run" }
]);

export const SUBMENUS = Object.freeze({
  recentDocuments: Object.freeze([
    { id: "empty-recent", label: "(Empty)", icon: ASSETS.menuStart.empty, disabled: true }
  ]),
  connectTo: Object.freeze([
    { id: "msn", label: "MSN", icon: ASSETS.menuStart.messenger, placeholder: "MSN connection is not implemented yet." },
    { id: "show-connections", label: "Show all connections", icon: ASSETS.menuStart.networkConnections, placeholder: "Network Connections is not implemented yet." }
  ]),
  allPrograms: Object.freeze([
    { id: "set-access-program", label: "Set Program Access and Defaults", icon: ASSETS.menuStart.setAccess, placeholder: "Set Program Access and Defaults is not implemented yet." },
    { id: "windows-catalog", label: "Windows Catalog", icon: ASSETS.menuStart.windowsCatalog, placeholder: "Windows Catalog is not implemented yet." },
    { id: "windows-update", label: "Windows Update", icon: ASSETS.menuStart.windowsUpdate16, placeholder: "Windows Update is not available right now." },
    { type: "separator" },
    {
      id: "accessories",
      label: "Accessories",
      icon: ASSETS.menuStart.submenu,
      submenuItems: Object.freeze([
        {
          id: "accessibility",
          label: "Accessibility",
          icon: ASSETS.menuStart.submenu,
          submenuItems: Object.freeze([
            { id: "accessibility-wizard", label: "Accessibility Wizard", icon: ASSETS.menuStart.accessibility, placeholder: "Accessibility Wizard is not implemented yet." },
            { id: "magnifier", label: "Magnifier", icon: ASSETS.menuStart.magnifier, placeholder: "Magnifier is not implemented yet." },
            { id: "narrator", label: "Narrator", icon: ASSETS.menuStart.narrator, placeholder: "Narrator is not implemented yet." },
            { id: "on-screen-keyboard", label: "On-Screen Keyboard", icon: ASSETS.menuStart.keyboard, placeholder: "On-Screen Keyboard is not implemented yet." },
            { id: "utility-manager", label: "Utility Manager", icon: ASSETS.menuStart.utilityManager, placeholder: "Utility Manager is not implemented yet." }
          ])
        },
        {
          id: "communications",
          label: "Communications",
          icon: ASSETS.menuStart.submenu,
          submenuItems: Object.freeze([
            { id: "hyper-terminal", label: "HyperTerminal", icon: ASSETS.menuStart.hyperTerminal, placeholder: "HyperTerminal is not implemented yet." },
            { id: "network-connections", label: "Network Connections", icon: ASSETS.menuStart.networkConnections, placeholder: "Network Connections is not implemented yet." },
            { id: "network-setup", label: "Network Setup Wizard", icon: ASSETS.menuStart.networkSetupWizard, placeholder: "Network Setup Wizard is not implemented yet." },
            { id: "new-connection", label: "New Connection Wizard", icon: ASSETS.menuStart.newConnectionWizard, placeholder: "New Connection Wizard is not implemented yet." },
            { id: "wireless-setup", label: "Wireless Network Setup Wizard", icon: ASSETS.menuStart.wirelessSetup, placeholder: "Wireless Network Setup Wizard is not implemented yet." }
          ])
        },
        {
          id: "entertainment",
          label: "Entertainment",
          icon: ASSETS.menuStart.submenu,
          submenuItems: Object.freeze([
            { id: "sound-recorder", label: "Sound Recorder", icon: ASSETS.menuStart.soundRecorder, placeholder: "Sound Recorder is not implemented yet." },
            { id: "volume-control", label: "Volume Control", icon: ASSETS.menuStart.volumeControl, placeholder: "Volume Control is represented by the taskbar zasobnik popup." },
            { id: "media-player-entertainment", label: "Windows Media Player", icon: ASSETS.menuStart.mediaPlayer16, placeholder: "Windows Media Player is not implemented yet." }
          ])
        },
        {
          id: "system-tools",
          label: "System Tools",
          icon: ASSETS.menuStart.submenu,
          submenuItems: Object.freeze([
            { id: "backup", label: "Backup", icon: ASSETS.menuStart.backup, placeholder: "Backup is not implemented yet." },
            { id: "character-map", label: "Character Map", icon: ASSETS.menuStart.characterMap, placeholder: "Character Map is not implemented yet." },
            { id: "disk-cleanup", label: "Disk Cleanup", icon: ASSETS.menuStart.diskCleanup, placeholder: "Disk Cleanup is not implemented yet." },
            { id: "disk-defragmenter", label: "Disk Defragmenter", icon: ASSETS.menuStart.diskDefragmenter, placeholder: "Disk Defragmenter is not implemented yet." },
            { id: "files-transfer", label: "Files and Settings Transfer Wizard", icon: ASSETS.menuStart.filesTransfer, placeholder: "Files and Settings Transfer Wizard is not implemented yet." },
            { id: "scheduled-tasks", label: "Scheduled Tasks", icon: ASSETS.menuStart.scheduledTasks, placeholder: "Scheduled Tasks is not implemented yet." },
            { id: "security-event-viewer", label: "Security Event Viewer", icon: ASSETS.menuStart.security, appId: "security-event-viewer" },
            { id: "security-center", label: "Security Center", icon: ASSETS.menuStart.security, placeholder: "Security Center is represented by the project audit system." },
            { id: "system-information", label: "System Information", icon: ASSETS.menuStart.systemInfo, placeholder: "System Information is not implemented yet." },
            { id: "system-restore", label: "System Restore", icon: ASSETS.menuStart.systemRestore, placeholder: "System Restore is not implemented yet." }
          ])
        },
        { id: "address-book", label: "Address Book", icon: ASSETS.menuStart.addressBook, placeholder: "Address Book is not implemented yet." },
        { id: "command-prompt", label: "Command Prompt", icon: ASSETS.menuStart.commandPrompt, placeholder: "Command Prompt is not implemented yet." },
        { id: "notepad-program", label: "Notepad", icon: ASSETS.menuStart.notepad, appId: "notepad" },
        { id: "paint-program", label: "Paint", icon: ASSETS.menuStart.paint, appId: "paint" },
        { id: "calculator", label: "Calculator", icon: ASSETS.menuStart.calculator, placeholder: "Calculator is not implemented yet." },
        { id: "program-compatibility", label: "Program Compatibility Wizard", icon: ASSETS.menuStart.programCompatibility, placeholder: "Program Compatibility Wizard is not implemented yet." },
        { id: "remote-desktop", label: "Remote Desktop Connection", icon: ASSETS.menuStart.remoteDesktop, placeholder: "Remote Desktop Connection is not implemented yet." },
        { id: "synchronize", label: "Synchronize", icon: ASSETS.menuStart.synchronize, placeholder: "Synchronize is not implemented yet." },
        { id: "tour-windows-xp", label: "Tour Windows XP", icon: ASSETS.menuStart.tourWindowsXp, placeholder: "Tour Windows XP is not implemented yet." },
        { id: "windows-explorer", label: "Windows Explorer", icon: ASSETS.menuStart.windowsExplorer16, appId: "my-computer" },
        { id: "wordpad", label: "WordPad", icon: ASSETS.menuStart.wordpad, placeholder: "WordPad is not implemented yet." }
      ])
    },
    {
      id: "games",
      label: "Games",
      icon: ASSETS.menuStart.submenu,
      submenuItems: Object.freeze([
        { id: "freecell", label: "FreeCell", icon: ASSETS.menuStart.freecell, placeholder: "FreeCell is not implemented yet." },
        { id: "hearts", label: "Hearts", icon: ASSETS.menuStart.hearts, placeholder: "Hearts is not implemented yet." },
        { id: "internet-backgammon", label: "Internet Backgammon", icon: ASSETS.menuStart.internetBackgammon, placeholder: "Internet Backgammon is not implemented yet." },
        { id: "internet-checkers", label: "Internet Checkers", icon: ASSETS.menuStart.internetCheckers, placeholder: "Internet Checkers is not implemented yet." },
        { id: "internet-hearts", label: "Internet Hearts", icon: ASSETS.menuStart.internetHearts, placeholder: "Internet Hearts is not implemented yet." },
        { id: "internet-reversi", label: "Internet Reversi", icon: ASSETS.menuStart.internetReversi, placeholder: "Internet Reversi is not implemented yet." },
        { id: "internet-spades", label: "Internet Spades", icon: ASSETS.menuStart.internetSpades, placeholder: "Internet Spades is not implemented yet." },
        { id: "minesweeper-program", label: "Minesweeper", icon: ASSETS.menuStart.minesweeper16, placeholder: "Minesweeper is planned for a later desktop expansion." },
        { id: "pinball", label: "Pinball", icon: ASSETS.menuStart.pinball, placeholder: "Pinball is not implemented yet." },
        { id: "solitaire", label: "Solitaire", icon: ASSETS.menuStart.solitaire, placeholder: "Solitaire is not implemented yet." },
        { id: "spider-solitaire", label: "Spider Solitaire", icon: ASSETS.menuStart.spiderSolitaire, placeholder: "Spider Solitaire is not implemented yet." }
      ])
    },
    {
      id: "startup",
      label: "Startup",
      icon: ASSETS.menuStart.submenu,
      submenuItems: Object.freeze([
        { id: "startup-empty", label: "(Empty)", icon: ASSETS.menuStart.empty, disabled: true }
      ])
    },
    { id: "internet-program", label: "Internet Explorer", icon: ASSETS.menuStart.internet, appId: "internet-explorer" },
    { id: "outlook-express-program", label: "Outlook Express", icon: ASSETS.menuStart.outlookExpress16, placeholder: "Outlook Express is not implemented yet." },
    { id: "remote-assistance", label: "Remote Assistance", icon: ASSETS.menuStart.remoteAssistance, placeholder: "Remote Assistance is not implemented yet." },
    { id: "media-player-program", label: "Windows Media Player", icon: ASSETS.menuStart.mediaPlayer16, placeholder: "Windows Media Player is not implemented yet." },
    { id: "messenger-program", label: "Windows Messenger", icon: ASSETS.menuStart.messenger, placeholder: "Windows Messenger is not implemented yet." },
    { id: "movie-maker", label: "Windows Movie Maker", icon: ASSETS.menuStart.movieMaker, placeholder: "Windows Movie Maker is not implemented yet." }
  ])
});

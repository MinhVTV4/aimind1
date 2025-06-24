// --- SVG Icon Registry ---
// This object stores all SVG icons to keep the HTML clean.
const svgIcons = {
    google: '<svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.1 6.28C12.09 13.42 17.63 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 3.02-2.31 5.47-4.91 7.28l7.81 6.04C44.29 36.29 46.98 30.95 46.98 24.55z"/><path fill="#FBBC05" d="M10.66 28.14c-.58-1.74-.91-3.58-.91-5.48s.33-3.74.91-5.48l-8.1-6.28C.92 14.16 0 18.91 0 24s.92 9.84 2.56 13.22l8.1-6.08z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.81-6.04c-2.18 1.47-4.96 2.34-8.08 2.34-6.37 0-11.91-3.92-13.84-9.3l-8.1 6.28C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>',
    close: '<svg class="w-6 h-6 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',
    newPersona: '<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M13.5 4.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-2.5 5.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM10 12.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9zM10 16a6 6 0 100-12 6 6 0 000 12z" /></svg>',
    addSquare: '<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>',
    emptyPersona: '<svg class="w-16 h-16 text-blue-300 dark:text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" /></svg>',
    menu: '<svg class="w-6 h-6 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
    summarize: '<svg class="w-6 h-6 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h9.5a.75.75 0 010 1.5h-9.5a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>',
    addCircle: '<svg class="w-6 h-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>',
    moon: '<svg class="w-5 h-5 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>',
    sun: '<svg class="w-5 h-5 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.95a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clip-rule="evenodd"></path></svg>',
    logout: '<svg class="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>',
    arrowUp: '<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" /></svg>',
    showSuggestions: '<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M4,18h11c0.55,0,1-0.45,1-1v-2c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1v2C3,17.55,3.45,18,4,18z M3,7c0,0.55,0.45,1,1,1 h11c0.55,0,1-0.45,1-1V5c0-0.55-0.45-1-1-1H4C3.45,4,3,4.45,3,5V7z M4,13h11c0.55,0,1-0.45,1-1v-2c0-0.55-0.45-1-1-1H4 c-0.55,0-1,0.45-1,1v2C3,12.55,3.45,13,4,13z M19.5,4.5L19.5,4.5c0.47,0.47,0.47,1.23,0,1.7l-4.08,4.08 c-0.47,0.47-1.23,0.47-1.7,0l0,0c-0.47-0.47-0.47,1.23,0-1.7l4.08-4.08C18.27,4.03,19.03,4.03,19.5,4.5z M19.5,17.82 c0.47-0.47,1.23-0.47,1.7,0l0,0c0.47,0.47,0.47,1.23,0,1.7l-4.08,4.08c-0.47,0.47-1.23,0.47-1.7,0l0,0c-0.47-0.47-0.47,1.23,0-1.7 L19.5,17.82z"/></g></g></svg>',
    info: '<svg class="w-6 h-6 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><path d="M0,0h24v24H0V0z" fill="none"/></g><g><g><path d="M11,7h2v2h-2V7z M11,11h2v6h-2V11z M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20 c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/></g></g></svg>',
    mic: '<svg class="w-6 h-6 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>',
    send: '<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z"/></svg>',
    sparkle: '<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 3zM3.05 4.29a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm12.84 1.06a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06-1.06l-1.06-1.06a.75.75 0 010-1.06zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM4.11 15.89a.75.75 0 011.06 0l1.06-1.06a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 010-1.06zM15.89 15.89a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM3 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 013 10zM15 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0115 10zM10 6a4 4 0 100 8 4 4 0 000-8z" clip-rule="evenodd" /></svg>',
    // Icons for dynamic elements
    aiAvatar: '<svg class="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6m0-2c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',
    note: '<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>',
    toastSuccess: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
    toastError: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
    toastInfo: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>',
    copy: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>',
    edit: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>',
    save: '<svg class="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>',
    pin: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428a1 1 0 00.475 0l5 1.428a1 1 0 001.17-1.409l-7-14z" /></svg>',
    unpin: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1.586l4.707 4.707a1 1 0 010 1.414l-4.707 4.707V17a1 1 0 11-2 0v-1.586l-4.707-4.707a1 1 0 010-1.414L4 6.586V5a1 1 0 011-1zm10 0a1 1 0 011 1v1.586l4.707 4.707a1 1 0 010 1.414l-4.707 4.707V17a1 1 0 11-2 0v-1.586l-4.707-4.707a1 1 0 010-1.414L14 6.586V5a1 1 0 011-1z" clip-rule="evenodd" /></svg>',
    delete: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>',
    spinner: '<svg class="w-6 h-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>',
    saveNote: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>',
    refAssistant: '<svg class="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M11,7h2v2h-2V7z M11,11h2v6h-2V11z M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20 c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/></g></g></svg>',
    emptyChat: '<svg class="w-12 h-12 text-gray-300 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.267c-.427.03-.848.06-1.274.089a7.5 7.5 0 0 1-6.044-2.258 7.5 7.5 0 0 1-6.044 2.258c-.427-.029-.848-.06-1.274-.089l-3.722-.267A2.101 2.101 0 0 1 2.25 14.894V10.607c0-.97.616-1.813 1.5-2.097L6.75 8.25m.75 12.75c.621 0 1.223-.041 1.824-.121a7.5 7.5 0 017.399 0A18.75 18.75 0 0 0 22.5 21V9.75l-3.75 1.5-3.75-1.5-3.75 1.5-3.75-1.5L2.25 9.75v11.25c.621 0 1.223-.041 1.824-.121a7.5 7.5 0 017.399 0A18.75 18.75 0 0016.5 21z" /></svg>'
};

/**
 * Loads all icons from the registry into their placeholder elements.
 * This function should be called once the DOM is fully loaded.
 */
function loadIcons() {
    document.querySelectorAll('[data-icon]').forEach(placeholder => {
        const iconName = placeholder.dataset.icon;
        if (svgIcons[iconName]) {
            // Replace the placeholder element with the SVG content.
            // This is more robust than setting innerHTML.
            const template = document.createElement('template');
            template.innerHTML = svgIcons[iconName];
            const svgElement = template.content.firstChild;
            placeholder.replaceWith(svgElement);
        }
    });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getAI, getGenerativeModel } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-ai.js";
import { getFirestore, collection, doc, addDoc, updateDoc, getDoc, getDocs, deleteDoc, serverTimestamp, query, orderBy, limit, startAfter, where } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Firebase config - Replace with your actual Firebase project configuration
const firebaseConfig = {
     apiKey: "AIzaSyBDUBufnsk1PQZTLYCJDqASMX8hEVHqkDc",
     authDomain: "aimind-2362a.firebaseapp.com",
     projectId: "aimind-2362a",
     storageBucket: "aimind-2362a.firebasestorage.app",
     messagingSenderId: "377635504319",
     appId: "1:377635504319:web:7c6dd3cf0c52dd302d860a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ai = getAI(app);
// Using gemini-2.5-flash for main and gemini-1.5-flash for faster, secondary tasks
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
const fastModel = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

// Global state variables
let currentUserId = null;
let currentUserName = '';
let currentChatId = null;
let chat; // Main chat session
let localHistory = []; // Stores the full conversation history
let isRecording = false;
let referenceChat; // Reference chat session for the assistant modal
let referenceHistory = [];
let isSummarizing = false;
let currentPersona = null; // Currently selected persona
let customPersonas = []; // User-defined personas
let activeSpeech = null; // Tracks current speech synthesis utterance
let lastVisibleChat = null; // For infinite scrolling of chat history
let isFetchingChats = false; // Flag to prevent multiple fetches
let allChatsLoaded = false; // Flag to indicate all chats have been loaded
const CHATS_PER_PAGE = 15; // Number of chats to load per page
let isLearningMode = false; // State for learning mode

// System prompt for learning mode. This is prepended to user prompts when learning mode is active.
const LEARNING_MODE_SYSTEM_PROMPT = `**CHỈ THỊ HỆ THỐNG - CHẾ ĐỘ HỌC TẬP ĐANG BẬT**
Bạn là một người hướng dẫn học tập chuyên nghiệp. Khi người dùng yêu cầu một lộ trình học, hãy tuân thủ các quy tắc sau:
1.  **Tạo Lộ trình:** Trả lời bằng một danh sách có cấu trúc (dùng Markdown với gạch đầu dòng).
2.  **Tạo Liên kết Tương tác:** Đối với MỖI MỤC trong lộ trình, bạn PHẢI định dạng nó theo cú pháp đặc biệt sau: \`[Tên mục học]{"prompt":"Yêu cầu chi tiết để giải thích về mục học này"}\`
    * **[Tên mục học]**: Là tiêu đề của bài học. QUAN TRỌNG: Bên trong "Tên mục học", bạn không được sử dụng thêm dấu ngoặc vuông \`[]\` để nhấn mạnh bất kỳ thuật ngữ nào nào khác. Hãy viết tên mục một cách tự nhiên.
    * **{"prompt":"..."}**: Là một đối tượng JSON chứa một khóa "prompt". Giá trị của khóa này là một câu lệnh đầy đủ bạn tự tạo ra để yêu cầu chính bạn giải thích sâu về mục học đó. Prompt phải chi tiết và bằng tiếng Việt.
**Ví dụ yêu cầu từ người dùng:** "Tạo cho tôi lộ trình học Javascript."
**Ví dụ đầu ra MONG MUỐN từ bạn:**
* [Giới thiệu về Javascript và Lịch sử]{"prompt":"Hãy giải thích chi tiết Javascript là gì, lịch sử và vai trò của nó trong phát triển web hiện đại."}
* [Cú pháp cơ bản, Biến và Kiểu dữ liệu]{"prompt":"Trình bày bài học về cú pháp cơ bản của Javascript, cách khai báo biến với var, let, const, và các kiểu dữ liệu nguyên thủy như string, number, boolean, null, undefined."}`;


// Element Selectors (Cached DOM elements for efficiency)
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const googleLoginBtn = document.getElementById('google-login-btn');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const authError = document.getElementById('auth-error');
const personaSelectionScreen = document.getElementById('persona-selection-screen');
const welcomeUserName = document.getElementById('welcome-user-name');
const createPersonaBtn = document.getElementById('create-persona-btn');
const customPersonasSection = document.getElementById('custom-personas-section');
const customPersonaGrid = document.getElementById('custom-persona-grid');
const emptyCustomPersonaState = document.getElementById('empty-custom-persona-state');
const defaultPersonaGrid = document.getElementById('default-persona-grid');
const logoutBtnPersona = document.getElementById('logout-btn-persona');
const chatViewContainer = document.getElementById('chat-view-container');
const mainHeader = document.getElementById('main-header');
const menuBtn = document.getElementById('menu-btn');
const chatHeaderInfo = document.getElementById('chat-header-info');
const newTopicBtn = document.getElementById('new-topic-btn');
const summarizeBtn = document.getElementById('summarize-btn');
const themeToggle = document.getElementById('theme-toggle');
const logoutBtn = document.getElementById('logout-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebarContent = document.getElementById('sidebar-content');
const newChatBtn = document.getElementById('new-chat-btn');
const pinnedChatsSection = document.getElementById('pinned-chats-section');
const pinnedChatsList = document.getElementById('pinned-chats-list');
const savedChatsList = document.getElementById('saved-chats-list');
const savedChatsSkeleton = document.getElementById('saved-chats-skeleton');
const mainContent = document.getElementById('main-content');
const welcomeScreen = document.getElementById('welcome-screen');
const chatContainer = document.getElementById('chat-container');
const notificationArea = document.getElementById('notification-area');
const suggestionArea = document.getElementById('suggestion-area');
const toggleSuggestionsBtn = document.getElementById('toggle-suggestions-btn');
const suggestionsContainer = document.getElementById('suggestions-container');
const inputAreaWrapper = document.getElementById('input-area-wrapper');
const inputArea = document.getElementById('input-area');
const referenceBtn = document.getElementById('reference-btn');
const promptInput = document.getElementById('prompt-input');
const recordBtn = document.getElementById('record-btn');
const sendBtn = document.getElementById('send-btn');
const personaModalOverlay = document.getElementById('persona-modal-overlay');
const personaModal = document.getElementById('persona-modal');
const personaModalTitle = document.getElementById('persona-modal-title');
const closePersonaModalBtn = document.getElementById('close-persona-modal-btn');
const personaForm = document.getElementById('persona-form');
const personaIdInput = document.getElementById('persona-id');
const personaNameInput = document.getElementById('persona-name');
const personaIconInput = document.getElementById('persona-icon');
const personaDescriptionInput = document.getElementById('persona-description');
const personaPromptInput = document.getElementById('persona-prompt');
const generatePromptBtn = document.getElementById('generate-prompt-btn');
const cancelPersonaBtn = document.getElementById('cancel-persona-btn');
const savePersonaBtn = document.getElementById('save-persona-btn');
const referenceModalOverlay = document.getElementById('reference-modal-overlay');
const referenceModal = document.getElementById('reference-modal');
const referenceHeader = document.getElementById('reference-header');
const referenceTitle = document.getElementById('reference-title');
const closeReferenceModalBtn = document.getElementById('close-reference-modal-btn');
const referenceContent = document.getElementById('reference-content');
const referenceInputArea = document.getElementById('reference-input-area');
const referencePromptInput = document.getElementById('reference-prompt-input');
const referenceSendBtn = document.getElementById('reference-send-btn');
const learningModeToggle = document.getElementById('learning-mode-toggle'); 
const learningModeIndicator = document.getElementById('learning-mode-indicator');
const chatScrollContainer = document.getElementById("chat-container");
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// --- UPDATED: Pre-defined default personas with curated sample prompts ---
const defaultPersonas = [
    { 
        id: 'general', 
        name: 'Trợ lý Toàn năng', 
        icon: '🧠', 
        description: 'Kiến thức tổng quát, trả lời đa dạng các chủ đề.', 
        systemPrompt: `**Chỉ thị hệ thống:** Mục tiêu chính của bạn là đưa ra câu trả lời rõ ràng, chi tiết và có cấu trúc tốt. Luôn sử dụng Markdown để định dạng (tiêu đề, danh sách, in đậm). Hãy giải thích các khái niệm từng bước, bắt đầu bằng tóm tắt rồi đi vào chi tiết và ví dụ. **Yêu cầu bổ sung:** Trong quá trình trả lời, khi bạn đề cập đến một thuật ngữ kỹ thuật, một khái niệm quan trọng, hoặc một tên riêng (ví dụ: tên một công nghệ, một phương pháp), hãy bọc thuật ngữ đó trong cặp dấu ngoặc vuông. Ví dụ: '...sử dụng ngôn ngữ [JavaScript] để tương tác với [DOM]...'. Chỉ bọc duy nhất thuật ngữ đó.`,
        samplePrompts: [
            "Giải thích về Lỗ đen vũ trụ như thể tôi là một đứa trẻ 10 tuổi.",
            "Lên một kế hoạch du lịch 3 ngày tại Đà Lạt cho một cặp đôi.",
            "So sánh ưu và nhược điểm của việc đọc sách giấy và sách điện tử."
        ]
    },
    { 
        id: 'programmer', 
        name: 'Chuyên gia Lập trình', 
        icon: '👨‍💻', 
        description: 'Chuyên gia về mã nguồn, thuật toán, gỡ lỗi code.', 
        systemPrompt: `**Chỉ thị hệ thống:** Bạn là một lập trình viên cao cấp với 10 năm kinh nghiệm. Luôn đưa ra câu trả lời dưới dạng mã nguồn được giải thích rõ ràng, tuân thủ các coding convention tốt nhất. Khi được yêu cầu, hãy phân tích ưu và nhược điểm của các giải pháp khác nhau. Hãy ưu tiên tính hiệu quả và khả năng bảo trì của mã nguồn. **Yêu cầu bổ sung:** Khi đề cập đến một hàm, thư viện, hoặc khái niệm lập trình, hãy bọc nó trong dấu ngoặc vuông, ví dụ: [React], [API], [useState].`,
        samplePrompts: [
            "Viết một hàm Python để kiểm tra một chuỗi có phải là palindrome không.",
            "Giải thích sự khác biệt giữa `let`, `const`, và `var` trong JavaScript.",
            "Làm thế nào để tối ưu một truy vấn SQL có sử dụng `JOIN` trên nhiều bảng lớn?"
        ]
    },
    { 
        id: 'writer', 
        name: 'Nhà văn Sáng tạo', 
        icon: '✍️', 
        description: 'Hỗ trợ viết lách, lên ý tưởng, xây dựng cốt truyện.', 
        systemPrompt: `**Chỉ thị hệ thống:** Bạn là một nhà văn và biên tập viên chuyên nghiệp. Phong cách của bạn giàu cảm xúc, sử dụng từ ngữ phong phú và hình ảnh. Hãy giúp người dùng lên ý tưởng, phát triển nhân vật, xây dựng cốt truyện, hoặc viết các đoạn văn, bài thơ theo yêu cầu. Luôn giữ một giọng văn truyền cảm hứng.`,
        samplePrompts: [
            "Viết mở đầu cho một câu chuyện trinh thám lấy bối cảnh ở Sài Gòn năm 1960.",
            "Gợi ý 3 cốt truyện khác nhau chỉ từ một câu: 'Chiếc la bàn không chỉ về hướng bắc.'",
            "Tôi có một nhân vật là một nghệ sĩ violin. Hãy viết một đoạn độc thoại nội tâm cho cô ấy."
        ]
    },
    { 
        id: 'marketing', 
        name: 'Chuyên gia Marketing', 
        icon: '📈', 
        description: 'Tư vấn chiến lược, phân tích thị trường, quảng cáo.', 
        systemPrompt: `**Chỉ thị hệ thống:** Bạn là một giám đốc marketing dày dặn kinh nghiệm. Hãy cung cấp các phân tích thị trường sắc bén, đề xuất các chiến lược marketing marketing sáng tạo, và giúp viết các nội dung quảng cáo (copywriting) hấp dẫn, tập trung vào lợi ích của khách hàng và lời kêu gọi hành động (CTA) rõ ràng.`,
        samplePrompts: [
            "Lên ý tưởng cho một chiến dịch quảng cáo trên mạng xã hội cho một thương hiệu cà phê mới.",
            "Viết 3 tiêu đề email hấp dẫn để quảng bá một khóa học trực tuyến.",
            "Phân tích các đối thủ cạnh tranh chính cho một ứng dụng giao đồ ăn."
        ]
    }
];

// --- UTILITY FUNCTIONS ---
/**
 * Displays a toast notification message to the user.
 * @param {string} message - The message to display.
 * @param {'info'|'success'|'error'} type - The type of toast (determines color and icon).
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    
    let bgColor, textColor, iconSVG;

    switch (type) {
        case 'success':
            bgColor = 'bg-green-100 dark:bg-green-900';
            textColor = 'text-green-700 dark:text-green-200';
            iconSVG = svgIcons.toastSuccess;
            break;
        case 'error':
            bgColor = 'bg-red-100 dark:bg-red-900';
            textColor = 'text-red-700 dark:text-red-200';
            iconSVG = svgIcons.toastError;
            break;
        default: // info
            bgColor = 'bg-blue-100 dark:bg-blue-900';
            textColor = 'text-blue-700 dark:text-blue-200';
            iconSVG = svgIcons.toastInfo;
            break;
    }

    toast.className = `toast max-w-xs w-full ${bgColor} ${textColor} p-4 rounded-lg shadow-lg flex items-center space-x-3`;
    toast.innerHTML = `
        <div class="flex-shrink-0">${iconSVG}</div>
        <div class="flex-1 text-sm font-medium">${message}</div>
    `;

    toastContainer.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    const hideToast = () => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, { once: true });
    };

    toast.addEventListener('click', hideToast);
    setTimeout(hideToast, 4000);
}

/**
 * Copies text to the clipboard.
 * @param {string} text - The text to copy.
 */
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Đã sao chép vào bộ nhớ đệm!', 'success');
    } catch (err) {
        showToast('Không thể sao chép.', 'error');
    }
    document.body.removeChild(textarea);
}

// --- AUTHENTICATION ---
onAuthStateChanged(auth, async user => {
    if (user) {
        currentUserId = user.uid;
        const email = user.email || '';
        currentUserName = user.displayName || email.split('@')[0]; 
        welcomeUserName.textContent = currentUserName;
        
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');

        await showPersonaSelectionScreen();
        await renderAllChats();
    } else {
        currentUserId = null;
        currentUserName = '';
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        chatViewContainer.classList.add('hidden');
        personaSelectionScreen.classList.add('hidden');
    }
});

loginForm.addEventListener('submit', async e => { 
    e.preventDefault(); 
    try { 
        await signInWithEmailAndPassword(auth, loginForm['login-email'].value, loginForm['login-password'].value); 
        authError.textContent = ''; 
    } catch (error) { 
        authError.textContent = "Email hoặc mật khẩu không đúng."; 
        showToast('Email hoặc mật khẩu không đúng.', 'error'); 
    } 
});
registerForm.addEventListener('submit', async e => { 
    e.preventDefault(); 
    try { 
        await createUserWithEmailAndPassword(auth, registerForm['register-email'].value, registerForm['register-password'].value); 
        authError.textContent = ''; 
    } catch (error) { 
        authError.textContent = "Không thể tạo tài khoản. Vui lòng thử lại."; 
        showToast('Không thể tạo tài khoản. Vui lòng thử lại.', 'error'); 
    } 
});
googleLoginBtn.addEventListener('click', async () => { 
    try { 
        await signInWithPopup(auth, new GoogleAuthProvider()); 
        authError.textContent = ''; 
    } catch (error) { 
        authError.textContent = "Đăng nhập Google thất bại."; 
        showToast('Đăng nhập Google thất bại.', 'error');
    } 
});
const handleSignOut = () => signOut(auth);
logoutBtn.addEventListener('click', handleSignOut);
logoutBtnPersona.addEventListener('click', handleSignOut);
showRegisterBtn.addEventListener('click', () => { 
    loginView.classList.add('hidden'); 
    registerView.classList.remove('hidden'); 
    authError.textContent = ''; 
});
showLoginBtn.addEventListener('click', () => { 
    registerView.classList.add('hidden'); 
    loginView.classList.remove('hidden'); 
    authError.textContent = ''; 
});

// --- THEME ---
const updateThemeIcon = () => {
    const darkIconContainer = document.getElementById('theme-toggle-dark-icon');
    const lightIconContainer = document.getElementById('theme-toggle-light-icon');
    if (!darkIconContainer || !lightIconContainer) return;

    if (document.documentElement.classList.contains('dark')) {
        darkIconContainer.style.display = 'none';
        lightIconContainer.style.display = 'block';
    } else {
        darkIconContainer.style.display = 'block';
        lightIconContainer.style.display = 'none';
    }
};
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
});

// --- PERSONA SELECTION ---
async function showPersonaSelectionScreen() {
    clearSuggestions();

    welcomeScreen.classList.add('hidden');
    welcomeScreen.classList.remove('flex');
    personaSelectionScreen.classList.remove('hidden');
    chatViewContainer.classList.add('hidden');

    await fetchCustomPersonas();
    renderDefaultPersonas();
    renderCustomPersonas();
    
    if(speechSynthesis.speaking) speechSynthesis.cancel();
    closeSidebar();

    if (currentPersona) {
        await showWelcomeScreenForPersona(currentPersona);
    } else {
        document.getElementById('welcome-suggestions-container').innerHTML = '';
    }
}

function renderDefaultPersonas() {
    defaultPersonaGrid.innerHTML = '';
    defaultPersonas.forEach(persona => {
        const card = createPersonaCard(persona, false);
        card.onclick = () => startNewChat(persona.id);
        defaultPersonaGrid.appendChild(card);
    });
}

function renderCustomPersonas() {
    customPersonaGrid.innerHTML = '';
    if (customPersonas.length > 0) {
        customPersonaGrid.classList.remove('hidden');
        emptyCustomPersonaState.classList.add('hidden');
        customPersonas.forEach(persona => {
            const card = createPersonaCard(persona, true);
            card.onclick = () => startNewChat(persona.id, true);
            customPersonaGrid.appendChild(card);
        });
    } else {
        customPersonaGrid.classList.add('hidden');
        emptyCustomPersonaState.classList.remove('hidden');
    }
}

function createPersonaCard(persona, isCustom) {
    const card = document.createElement('div');
    card.className = 'persona-card cursor-pointer p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex flex-col items-center text-center h-full';
    card.innerHTML = `
        <div class="text-4xl sm:text-5xl mb-3 sm:mb-4">${persona.icon}</div>
        <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">${persona.name}</h3>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-1">${persona.description}</p>
    `;
    if (isCustom) {
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'custom-persona-actions flex items-center gap-1';
        actionsWrapper.innerHTML = `
            <button class="edit-persona-btn p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400" title="Chỉnh sửa">${svgIcons.edit}</button>
            <button class="delete-persona-btn p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" title="Xóa">${svgIcons.delete}</button>
        `;
        actionsWrapper.querySelector('.edit-persona-btn').onclick = (e) => { e.stopPropagation(); openPersonaModal(persona); };
        actionsWrapper.querySelector('.delete-persona-btn').onclick = (e) => { e.stopPropagation(); deletePersona(persona.id, persona.name); };
        card.appendChild(actionsWrapper);
    }
    return card;
}

// --- PERSONA MODAL ---
function openPersonaModal(personaToEdit = null) {
    personaForm.reset();
    if (personaToEdit) {
        personaModalTitle.textContent = 'Chỉnh sửa Persona';
        personaIdInput.value = personaToEdit.id;
        personaNameInput.value = personaToEdit.name;
        personaIconInput.value = personaToEdit.icon;
        personaDescriptionInput.value = personaToEdit.description;
        personaPromptInput.value = personaToEdit.systemPrompt;
    } else {
        personaModalTitle.textContent = 'Tạo Chuyên gia AI của bạn';
        personaIdInput.value = '';
    }
    personaModalOverlay.classList.remove('hidden');
    personaModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        personaModal.classList.remove('scale-95', 'opacity-0');
    });
}

function closePersonaModal() {
    personaModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        personaModalOverlay.classList.add('hidden');
        personaModal.classList.add('hidden');
    }, 300);
}

// --- PERSONA CRUD ---
async function fetchCustomPersonas() {
    if (!currentUserId) return;
    const personasCol = collection(db, 'users', currentUserId, 'customPersonas');
    const q = query(personasCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    customPersonas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function handleSavePersona(e) {
    e.preventDefault();
    if (!currentUserId) return;

    const personaData = {
        name: personaNameInput.value.trim(),
        icon: personaIconInput.value.trim() || '🤖',
        description: personaDescriptionInput.value.trim(),
        systemPrompt: personaPromptInput.value.trim(),
        ownerId: currentUserId
    };

    const personaId = personaIdInput.value;
    savePersonaBtn.disabled = true;
    try {
        if (personaId) {
            const docRef = doc(db, 'users', currentUserId, 'customPersonas', personaId);
            await updateDoc(docRef, personaData);
        } else {
            personaData.createdAt = serverTimestamp();
            const collectionRef = collection(db, 'users', currentUserId, 'customPersonas');
            await addDoc(collectionRef, personaData);
        }
        closePersonaModal();
        showToast('Persona đã được lưu thành công!', 'success');
        await showPersonaSelectionScreen();
    } catch (error) {
        console.error("Lỗi khi lưu persona:", error);
        showToast('Lỗi khi lưu persona.', 'error');
    } finally {
        savePersonaBtn.disabled = false;
    }
}

async function deletePersona(personaId, personaName) {
    if (!confirm(`Bạn có chắc chắn muốn xóa persona "${personaName}" không? Hành động này không thể hoàn tác.`)) return;

    try {
        await deleteDoc(doc(db, 'users', currentUserId, 'customPersonas', personaId));
        showToast(`Persona "${personaName}" đã được xóa.`, 'success');
        await showPersonaSelectionScreen();
    } catch (error) {
        console.error("Lỗi khi xóa persona:", error);
        showToast('Lỗi khi xóa persona.', 'error');
    }
}

// --- CHAT LOGIC ---
function preprocessText(text) {
    const learningLinkRegex = /\[([^\]]+?)\]\{"prompt":"([^"]+?)"\}/g;
    const termLinkRegex = /\[([^\]]+?)\]/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = learningLinkRegex.exec(text)) !== null) {
        parts.push(text.substring(lastIndex, match.index));
        
        const title = match[1];
        const prompt = match[2];

        const sanitizedPrompt = prompt.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        parts.push(`<a href="#" class="learning-link" data-prompt="${sanitizedPrompt}">${title}</a>`);
        
        lastIndex = match.index + match[0].length;
    }

    parts.push(text.substring(lastIndex));

    const finalParts = parts.map(part => {
        if (part.startsWith('<a href="#" class="learning-link"')) {
            return part;
        } else {
            return part.replace(termLinkRegex, `<a href="#" class="term-link" data-term="$1">$1</a>`);
        }
    });

    return finalParts.join('');
}

async function startNewChat(personaId, isCustom = false) {
    let selectedPersona;
    if (isCustom) {
        selectedPersona = customPersonas.find(p => p.id === personaId);
    } else {
        selectedPersona = defaultPersonas.find(p => p.id === personaId);
    }

    if (!selectedPersona) { 
        showToast('Không tìm thấy Persona.', 'error');
        return; 
    }
    
    clearSuggestions();
    currentPersona = selectedPersona;
    
    personaSelectionScreen.classList.add('hidden');
    chatViewContainer.classList.remove('hidden');
    chatViewContainer.classList.add('flex');

    updateChatHeader(currentPersona);
    updateLearningModeIndicator();
    
    currentChatId = null;
    chat = null;
    localHistory = [{
        role: "user",
        parts: [{ text: currentPersona.systemPrompt }],
    }, {
        role: "model",
        parts: [{ text: "Đã hiểu! Tôi đã sẵn sàng. Bạn cần tôi giúp gì?" }],
    }];
    
    chatContainer.innerHTML = '';
    chatContainer.appendChild(notificationArea);
    
    await renderAllChats();
    closeSidebar();
    if(speechSynthesis.speaking) speechSynthesis.cancel();
    
    await showWelcomeScreenForPersona(currentPersona);
}

function updateChatHeader(persona) {
    if(persona) {
        chatHeaderInfo.innerHTML = `
            <span class="text-2xl">${persona.icon}</span>
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">${persona.name}</span>
        `;
        updateLearningModeIndicator();
    } else {
        chatHeaderInfo.innerHTML = '';
    }
}

function addMessageActions(actionsContainer, rawText) {
     if (!actionsContainer || !rawText || rawText.includes('blinking-cursor')) return;
    
    actionsContainer.innerHTML = '';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors';
    copyBtn.innerHTML = svgIcons.copy;
    copyBtn.title = 'Sao chép nội dung';
    copyBtn.dataset.text = rawText;
    actionsContainer.appendChild(copyBtn);
    
    const speakBtn = document.createElement('button');
    speakBtn.className = 'speak-btn p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors';
    speakBtn.innerHTML = '🔊';
    speakBtn.title = 'Đọc văn bản';
    speakBtn.dataset.text = rawText;
    speakBtn.dataset.state = 'idle';
    actionsContainer.appendChild(speakBtn);
}

function addMessage(role, text, shouldScroll = true) {
    const messageWrapper = document.createElement('div');
    let contentElem;
    let statusElem;
    let actionsContainer = null;

    if (role === 'ai' || role === 'model') {
        messageWrapper.className = 'w-full space-y-2';
        messageWrapper.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center">
                       ${svgIcons.aiAvatar}
                    </div>
                    <span class="font-semibold text-gray-800 dark:text-gray-200">${currentPersona?.name || 'Gemini'}</span>
                </div>
                <div class="ai-status"></div>
            </div>
            <div class="message-content text-gray-800 dark:text-gray-200" data-raw-text="${text.replace(/"/g, '&quot;')}"></div>
            <div class="message-actions mt-1 flex justify-end items-center gap-2"></div>`;
        contentElem = messageWrapper.querySelector('.message-content');
        statusElem = messageWrapper.querySelector('.ai-status');
        actionsContainer = messageWrapper.querySelector('.message-actions');
    } else if (role === 'user') {
        messageWrapper.className = 'flex justify-end';
        messageWrapper.innerHTML = `<div class="message-content px-4 py-2 rounded-2xl bg-blue-600 dark:bg-blue-700 text-white max-w-xs sm:max-w-md lg:max-w-2xl"></div>`;
        contentElem = messageWrapper.querySelector('.message-content');
    } else if (role === 'note') {
        messageWrapper.className = 'note-wrapper';
        messageWrapper.innerHTML = `
            <div class="note-header">
                ${svgIcons.note}
                <span>Ghi chú</span>
            </div>
            <div class="note-content message-content" data-raw-text="${text.replace(/"/g, '&quot;')}"></div>
        `;
        contentElem = messageWrapper.querySelector('.note-content');
    } else if (role === 'summary') {
        messageWrapper.className = 'summary-wrapper';
        messageWrapper.innerHTML = `
            <div class="summary-header">
                ${svgIcons.summarize}
                <span>Tóm tắt cuộc trò chuyện</span>
            </div>
            <div class="summary-content message-content" data-raw-text="${text.replace(/"/g, '&quot;')}"></div>
            <div class="message-actions mt-1 flex justify-end items-center gap-2"></div>
        `;
        contentElem = messageWrapper.querySelector('.summary-content');
        actionsContainer = messageWrapper.querySelector('.message-actions');
    }
    
    const preprocessedText = preprocessText(text);
    contentElem.innerHTML = DOMPurify.sanitize(marked.parse(preprocessedText), { ADD_ATTR: ['target', 'data-term', 'data-prompt'] });

    if (actionsContainer) {
        addMessageActions(actionsContainer, text);
    }

    chatContainer.insertBefore(messageWrapper, notificationArea);
    if (shouldScroll) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    return { messageWrapper, contentElem, statusElem, actionsContainer };
}

async function handleSummary() {
    if (isSummarizing) return;
    
    const conversationToSummarize = localHistory
        .filter(msg => ['user', 'model'].includes(msg.role))
        .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.parts[0].text}`)
        .join('\n\n');

    if (conversationToSummarize.length < 100) { 
        showToast('Chưa có đủ nội dung để tóm tắt.', 'info');
        return;
    }

    isSummarizing = true;
    const originalIconContainer = summarizeBtn.firstElementChild;
    summarizeBtn.innerHTML = svgIcons.spinner;
    summarizeBtn.disabled = true;

    try {
        const prompt = `Dựa vào cuộc trò chuyện sau, hãy tóm tắt lại các ý chính một cách súc tích, rõ ràng theo từng gạch đầu dòng:\n\n---\n${conversationToSummarize}\n---`;
        const result = await fastModel.generateContent(prompt);
        const summaryText = result.response.text();

        addMessage('summary', summaryText);
        
        localHistory.push({ role: 'summary', parts: [{ text: summaryText }] });
        await updateConversationInDb();

    } catch (error) {
        console.error("Lỗi khi tóm tắt:", error);
        showToast('Không thể tạo bản tóm tắt lúc này.', 'error');
    } finally {
        isSummarizing = false;
        summarizeBtn.innerHTML = '';
        summarizeBtn.appendChild(originalIconContainer);
        summarizeBtn.disabled = false;
    }
}

async function sendMessage(promptTextOverride = null) {
    console.log("--- sendMessage called ---");
    console.log("Initial localHistory length:", localHistory.length);

    welcomeScreen.classList.add('hidden');
    welcomeScreen.classList.remove('flex');
    chatContainer.classList.remove('hidden');

    const userDisplayedText = promptTextOverride ? promptTextOverride : promptInput.value.trim(); 
    const actualPromptToSend = promptTextOverride || promptInput.value.trim();

    if (!actualPromptToSend || isSummarizing) return;

    if (!promptTextOverride) {
        promptInput.value = '';
        adjustInputHeight();
    }

    sendBtn.disabled = true;
    clearSuggestions();

    addMessage('user', userDisplayedText);
    localHistory.push({ role: 'user', parts: [{ text: userDisplayedText }] });
    console.log("localHistory after adding user message:", JSON.parse(JSON.stringify(localHistory)));

    const { messageWrapper, contentElem, statusElem, actionsContainer } = addMessage('ai', '<span class="blinking-cursor"></span>');
    if (statusElem) statusElem.textContent = 'Đang suy nghĩ...';

    try {
        let historyForThisCall = [];
        const historyLength = localHistory.length;
        for (let i = 0; i < historyLength; i++) {
            const message = localHistory[i];

            if (message.role === 'note' || message.role === 'summary') {
                continue;
            }
            if (i === historyLength - 1 && message.role === 'user') {
                break; 
            }
            if (historyForThisCall.length > 0 && historyForThisCall[historyForThisCall.length - 1].role === message.role) {
                if (message.role === 'model') {
                    console.warn("Skipping consecutive 'model' message found in localHistory during history preparation:", message);
                    continue;
                }
            }

            historyForThisCall.push(message);
        }

        let finalPrompt;
        if (isLearningMode && !promptTextOverride) { 
            finalPrompt = `${LEARNING_MODE_SYSTEM_PROMPT}\n\nYêu cầu của người học: "${actualPromptToSend}"`;
        } else {
            finalPrompt = actualPromptToSend;
        }

        console.log("History sent to startChat:", JSON.parse(JSON.stringify(historyForThisCall))); 
        const chatSession = model.startChat({ history: historyForThisCall });
        const result = await chatSession.sendMessageStream(finalPrompt);

        let fullResponseText = "";
        let isFirstChunk = true;

        for await (const chunk of result.stream) {
            if (isFirstChunk) {
                if (statusElem) statusElem.textContent = 'Đang viết...';
                isFirstChunk = false;
            }
            fullResponseText += chunk.text();
            
            const processedChunk = preprocessText(fullResponseText + '<span class="blinking-cursor"></span>');
            contentElem.innerHTML = DOMPurify.sanitize(marked.parse(processedChunk), {ADD_ATTR: ['target', 'data-term', 'data-prompt']});
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
        if (statusElem) statusElem.classList.add('hidden');
        
        const finalProcessedText = preprocessText(fullResponseText);
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(finalProcessedText), {ADD_ATTR: ['target', 'data-term', 'data-prompt']});
        contentElem.dataset.rawText = fullResponseText;
        
        addMessageActions(actionsContainer, fullResponseText);
        
        setTimeout(() => {
             messageWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);

        localHistory.push({ role: 'model', parts: [{ text: fullResponseText }] });
        console.log("localHistory after adding model message:", JSON.parse(JSON.stringify(localHistory)));
        await updateConversationInDb();
        
        if (!isLearningMode) {
            await getFollowUpSuggestions(fullResponseText);
        } else {
            clearSuggestions();
        }

    } catch (error) {
        console.error("Error during sendMessage:", error);
        contentElem.innerHTML = `**Lỗi:** ${error.message}`;
        if (localHistory.length > 0) {
            localHistory.pop(); 
            console.log("localHistory after error pop:", JSON.parse(JSON.stringify(localHistory)));
        }
        showToast(`Lỗi gửi tin nhắn: ${error.message}`, 'error');

    } finally {
        sendBtn.disabled = false;
    }
}

async function updateConversationInDb() {
    if (!currentUserId || localHistory.length <= 2) return; 
    const chatData = { 
        history: localHistory, 
        updatedAt: serverTimestamp(), 
        personaId: currentPersona?.id || 'general'
    };
    try {
        if (currentChatId) {
            await updateDoc(doc(db, 'chats', currentUserId, 'conversations', currentChatId), chatData);
        } else {
            const firstUserPrompt = localHistory[2];
            chatData.title = firstUserPrompt?.parts[0].text.substring(0, 40) || "Cuộc trò chuyện mới";
            chatData.createdAt = serverTimestamp();
            chatData.isPinned = false;
            const docRef = await addDoc(collection(db, 'chats', currentUserId, 'conversations'), chatData);
            currentChatId = docRef.id;
        }
        await renderAllChats();
    } catch (error) {
        console.error("Lỗi khi cập nhật cuộc trò chuyện:", error);
    }
}

async function loadChat(chatId) {
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    
    personaSelectionScreen.classList.add('hidden');
    chatViewContainer.classList.remove('hidden');
    chatViewContainer.classList.add('flex');
    showHistorySkeleton();
    closeSidebar();

    try {
        const chatDocRef = doc(db, 'chats', currentUserId, 'conversations', chatId);
        const chatDoc = await getDoc(chatDocRef);

        if (chatDoc.exists()) {
            const data = chatDoc.data();
            const loadedPersonaId = data.personaId || 'general';
            
            let foundPersona = defaultPersonas.find(p => p.id === loadedPersonaId);
            if (!foundPersona) {
                const personaDocRef = doc(db, 'users', currentUserId, 'customPersonas', loadedPersonaId);
                const personaDoc = await getDoc(personaDocRef);
                if (personaDoc.exists()) {
                    foundPersona = { id: personaDoc.id, ...personaDoc.data() };
                } else {
                    foundPersona = { id: 'deleted', name: 'Persona đã xóa', icon: '❓', description: '', systemPrompt: 'Hãy trả lời một cách bình thường.' };
                }
            }
            currentPersona = foundPersona;
            updateChatHeader(currentPersona);
            updateLearningModeIndicator();

            currentChatId = chatDoc.id;
            localHistory = data.history || [];
            console.log("Loaded localHistory:", JSON.parse(JSON.stringify(localHistory)));
            
            await renderAllChats();
            welcomeScreen.classList.add('hidden');
            welcomeScreen.classList.remove('flex');
            chatContainer.classList.remove('hidden');
            chatContainer.innerHTML = ''; 
            chatContainer.appendChild(notificationArea);

            clearSuggestions();

            const messagesToDisplay = localHistory.slice(2);
            messagesToDisplay.forEach(msg => {
                addMessage(msg.role, msg.parts[0].text, false);
            });
            setTimeout(() => chatContainer.scrollTop = chatContainer.scrollHeight, 0);

            if (!isLearningMode) {
                const lastModelMessage = localHistory.slice().reverse().find(msg => msg.role === 'model');
                if (lastModelMessage) {
                    await getFollowUpSuggestions(lastModelMessage.parts[0].text);
                } else {
                    clearSuggestions();
                }
            } else {
                clearSuggestions();
            }

        } else {
            addMessage('ai', '**Lỗi:** Không tìm thấy cuộc trò chuyện.');
            showToast('Cuộc trò chuyện không tồn tại.', 'error');
        }
    } catch (error) {
        console.error("Lỗi khi tải cuộc trò chuyện:", error);
        showToast('Lỗi khi tải cuộc trò chuyện.', 'error');
        addMessage('ai', '**Lỗi:** Không thể tải cuộc trò chuyện.');
    }
}

function clearSuggestions() {
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.classList.add('hidden');
    toggleSuggestionsBtn.classList.add('hidden');
}

async function getFollowUpSuggestions(lastResponse) {
    try {
        const suggestionPrompt = `Dựa vào câu trả lời sau: "${lastResponse.substring(0, 500)}". Hãy đề xuất 3 câu hỏi tiếp theo ngắn gọn và thú vị mà người dùng có thể hỏi. QUAN TRỌNG: Chỉ trả về 3 câu hỏi, mỗi câu trên một dòng. Không đánh số, không dùng gạch đầu dòng, không thêm bất kỳ văn bản nào khác.`;
        const result = await fastModel.generateContent(suggestionPrompt);
        const responseText = result.response.text();
        const suggestions = responseText.split('\n').filter(s => s.trim() !== '');
        displaySuggestions(suggestions);
    } catch (error) {
        console.error("Error getting suggestions:", error);
    }
}

async function handleSuggestionClickAndSendToReference(suggestionText) {
    showReferenceModal('Trợ lý Phụ', true); 
    await new Promise(resolve => setTimeout(resolve, 50)); 
    if (referencePromptInput) {
        referencePromptInput.value = suggestionText;
    }
    await sendReferenceMessage(suggestionText);
}


function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    if(suggestions.length > 0) {
        toggleSuggestionsBtn.classList.remove('hidden');
        suggestions.forEach(suggestionText => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip border border-blue-200 dark:border-slate-600 bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-400 rounded-full px-3 py-1 text-sm hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors';
            chip.textContent = suggestionText;
            chip.onclick = () => { 
                sendMessage(suggestionText);
            };
            suggestionsContainer.appendChild(chip);
        });
    } else {
         toggleSuggestionsBtn.classList.add('hidden');
    }
}

// --- UPDATED: New function to handle welcome screen ---
async function showWelcomeScreenForPersona(persona) {
    if (!persona) return; 

    // Show welcome screen and hide chat container
    welcomeScreen.classList.remove('hidden');
    welcomeScreen.classList.add('flex');
    chatContainer.classList.add('hidden');

    document.getElementById('welcome-persona-icon').textContent = persona.icon;
    document.getElementById('welcome-persona-name').textContent = persona.name;
    document.getElementById('welcome-persona-description').textContent = persona.description;
    
    const suggestionsContainer = document.getElementById('welcome-suggestions-container');
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (isLearningMode) {
         suggestionsContainer.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Ở Chế độ Học tập, bạn sẽ nhận được các liên kết tương tác thay vì gợi ý.</p>';
         return;
    }
    
    // Logic to display suggestions: Curated first, then AI-generated as fallback
    const suggestions = persona.samplePrompts;

    if (suggestions && suggestions.length > 0) {
        // If curated suggestions exist, display them immediately
        suggestions.forEach(text => {
            const card = document.createElement('button');
            card.className = 'w-full p-4 text-left border dark:border-gray-700 rounded-lg welcome-suggestion-card';
            card.textContent = text;
            card.onclick = () => {
                sendMessage(text);
            };
            suggestionsContainer.appendChild(card);
        });
    } else {
        // Fallback to generating suggestions if none are curated
        suggestionsContainer.innerHTML = `
            <div class="w-full p-4 border border-dashed dark:border-gray-700 rounded-lg animate-pulse h-12"></div>
            <div class="w-full p-4 border border-dashed dark:border-gray-700 rounded-lg animate-pulse h-12"></div>
        `;
        try {
            const prompt = `Bạn là chuyên gia về ${persona.name}. Hãy tạo ra 3 câu hỏi gợi ý, ngắn gọn và thú vị mà người dùng có thể hỏi bạn để bắt đầu. Mỗi câu hỏi trên một dòng. Không dùng định dạng markdown, không đánh số hay gạch đầu dòng.`;
            const result = await fastModel.generateContent(prompt);
            const responseText = result.response.text();
            const aiSuggestions = responseText.split('\n').filter(s => s.trim() !== '');
            
            suggestionsContainer.innerHTML = ''; // Clear skeleton
            aiSuggestions.forEach(text => {
                const card = document.createElement('button');
                card.className = 'w-full p-4 text-left border dark:border-gray-700 rounded-lg welcome-suggestion-card';
                card.textContent = text;
                card.onclick = () => {
                    sendMessage(text);
                };
                suggestionsContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Error generating welcome suggestions:", error);
            suggestionsContainer.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Không thể tải gợi ý. Vui lòng bắt đầu bằng cách nhập câu hỏi của bạn.</p>';
        }
    }
}


function adjustInputHeight() {
    promptInput.style.height = 'auto';
    promptInput.style.height = promptInput.scrollHeight + 'px';
}

// --- Sidebar & Chat History Functions ---
function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    sidebarOverlay.classList.remove('hidden');
    setTimeout(() => sidebarOverlay.classList.add('opacity-100'), 10);
}

function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.remove('opacity-100');
    setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
}

function showHistorySkeleton() {
    welcomeScreen.classList.add('hidden');
    welcomeScreen.classList.remove('flex');
    chatContainer.classList.remove('hidden');
    chatContainer.innerHTML = `<div class="w-full space-y-2">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full skeleton-box"></div>
                <div class="w-20 h-4 skeleton-box"></div>
            </div>
            <div class="ml-9 space-y-2">
                <div class="w-10/12 h-4 skeleton-box"></div>
                <div class="w-8/12 h-4 skeleton-box"></div>
            </div>
        </div>
        <div class="flex justify-end">
            <div class="w-7/12">
                <div class="h-16 skeleton-box rounded-2xl"></div>
            </div>
        </div>`;
    chatContainer.appendChild(notificationArea);
}

async function renderAllChats() {
    if (!currentUserId || !currentPersona) {
        savedChatsList.innerHTML = '';
        pinnedChatsList.innerHTML = '';
        pinnedChatsSection.classList.add('hidden');
        return;
    };
    isFetchingChats = false;
    allChatsLoaded = false;
    lastVisibleChat = null;
    pinnedChatsList.innerHTML = '';
    savedChatsList.innerHTML = '';
    await fetchPinnedChats();
    await fetchRecentChats();
}

async function fetchPinnedChats() {
     const chatsCollection = collection(db, 'chats', currentUserId, 'conversations');
     const q = query(chatsCollection, where('personaId', '==', currentPersona.id), where('isPinned', '==', true), orderBy('updatedAt', 'desc'));
     try {
        const querySnapshot = await getDocs(q);
        pinnedChatsSection.classList.toggle('hidden', querySnapshot.empty);
        pinnedChatsList.innerHTML = ''; 
        querySnapshot.forEach(docSnap => {
            const li = createChatItem(docSnap);
            pinnedChatsList.appendChild(li);
        });
     }
    catch (error) {
        console.error("Lỗi khi lấy chat đã ghim (cần tạo index trên Firebase):", error);
    }
}

async function fetchRecentChats(loadMore = false) {
    if (isFetchingChats || allChatsLoaded) return;
    isFetchingChats = true;
    if (!loadMore) savedChatsSkeleton.classList.remove('hidden');

    const chatsCollection = collection(db, 'chats', currentUserId, 'conversations');
    const constraints = [where('personaId', '==', currentPersona.id), where('isPinned', '==', false), orderBy('updatedAt', 'desc'), limit(CHATS_PER_PAGE)];
    if (lastVisibleChat && loadMore) {
        constraints.push(startAfter(lastVisibleChat));
    }
    const q = query(chatsCollection, ...constraints);

    try {
        const querySnapshot = await getDocs(q);
        if (!loadMore) savedChatsList.innerHTML = '';
        if (querySnapshot.empty && !loadMore) {
             savedChatsList.innerHTML = `
                <li id="empty-chats-state" class="text-center p-4 space-y-2">
                    <div class="flex justify-center">${svgIcons.emptyChat}</div>
                    <h4 class="font-semibold text-sm text-gray-600 dark:text-gray-300">Bắt đầu trò chuyện</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Các cuộc hội thoại với ${currentPersona.name} sẽ xuất hiện tại đây.</p>
                </li>`;
        } 
        querySnapshot.forEach(docSnap => {
            const li = createChatItem(docSnap);
            savedChatsList.appendChild(li);
        });

        if (querySnapshot.docs.length > 0) {
            lastVisibleChat = querySnapshot.docs[querySnapshot.docs.length - 1];
        }
        if (querySnapshot.docs.length < CHATS_PER_PAGE) {
            allChatsLoaded = true;
        }
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử trò chuyện (cần tạo index trên Firebase):", error);
    } finally {
        isFetchingChats = false;
        savedChatsSkeleton.classList.add('hidden');
    }
}

async function updateChatTitle(chatId, newTitle) {
    if (!currentUserId || !newTitle) return;
    const docRef = doc(db, 'chats', currentUserId, 'conversations', chatId);
    try {
        await updateDoc(docRef, { title: newTitle });
        showToast('Tiêu đề đã được cập nhật!', 'success');
        await renderAllChats(); 
    } catch (error) {
        console.error("Lỗi khi cập nhật tiêu đề:", error);
        showToast('Lỗi khi cập nhật tiêu đề.', 'error');
        await renderAllChats();
    }
}

function createChatItem(docSnap) {
    const chatItemData = docSnap.data();
    const chatId = docSnap.id;
    const li = document.createElement('li');
    li.className = "p-2 hover:bg-gray-100 dark:hover:bg-slate-700 flex justify-between items-center rounded-md group";
    li.dataset.chatId = chatId;

    const titleContainer = document.createElement('div');
    titleContainer.className = "flex-1 truncate pr-2";

    const titleSpan = document.createElement('span');
    titleSpan.textContent = chatItemData.title || 'Cuộc trò chuyện mới';
    titleSpan.className = "text-gray-800 dark:text-gray-200 text-sm";
    titleContainer.appendChild(titleSpan);

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = chatItemData.title || 'Cuộc trò chuyện mới';
    titleInput.className = "w-full bg-slate-200 dark:bg-slate-600 rounded px-1 text-sm hidden";
    titleContainer.appendChild(titleInput);

    li.appendChild(titleContainer);

    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'flex items-center opacity-0 group-hover:opacity-100 transition-opacity';

    const editBtn = document.createElement('button');
    editBtn.className = 'p-1 text-gray-400 hover:text-blue-500 rounded-full';
    editBtn.title = "Sửa tiêu đề";
    editBtn.innerHTML = svgIcons.edit;
    
    const saveBtnIcon = svgIcons.save;
    const editBtnIcon = svgIcons.edit;

    const pinBtn = document.createElement('button');
    pinBtn.className = 'p-1 text-gray-400 hover:text-yellow-500 rounded-full';
    pinBtn.title = chatItemData.isPinned ? "Bỏ ghim" : "Ghim";
    pinBtn.innerHTML = chatItemData.isPinned ? svgIcons.unpin : svgIcons.pin;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'p-1 text-gray-400 hover:text-red-600 rounded-full';
    deleteBtn.title = "Xóa cuộc trò chuyện";
    deleteBtn.innerHTML = svgIcons.delete;
    
    buttonsWrapper.appendChild(editBtn);
    buttonsWrapper.appendChild(pinBtn);
    buttonsWrapper.appendChild(deleteBtn);
    li.appendChild(buttonsWrapper);

    const toggleEditMode = (isEditing) => {
        titleSpan.classList.toggle('hidden', isEditing);
        titleInput.classList.toggle('hidden', !isEditing);
        if (isEditing) {
            editBtn.innerHTML = saveBtnIcon;
            editBtn.title = 'Lưu';
            titleInput.focus();
            titleInput.select();
        } else {
            editBtn.innerHTML = editBtnIcon;
            editBtn.title = 'Sửa tiêu đề';
        }
    };

    const saveTitle = async () => {
        const newTitle = titleInput.value.trim();
        const originalTitle = chatItemData.title || 'Cuộc trò chuyện mới';
        if (newTitle && newTitle !== originalTitle) {
            titleSpan.textContent = newTitle;
            await updateChatTitle(chatId, newTitle);
        }
        toggleEditMode(false);
    };
    
    editBtn.onclick = (e) => {
        e.stopPropagation();
        const isEditing = !titleInput.classList.contains('hidden');
        if (isEditing) {
            saveTitle();
        } else {
            toggleEditMode(true);
        }
    };

    titleInput.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            saveTitle(); 
        } else if (e.key === 'Escape') {
            titleInput.value = chatItemData.title || 'Cuộc trò chuyện mới';
            toggleEditMode(false);
        }
    };

    titleInput.addEventListener('blur', () => {
         setTimeout(()=> {
             if(!titleInput.classList.contains('hidden')) {
                 saveTitle();
             }
         }, 100);
    });

    pinBtn.onclick = (e) => { e.stopPropagation(); togglePinChat(chatId, chatItemData.isPinned || false); };
    deleteBtn.onclick = (e) => { e.stopPropagation(); deleteChat(chatId); };
    
    li.onclick = (e) => {
        if (e.target === titleInput || (titleInput.classList.contains('hidden') === false && e.target !== editBtn)) return;
        loadChat(chatId);
    };

    return li;
}


async function togglePinChat(chatId, isCurrentlyPinned) {
    if (!currentUserId) return;
    const docRef = doc(db, 'chats', currentUserId, 'conversations', chatId);
    try {
        await updateDoc(docRef, { isPinned: !isCurrentlyPinned });
        showToast(isCurrentlyPinned ? 'Đã bỏ ghim cuộc trò chuyện.' : 'Đã ghim cuộc trò chuyện.', 'info');
        await renderAllChats();
    } catch(error) {
        console.error("Lỗi khi ghim cuộc trò chuyện:", error);
        showToast('Lỗi khi ghim/bỏ ghim.', 'error');
    }
}

async function deleteChat(chatId) {
    if (!confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) return;
    if (!currentUserId) return;
    try {
        await deleteDoc(doc(db, 'chats', currentUserId, 'conversations', chatId));
        showToast('Cuộc trò chuyện đã được xóa.', 'success');
        if(chatId === currentChatId) {
            currentChatId = null;
            localHistory = [];
            await showPersonaSelectionScreen();
        } else {
            await renderAllChats();
        }
    } catch (error) {
        console.error("Lỗi khi xóa cuộc trò chuyện:", error);
        showToast('Lỗi khi xóa cuộc trò chuyện.', 'error');
    }
}

// --- REFERENCE MODAL FUNCTIONS ---
function showReferenceModal(title, showInput) {
    referenceTitle.textContent = title;
    referenceInputArea.style.display = showInput ? 'block' : 'none';
    referenceModalOverlay.classList.remove('hidden');
    referenceModal.classList.remove('hidden');
    if (showInput) {
        referenceHistory = [];
        referenceChat = fastModel.startChat({ history: [] });
        referenceContent.innerHTML = '';
        addMessageToReference('ai', 'Đây là trợ lý phụ. Bạn cần tra cứu nhanh gì không?');
    }
}

function closeReferenceModal() {
    referenceModalOverlay.classList.add('hidden');
    referenceModal.classList.add('hidden');
}

function addMessageToReference(role, text) {
     const messageWrapper = document.createElement('div');
    let contentElem, statusElem;

    if (role === 'ai') {
        messageWrapper.className = 'w-full space-y-2';
        messageWrapper.innerHTML = `<div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-tr from-green-400 to-cyan-500 flex items-center justify-center">${svgIcons.refAssistant}</div><span class="font-semibold text-gray-800 dark:text-gray-200">Trợ lý Phụ</span></div><div class="ai-status"></div></div><div class="message-content text-gray-800 dark:text-gray-200"></div><div class="message-actions mt-2 flex justify-end gap-2"></div>`;
         contentElem = messageWrapper.querySelector('.message-content');
         statusElem = messageWrapper.querySelector('.ai-status');
    } else {
         messageWrapper.className = 'flex justify-end';
        messageWrapper.innerHTML = `<div class="message-content px-4 py-2 rounded-2xl bg-blue-600 text-white max-w-xs sm:max-w-md lg:max-w-2xl"></div>`;
         contentElem = messageWrapper.querySelector('.message-content');
    }
   
    contentElem.innerHTML = DOMPurify.sanitize(marked.parse(text));
    referenceContent.appendChild(messageWrapper);
    messageWrapper.scrollIntoView({ behavior: "smooth", block: "end" });
    return { messageWrapper, contentElem, statusElem };
}

async function sendReferenceMessage(userPromptOverride = null) {
    const userPrompt = userPromptOverride || referencePromptInput.value.trim();
    if (!userPrompt) return;
    
    referenceSendBtn.disabled = true;
    if (!userPromptOverride) {
        referencePromptInput.value = '';
    }
    addMessageToReference('user', userPrompt);
    const { messageWrapper, contentElem } = addMessageToReference('ai', '<span class="blinking-cursor"></span>');

    try {
        const result = await referenceChat.sendMessageStream(userPrompt);
        let fullResponseText = "";
        for await (const chunk of result.stream) {
            fullResponseText += chunk.text();
            contentElem.innerHTML = DOMPurify.sanitize(marked.parse(fullResponseText)) + '<span class="blinking-cursor"></span>';
            referenceContent.scrollTop = referenceContent.scrollHeight;
        }
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(fullResponseText));

        const actionsContainer = messageWrapper.querySelector('.message-actions');
        if (actionsContainer && fullResponseText.trim()) {
            const saveNoteBtn = document.createElement('button');
            saveNoteBtn.className = 'flex items-center gap-2 text-xs px-3 py-1 bg-yellow-200 dark:bg-slate-600 text-yellow-800 dark:text-yellow-200 rounded-full hover:bg-yellow-300 dark:hover:bg-slate-500 transition-colors';
            saveNoteBtn.innerHTML = `${svgIcons.saveNote} <span>Lưu Ghi chú</span>`;
            saveNoteBtn.onclick = () => saveAsNote(userPrompt, fullResponseText);
            actionsContainer.appendChild(saveNoteBtn);
        }
        
        setTimeout(() => {
             messageWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);

    } catch (error) {
        contentElem.innerHTML = `**Lỗi:** ${error.message}`;
        showToast('Lỗi khi gửi tin nhắn cho trợ lý phụ.', 'error');
    } finally {
        referenceSendBtn.disabled = false;
    }
}

async function saveAsNote(prompt, response) {
    if (!response.trim()) return;
    const fullNoteText = `**Hỏi:** ${prompt}\n\n<hr class="my-2 border-yellow-300 dark:border-slate-600"/>\n\n**Đáp:**\n${response}`;
    const noteMessage = { role: 'note', parts: [{ text: fullNoteText }] };
    localHistory.push(noteMessage);
    addMessage('note', fullNoteText);
    await updateConversationInDb();
    closeReferenceModal();
    showToast('Đã lưu ghi chú vào cuộc trò chuyện!', 'info');
}

async function explainTerm(term, context, isDeepDive = false) {
    if (!isDeepDive) {
        showReferenceModal(`Giải thích: ${term}`, false);
    }
    referenceContent.innerHTML = '';
    
    const prompt = isDeepDive 
        ? `Hãy giải thích chuyên sâu về thuật ngữ "${term}", bao gồm định nghĩa đầy đủ, ví dụ cụ thể, và các ứng dụng chính của nó.`
        : `Trong ngữ cảnh của câu sau: "${context.substring(0, 500)}", hãy giải thích thuật ngữ "${term}" một cách ngắn gọn và dễ hiểu trong 1-2 câu.`;

    const { contentElem, messageWrapper, statusElem } = addMessageToReference('ai', '<span class="blinking-cursor"></span>');
    if (statusElem) {
        statusElem.textContent = 'Đang suy nghĩ...';
        statusElem.classList.remove('hidden');
    }
    
    try {
        const result = await fastModel.generateContent(prompt);
        const responseText = result.response.text();
        if(statusElem) statusElem.classList.add('hidden');
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(responseText));

        if (!isDeepDive) {
            const actionsContainer = messageWrapper.querySelector('.message-actions');
            if(actionsContainer){
                const deepDiveBtn = document.createElement('button');
                deepDiveBtn.className = 'flex items-center gap-2 text-xs px-3 py-1 bg-blue-100 dark:bg-slate-600 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-slate-500 transition-colors';
                deepDiveBtn.innerHTML = `<span>Tìm hiểu sâu hơn</span> 📖`;
                deepDiveBtn.onclick = () => explainTerm(term, context, true);
                actionsContainer.appendChild(deepDiveBtn);
            }
        }

    } catch (error) {
         if(statusElem) statusElem.classList.add('hidden');
        contentElem.innerHTML = `**Lỗi:** ${error.message}`;
        showToast('Không thể giải thích thuật ngữ.', 'error');
    }
}

async function generateSystemPrompt() {
    const name = personaNameInput.value.trim();
    const description = personaDescriptionInput.value.trim();

    if (!name || !description) {
        showToast('Vui lòng nhập Tên và Mô tả ngắn.', 'error');
        return;
    }

    const originalBtnContainer = generatePromptBtn.firstElementChild;
    generatePromptBtn.innerHTML = svgIcons.spinner;
    generatePromptBtn.disabled = true;

    try {
        const prompt = `Dựa trên một chuyên gia có tên là '${name}' và mô tả '${description}', hãy viết một Chỉ thị Hệ thống (System Prompt) chi tiết và chuyên nghiệp bằng tiếng Việt. Chỉ thị này cần bao gồm: phong cách, quy tắc hoạt động, và các yêu cầu về định dạng đầu ra. **Yêu cầu bổ sung:** Trong quá trình trả lời, khi bạn đề cập đến một thuật ngữ kỹ thuật, một khái niệm quan trọng, hoặc một tên riêng, hãy bọc thuật ngữ đó trong cặp dấu ngoặc vuông để có thể nhấp để giải thích thêm. Ví dụ: 'sử dụng ngôn ngữ [Python] để phát triển [backend]'.`;
        const result = await fastModel.generateContent(prompt);
        personaPromptInput.value = result.response.text();
    } catch (error) {
        console.error("Lỗi khi tạo gợi ý prompt:", error);
        personaPromptInput.value = "Rất tiếc, không thể tạo gợi ý lúc này. Vui lòng thử lại.";
        showToast('Không thể tạo gợi ý prompt.', 'error');
    } finally {
        generatePromptBtn.innerHTML = '';
        generatePromptBtn.appendChild(originalBtnContainer);
        generatePromptBtn.disabled = false;
    }
}

async function handleLearningPromptClick(linkElement) {
    const promptForAI = linkElement.dataset.prompt;
    if (!promptForAI) return;

    const titleForDisplay = linkElement.textContent;
    await sendMessage(titleForDisplay);
}

// --- GLOBAL EVENT LISTENERS ---
createPersonaBtn.addEventListener('click', () => openPersonaModal());
closePersonaModalBtn.addEventListener('click', closePersonaModal);
cancelPersonaBtn.addEventListener('click', closePersonaModal);
personaModalOverlay.addEventListener('click', closePersonaModal);
personaForm.addEventListener('submit', handleSavePersona);
generatePromptBtn.addEventListener('click', generateSystemPrompt);
newChatBtn.addEventListener('click', showPersonaSelectionScreen);
newTopicBtn.addEventListener('click', () => {
    if (currentPersona) {
        startNewChat(currentPersona.id, !!currentPersona.ownerId);
    } else {
        showPersonaSelectionScreen();
    }
});
summarizeBtn.addEventListener('click', handleSummary);
sendBtn.addEventListener('click', () => sendMessage());
promptInput.addEventListener('keydown', e => { 
    if (e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        sendMessage(); 
    } 
});
promptInput.addEventListener('input', adjustInputHeight);
menuBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
toggleSuggestionsBtn.addEventListener('click', () => suggestionsContainer.classList.toggle('hidden'));
referenceBtn.addEventListener('click', () => showReferenceModal('Trợ lý Phụ', true));
closeReferenceModalBtn.addEventListener('click', closeReferenceModal);
referenceModalOverlay.addEventListener('click', closeReferenceModal);
referenceSendBtn.addEventListener('click', () => sendReferenceMessage());
referencePromptInput.addEventListener('keydown', e => { 
    if (e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        sendReferenceMessage(); 
    } 
});

function updateLearningModeIndicator() {
    if (learningModeIndicator) { 
        if (isLearningMode) {
            learningModeIndicator.classList.remove('hidden');
        } else {
            learningModeIndicator.classList.add('hidden');
        }
    }
}

learningModeToggle.addEventListener('change', async (e) => { 
    isLearningMode = e.target.checked;
    showToast(`Chế độ Học tập đã được ${isLearningMode ? 'bật' : 'tắt'}.`, 'info');
    updateLearningModeIndicator();

    // Refresh welcome screen suggestions when mode is toggled
    if (welcomeScreen.classList.contains('flex')) {
        await showWelcomeScreenForPersona(currentPersona);
    }
});

function resetActiveSpeechButton() {
    if (activeSpeech && activeSpeech.button) {
        activeSpeech.button.innerHTML = '🔊';
        activeSpeech.button.dataset.state = 'idle';
        activeSpeech.button.title = 'Đọc văn bản';
    }
}

chatContainer.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    const button = e.target.closest('button');

    if (link) {
        e.preventDefault();
        e.stopPropagation();
        if (link.classList.contains('learning-link')) {
            await handleLearningPromptClick(link);
        } else if (link.classList.contains('term-link')) {
            const term = link.dataset.term;
            const messageContentElement = link.closest('.message-content');
            const context = messageContentElement ? messageContentElement.dataset.rawText : '';
            await explainTerm(term, context);
        }
    } else if (button) {
         if (button.classList.contains('copy-btn')) {
            e.preventDefault(); e.stopPropagation();
            copyToClipboard(button.dataset.text);
         } else if (button.classList.contains('speak-btn')) {
            e.preventDefault(); e.stopPropagation();
            if (speechSynthesis.speaking || speechSynthesis.paused) {
                if (activeSpeech && activeSpeech.button === button) {
                    const currentState = button.dataset.state;
                    if (currentState === 'paused') {
                        speechSynthesis.resume();
                        button.innerHTML = '⏸️'; button.dataset.state = 'playing'; button.title = 'Tạm dừng';
                        return;
                    }
                    if (currentState === 'playing') {
                        speechSynthesis.pause();
                        button.innerHTML = '▶️'; button.dataset.state = 'Tiếp tục';
                        return;
                    }
                }
                speechSynthesis.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(button.dataset.text);
            utterance.lang = 'vi-VN';
            utterance.onstart = () => {
                resetActiveSpeechButton();
                activeSpeech = { utterance, button: button };
                button.innerHTML = '⏸️'; button.dataset.state = 'playing'; button.title = 'Tạm dừng';
            };
            utterance.onend = () => { resetActiveSpeechButton(); activeSpeech = null; };
            utterance.onerror = (event) => { 
                console.error("SpeechSynthesisUtterance error:", event);
                showToast(`Lỗi phát âm: ${event.error}`, 'error');
                resetActiveSpeechButton(); 
                activeSpeech = null; 
            };
            speechSynthesis.speak(utterance);
         }
    }
});

sidebarContent.addEventListener('scroll', () => {
    const isNearBottom = sidebarContent.scrollHeight - sidebarContent.scrollTop - sidebarContent.clientHeight < 100;
    if (isNearBottom && !isFetchingChats && !allChatsLoaded) {
        fetchRecentChats(true);
    }
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if(SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;

    recognition.onstart = () => { 
        isRecording = true; 
        recordBtn.classList.add('recording'); 
        promptInput.placeholder = 'Đang lắng nghe...'; 
    };
    recognition.onend = () => { 
        isRecording = false; 
        recordBtn.classList.remove('recording'); 
        promptInput.placeholder = 'Nhập câu hỏi...'; 
    };
    recognition.onresult = (event) => { 
        promptInput.value = event.results[event.results.length - 1][0].transcript.trim(); 
        adjustInputHeight(); 
        sendMessage(); 
    };
    recognition.onerror = (event) => { 
        showToast(`Lỗi ghi âm: ${event.error}`, 'error'); 
        console.error("Speech Recognition error:", event.error);
    };
    recordBtn.addEventListener('click', () => { 
        isRecording ? recognition.stop() : recognition.start(); 
    });
} else { 
    recordBtn.classList.add('hidden');
}

// --- Scroll to Top Button Logic ---
function toggleScrollToTopButton() {
    if (!scrollToTopBtn || !chatScrollContainer) return; 

    if (chatScrollContainer.scrollTop > chatScrollContainer.clientHeight * 0.5) { 
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
}

function scrollToTop() {
    if (chatScrollContainer) {
        chatScrollContainer.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadIcons(); 
    
    updateThemeIcon();

    if (chatScrollContainer) {
        chatScrollContainer.addEventListener("scroll", toggleScrollToTopButton);
    }
    if (scrollToTopBtn) { 
        scrollToTopBtn.addEventListener("click", scrollToTop);
    }
    updateLearningModeIndicator();
});

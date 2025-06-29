// =================================================================================
// SCRIPT.JS - ỨNG DỤNG GEMINI CHAT
// Phiên bản tối ưu hóa - Giữ toàn bộ logic trong một tệp có cấu trúc.
// =================================================================================

import { svgIcons } from './icons.js';

// --- PHẦN 1: KHỞI TẠO VÀ CẤU HÌNH ---

// 1.1. Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBDUBufnsk1PQZTLYCJDqASMX8hEVHqkDc",
    authDomain: "aimind-2362a.firebaseapp.com",
    projectId: "aimind-2362a",
    storageBucket: "aimind-2362a.firebasestorage.app",
    messagingSenderId: "377635504319",
    appId: "1:377635504319:web:7c6dd3cf0c52dd302d860a"
};

// 1.2. Import và Khởi tạo các dịch vụ Firebase & AI
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getAI, getGenerativeModel } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-ai.js";
import { getFirestore, collection, doc, addDoc, updateDoc, getDoc, getDocs, deleteDoc, serverTimestamp, query, orderBy, limit, startAfter, where } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ai = getAI(app);
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
const fastModel = getGenerativeModel(ai, { model: "gemini-2.0-flash" });


// --- PHẦN 2: TRẠNG THÁI TOÀN CỤC VÀ CÁC HẰNG SỐ ---

// 2.1. Biến trạng thái
let currentUserId = null;
let currentUserName = '';
let currentChatId = null;
let localHistory = [];
let isRecording = false;
let isSummarizing = false;
let currentPersona = null;
let customPersonas = [];
let activeSpeech = null;
let lastVisibleChat = null;
let isFetchingChats = false;
let allChatsLoaded = false;
let isLearningMode = false;
let confirmationResolve = null;
let completedTopics = [];

// 2.2. Hằng số
const CHATS_PER_PAGE = 15;

// 2.3. Dữ liệu Persona mặc định
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
        id: 'language_tutor', 
        name: 'Gia sư Ngoại ngữ', 
        icon: '🌐', 
        description: 'Dạy từ vựng, ngữ pháp các ngôn ngữ Á Đông.', 
        systemPrompt: `**Chỉ thị hệ thống:** Bạn là một gia sư ngôn ngữ chuyên nghiệp và thân thiện, chuyên về các ngôn ngữ Á Đông (Tiếng Trung, Nhật, Hàn). Khi dạy, hãy tuân thủ nghiêm ngặt các quy tắc sau:
1.  **Định dạng từ vựng:** Khi giới thiệu một từ mới, luôn trình bày theo cấu trúc: Ký tự gốc, sau đó là phiên âm trong ngoặc tròn (), và cuối cùng là nghĩa tiếng Việt.
    * **Tiếng Trung:** 你好 (Nǐ hǎo) - Xin chào.
    * **Tiếng Nhật:** こんにちは (Konnichiwa) - Xin chào.
    * **Tiếng Hàn:** 안녕하세요 (Annyeonghaseyo) - Xin chào.
2.  **Câu ví dụ:** Luôn cung cấp ít nhất một câu ví dụ cho mỗi từ vựng hoặc điểm ngữ pháp. Câu ví dụ cũng phải có đủ 3 thành phần: Câu gốc, phiên âm, và bản dịch.
3.  **Rõ ràng và có cấu trúc:** Sử dụng Markdown (tiêu đề, danh sách) để tổ chức bài học một cách logic và dễ theo dõi. Giọng văn của bạn phải khích lệ và kiên nhẫn.`,
        samplePrompts: [
            "Dạy tôi 5 câu chào hỏi thông dụng trong tiếng Trung.",
            "Tạo một đoạn hội thoại ngắn về chủ đề đi mua sắm bằng tiếng Nhật.",
            "Sự khác biệt giữa '은/는' và '이/가' trong tiếng Hàn là gì?"
        ]
    }
];

// 2.4. Prompt hệ thống cho Chế độ Học tập
const LEARNING_MODE_SYSTEM_PROMPT = `**CHỈ THỊ HỆ THỐNG - CHẾ ĐỘ HỌC TẬP ĐANG BẬT**
Bạn là một người hướng dẫn học tập chuyên nghiệp. Khi người dùng yêu cầu một lộ trình học, hãy tuân thủ các quy tắc sau:
1.  **Tạo Lộ trình:** Trả lời bằng một danh sách có cấu trúc (dùng Markdown với gạch đầu dòng).
2.  **Tạo Liên kết Tương tác:** Đối với MỖI MỤC trong lộ trình, bạn PHẢI định dạng nó theo cú pháp đặc biệt sau: \`[Tên mục học]{"prompt":"Yêu cầu chi tiết để giải thích về mục học này"}\`
    * **[Tên mục học]**: Là tiêu đề của bài học. QUAN TRỌNG: Bên trong "Tên mục học", bạn không được sử dụng thêm dấu ngoặc vuông \`[]\` để nhấn mạnh bất kỳ thuật ngữ nào nào khác. Hãy viết tên mục một cách tự nhiên.
    * **{"prompt":"..."}**: Là một đối tượng JSON chứa một khóa "prompt". Giá trị của khóa này là một câu lệnh đầy đủ bạn tự tạo ra để yêu cầu chính bạn giải thích sâu về mục học đó. Prompt phải chi tiết và bằng tiếng Việt.`;


// --- PHẦN 3: BỘ CHỌN CÁC PHẦN TỬ DOM ---

const DOM = {
    authContainer: document.getElementById('auth-container'),
    appContainer: document.getElementById('app-container'),
    loginView: document.getElementById('login-view'),
    registerView: document.getElementById('register-view'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    googleLoginBtn: document.getElementById('google-login-btn'),
    showRegisterBtn: document.getElementById('show-register'),
    showLoginBtn: document.getElementById('show-login'),
    authError: document.getElementById('auth-error'),
    personaSelectionScreen: document.getElementById('persona-selection-screen'),
    welcomeUserName: document.getElementById('welcome-user-name'),
    createPersonaBtn: document.getElementById('create-persona-btn'),
    customPersonaGrid: document.getElementById('custom-persona-grid'),
    emptyCustomPersonaState: document.getElementById('empty-custom-persona-state'),
    defaultPersonaGrid: document.getElementById('default-persona-grid'),
    logoutBtnPersona: document.getElementById('logout-btn-persona'),
    chatViewContainer: document.getElementById('chat-view-container'),
    menuBtn: document.getElementById('menu-btn'),
    chatHeaderInfo: document.getElementById('chat-header-info'),
    newTopicBtn: document.getElementById('new-topic-btn'),
    summarizeBtn: document.getElementById('summarize-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    logoutBtn: document.getElementById('logout-btn'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    sidebar: document.getElementById('sidebar'),
    closeSidebarBtn: document.getElementById('close-sidebar-btn'),
    sidebarContent: document.getElementById('sidebar-content'),
    newChatBtn: document.getElementById('new-chat-btn'),
    pinnedChatsSection: document.getElementById('pinned-chats-section'),
    pinnedChatsList: document.getElementById('pinned-chats-list'),
    savedChatsList: document.getElementById('saved-chats-list'),
    savedChatsSkeleton: document.getElementById('saved-chats-skeleton'),
    welcomeScreen: document.getElementById('welcome-screen'),
    chatContainer: document.getElementById('chat-container'),
    notificationArea: document.getElementById('notification-area'),
    toggleSuggestionsBtn: document.getElementById('toggle-suggestions-btn'),
    suggestionsContainer: document.getElementById('suggestions-container'),
    promptInput: document.getElementById('prompt-input'),
    recordBtn: document.getElementById('record-btn'),
    sendBtn: document.getElementById('send-btn'),
    personaModalOverlay: document.getElementById('persona-modal-overlay'),
    personaModal: document.getElementById('persona-modal'),
    personaModalTitle: document.getElementById('persona-modal-title'),
    closePersonaModalBtn: document.getElementById('close-persona-modal-btn'),
    personaForm: document.getElementById('persona-form'),
    personaIdInput: document.getElementById('persona-id'),
    personaNameInput: document.getElementById('persona-name'),
    personaIconInput: document.getElementById('persona-icon'),
    personaDescriptionInput: document.getElementById('persona-description'),
    personaPromptInput: document.getElementById('persona-prompt'),
    generatePromptBtn: document.getElementById('generate-prompt-btn'),
    confirmationModalOverlay: document.getElementById('confirmation-modal-overlay'),
    confirmationModal: document.getElementById('confirmation-modal'),
    confirmationModalIcon: document.getElementById('confirmation-modal-icon'),
    confirmationModalTitle: document.getElementById('confirmation-modal-title'),
    confirmationModalMessage: document.getElementById('confirmation-modal-message'),
    confirmationModalConfirmBtn: document.getElementById('confirmation-modal-confirm-btn'),
    confirmationModalCancelBtn: document.getElementById('confirmation-modal-cancel-btn'),
};


// --- PHẦN 4: CÁC HÀM TIỆN ÍCH (HELPERS) ---

// 4.1. Tiện ích Giao diện người dùng (UI)
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
        default:
            bgColor = 'bg-blue-100 dark:bg-blue-900';
            textColor = 'text-blue-700 dark:text-blue-200';
            iconSVG = svgIcons.toastInfo;
    }

    toast.className = `toast max-w-xs w-full ${bgColor} ${textColor} p-4 rounded-lg shadow-lg flex items-center space-x-3`;
    toast.innerHTML = `<div class="flex-shrink-0">${iconSVG}</div><div class="flex-1 text-sm font-medium">${message}</div>`;
    toastContainer.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 4000);
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Đã sao chép!', 'success');
    } catch (err) {
        showToast('Không thể sao chép.', 'error');
    }
    document.body.removeChild(textarea);
}

function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    if(darkIcon) darkIcon.style.display = isDark ? 'none' : 'block';
    if(lightIcon) lightIcon.style.display = isDark ? 'block' : 'none';
}

function adjustInputHeight() {
    DOM.promptInput.style.height = 'auto';
    DOM.promptInput.style.height = DOM.promptInput.scrollHeight + 'px';
}

function clearSuggestions() {
    DOM.suggestionsContainer.innerHTML = '';
    DOM.toggleSuggestionsBtn.classList.add('hidden');
}

// 4.2. Tiện ích Ngôn ngữ & Xử lý văn bản
function speakText(text, lang) {
    if (!('speechSynthesis' in window)) {
        showToast("Trình duyệt không hỗ trợ phát âm.", "error");
        return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    const voices = speechSynthesis.getVoices();
    const specificVoice = voices.find(voice => voice.lang === lang) || voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
    if (specificVoice) utterance.voice = specificVoice;
    
    utterance.onerror = (e) => showToast(`Lỗi phát âm: ${e.error}`, 'error');
    speechSynthesis.speak(utterance);
}

function makeForeignTextClickable(container) {
    const foreignRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]+/g;
    const hiraganaKatakanaRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
    const hangulRegex = /[\uAC00-\uD7AF]/;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const nodesToProcess = [];
    while (walker.nextNode()) nodesToProcess.push(walker.currentNode);

    nodesToProcess.forEach(node => {
        if (node.parentElement.closest('script, style, .clickable-foreign')) return;
        const text = node.nodeValue;
        foreignRegex.lastIndex = 0;
        if (!foreignRegex.test(text)) return;
        
        foreignRegex.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        while ((match = foreignRegex.exec(text)) !== null) {
            if (match.index > lastIndex) fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            const span = document.createElement('span');
            span.className = 'clickable-foreign';
            span.textContent = match[0];
            if (hangulRegex.test(match[0])) span.dataset.lang = 'ko-KR';
            else if (hiraganaKatakanaRegex.test(match[0])) span.dataset.lang = 'ja-JP';
            else span.dataset.lang = 'zh-CN';
            span.title = `Phát âm (${span.dataset.lang})`;
            fragment.appendChild(span);
            lastIndex = foreignRegex.lastIndex;
        }
        if (lastIndex < text.length) fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        if (fragment.hasChildNodes()) node.parentNode.replaceChild(fragment, node);
    });
}

function preprocessText(text) {
    const learningLinkRegex = /\[([^\]]+?)\]\{"prompt":"([^"]+?)"\}/g;
    const termLinkRegex = /\[([^\]]+?)\]/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = learningLinkRegex.exec(text)) !== null) {
        parts.push(text.substring(lastIndex, match.index));
        const title = match[1];
        let prompt;
        try {
            const promptData = JSON.parse(match[2]);
            prompt = promptData.prompt;
        } catch(e) {
            prompt = match[2];
        }
        const sanitizedPrompt = prompt.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        
        const isCompleted = completedTopics.includes(prompt);
        const completedClass = isCompleted ? ' completed' : '';
        
        parts.push(`<a href="#" class="learning-link${completedClass}" data-prompt="${sanitizedPrompt}">${title}</a>`);
        
        lastIndex = match.index + match[0].length;
    }

    parts.push(text.substring(lastIndex));

    return parts.map(part => {
        if (part.startsWith('<a href="#" class="learning-link')) {
            return part;
        }
        return part.replace(termLinkRegex, `<a href="#" class="term-link" data-term="$1">$1</a>`);
    }).join('');
}


function highlightAllCode(container) {
    container.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
        const preElement = block.parentElement;
        if (preElement && !preElement.querySelector('.copy-code-btn')) {
            const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.textContent = 'Copy';
            button.onclick = () => {
                copyToClipboard(block.innerText);
                button.textContent = 'Copied!';
                setTimeout(() => { button.textContent = 'Copy'; }, 2000);
            };
            preElement.appendChild(button);
        }
    });
}


// --- PHẦN 5: LOGIC CỐT LÕI CỦA ỨNG DỤNG ---

// 5.1. Logic về Chat
async function sendMessage(promptTextOverride = null) {
    DOM.welcomeScreen.classList.add('hidden');
    DOM.chatContainer.classList.remove('hidden');

    const userDisplayedText = promptTextOverride || DOM.promptInput.value.trim();
    if (!userDisplayedText || isSummarizing) return;

    if (!promptTextOverride) {
        DOM.promptInput.value = '';
        adjustInputHeight();
    }
    DOM.sendBtn.disabled = true;
    clearSuggestions();

    const userMessage = addMessage('user', userDisplayedText, currentPersona);
    localHistory.push({ id: userMessage.messageId, role: 'user', parts: [{ text: userDisplayedText }] });

    const { contentElem, statusElem, actionsContainer, messageId: aiMessageId } = addMessage('ai', '<span class="blinking-cursor"></span>', currentPersona);
    if (statusElem) statusElem.textContent = 'Đang suy nghĩ...';

    try {
        const historyForThisCall = localHistory.slice(0, -1)
            .filter(m => ['user', 'model'].includes(m.role))
            .map(({ role, parts }) => ({ role, parts }));
        
        let finalPrompt = userDisplayedText;
        if (isLearningMode && !promptTextOverride) {
            finalPrompt = `${LEARNING_MODE_SYSTEM_PROMPT}\n\nYêu cầu của người học: "${userDisplayedText}"`;
        }

        const chatSession = model.startChat({ history: historyForThisCall });
        const result = await chatSession.sendMessageStream(finalPrompt);

        let fullResponseText = "";
        let isFirstChunk = true;
        for await (const chunk of result.stream) {
            if (isFirstChunk && statusElem) {
                statusElem.textContent = 'Đang viết...';
                isFirstChunk = false;
            }
            fullResponseText += chunk.text();
            
            const processedChunk = preprocessText(fullResponseText + '<span class="blinking-cursor"></span>');
            contentElem.innerHTML = DOMPurify.sanitize(marked.parse(processedChunk), { ADD_ATTR: ['target', 'data-term', 'data-prompt'] });
            highlightAllCode(contentElem);
            if (currentPersona && currentPersona.id === 'language_tutor') {
                makeForeignTextClickable(contentElem);
            }
            DOM.chatContainer.scrollTop = DOM.chatContainer.scrollHeight;
        }

        if (statusElem) statusElem.classList.add('hidden');
        
        const finalProcessedText = preprocessText(fullResponseText);
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(finalProcessedText), {ADD_ATTR: ['target', 'data-term', 'data-prompt']});
        contentElem.dataset.rawText = fullResponseText;
        
        highlightAllCode(contentElem);
        if (currentPersona && currentPersona.id === 'language_tutor') {
            makeForeignTextClickable(contentElem);
        }

        addMessageActions(actionsContainer, fullResponseText, aiMessageId);
        
        setTimeout(() => contentElem.closest('.w-full')?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

        localHistory.push({ id: aiMessageId, role: 'model', parts: [{ text: fullResponseText }] });
        await updateConversationInDb();
        
        if (!isLearningMode) {
            await getFollowUpSuggestions(fullResponseText);
        } else {
            clearSuggestions();
        }

    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        contentElem.innerHTML = `**Lỗi:** ${error.message}`;
        if (localHistory.length > 0) localHistory.pop();
        showToast(`Lỗi gửi tin nhắn: ${error.message}`, 'error');
    } finally {
        DOM.sendBtn.disabled = false;
    }
}

async function updateConversationInDb() {
    if (!currentUserId || localHistory.length <= 2) return; 
    const chatData = { 
        history: localHistory, 
        updatedAt: serverTimestamp(), 
        personaId: currentPersona?.id || 'general',
        completedTopics: completedTopics || []
    };
    try {
        if (currentChatId) {
            await updateDoc(doc(db, 'chats', currentUserId, 'conversations', currentChatId), chatData);
        } else {
            const firstUserPrompt = localHistory.find(m => m.role === 'user' && m.parts[0].text !== currentPersona.systemPrompt);
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
    
    DOM.personaSelectionScreen.classList.add('hidden');
    DOM.chatViewContainer.classList.remove('hidden');
    DOM.chatViewContainer.classList.add('flex');
    closeSidebar();

    try {
        const chatDocRef = doc(db, 'chats', currentUserId, 'conversations', chatId);
        const chatDoc = await getDoc(chatDocRef);

        if (chatDoc.exists()) {
            const data = chatDoc.data();
            completedTopics = data.completedTopics || [];
            
            const loadedPersonaId = data.personaId || 'general';
            
            let foundPersona = defaultPersonas.find(p => p.id === loadedPersonaId);
            if (!foundPersona) {
                await fetchCustomPersonas();
                foundPersona = customPersonas.find(p => p.id === loadedPersonaId) || { id: 'deleted', name: 'Persona đã xóa', icon: '❓' };
            }
            currentPersona = foundPersona;
            updateChatHeader(currentPersona);
            
            currentChatId = chatDoc.id;
            localHistory = data.history || [];
            
            await renderAllChats();
            DOM.welcomeScreen.classList.add('hidden');
            DOM.chatContainer.classList.remove('hidden');
            DOM.chatContainer.innerHTML = ''; 
            DOM.chatContainer.appendChild(DOM.notificationArea);

            clearSuggestions();

            localHistory.slice(2).forEach(msg => {
                addMessage(msg.role, msg.parts[0].text, false);
            });
            setTimeout(() => DOM.chatContainer.scrollTop = DOM.chatContainer.scrollHeight, 0);

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

// 5.2. Logic về Persona
async function fetchCustomPersonas() {
    if (!currentUserId) return;
    try {
        const personasCol = collection(db, 'users', currentUserId, 'customPersonas');
        const q = query(personasCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        customPersonas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Lỗi khi tải custom personas:", error);
    }
}

async function handleSavePersona(e) {
    e.preventDefault();
    if (!currentUserId) return;

    const personaData = {
        name: DOM.personaNameInput.value.trim(),
        icon: DOM.personaIconInput.value.trim() || '🤖',
        description: DOM.personaDescriptionInput.value.trim(),
        systemPrompt: DOM.personaPromptInput.value.trim(),
        ownerId: currentUserId
    };

    const personaId = DOM.personaIdInput.value;
    DOM.savePersonaBtn.disabled = true;
    try {
        if (personaId) {
            await updateDoc(doc(db, 'users', currentUserId, 'customPersonas', personaId), personaData);
        } else {
            personaData.createdAt = serverTimestamp();
            await addDoc(collection(db, 'users', currentUserId, 'customPersonas'), personaData);
        }
        closePersonaModal();
        showToast('Persona đã được lưu!', 'success');
        await showPersonaSelectionScreen();
    } catch (error) {
        console.error("Lỗi khi lưu persona:", error);
        showToast('Lỗi khi lưu persona.', 'error');
    } finally {
        DOM.savePersonaBtn.disabled = false;
    }
}

async function deletePersona(personaId, personaName) {
     const confirmed = await showConfirmationModal({
        title: `Xóa Persona "${personaName}"?`,
        message: 'Hành động này không thể hoàn tác.',
        confirmText: 'Xóa vĩnh viễn'
    });

    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, 'users', currentUserId, 'customPersonas', personaId));
        showToast(`Persona "${personaName}" đã được xóa.`, 'success');
        await showPersonaSelectionScreen();
    } catch (error) {
        console.error("Lỗi khi xóa persona:", error);
        showToast('Lỗi khi xóa persona.', 'error');
    }
}

async function showPersonaSelectionScreen() {
    DOM.chatViewContainer.classList.add('hidden');
    DOM.personaSelectionScreen.classList.remove('hidden');

    await fetchCustomPersonas();
    
    renderDefaultPersonas();
    DOM.customPersonaGrid.innerHTML = '';
    if (customPersonas.length > 0) {
        DOM.customPersonaGrid.classList.remove('hidden');
        DOM.emptyCustomPersonaState.classList.add('hidden');
        customPersonas.forEach(p => {
            const card = createPersonaCard(p, true);
            card.onclick = () => startNewChat(p.id, true);
            DOM.customPersonaGrid.appendChild(card);
        });
    } else {
        DOM.customPersonaGrid.classList.add('hidden');
        DOM.emptyCustomPersonaState.classList.remove('hidden');
    }
}


// --- PHẦN 6: TRÌNH LẮNG NGHE SỰ KIỆN & KHỞI CHẠY ---

function setupEventListeners() {
    // Xác thực
    DOM.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, DOM.loginForm['login-email'].value, DOM.loginForm['login-password'].value);
        } catch (error) { showToast('Email hoặc mật khẩu không đúng.', 'error'); }
    });
    DOM.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, DOM.registerForm['register-email'].value, DOM.registerForm['register-password'].value);
        } catch (error) { showToast('Không thể tạo tài khoản.', 'error'); }
    });
    DOM.googleLoginBtn.addEventListener('click', () => signInWithPopup(auth, new GoogleAuthProvider()));
    DOM.logoutBtn.addEventListener('click', () => signOut(auth));
    DOM.logoutBtnPersona.addEventListener('click', () => signOut(auth));
    
    // Chuyển đổi form
    DOM.showRegisterBtn.addEventListener('click', () => {
        DOM.loginView.classList.add('hidden');
        DOM.registerView.classList.remove('hidden');
    });
    DOM.showLoginBtn.addEventListener('click', () => {
        DOM.registerView.classList.add('hidden');
        DOM.loginView.classList.remove('hidden');
    });
    
    // Chat
    DOM.sendBtn.addEventListener('click', () => sendMessage());
    DOM.promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Giao diện chung
    DOM.newChatBtn.addEventListener('click', showPersonaSelectionScreen);
    DOM.themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon();
    });
    DOM.menuBtn.addEventListener('click', () => DOM.sidebar.classList.remove('-translate-x-full'));
    DOM.closeSidebarBtn.addEventListener('click', () => DOM.sidebar.classList.add('-translate-x-full'));
    DOM.sidebarOverlay.addEventListener('click', () => DOM.sidebar.classList.add('-translate-x-full'));
    
    // Event Delegation cho các phần tử động
    DOM.chatContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('.clickable-foreign')) {
            const foreignWord = target.closest('.clickable-foreign');
            speakText(foreignWord.textContent, foreignWord.dataset.lang);
        } else if (target.closest('.copy-btn')) {
            copyToClipboard(target.closest('.copy-btn').dataset.text);
        }
    });

    // Modals
    DOM.createPersonaBtn.addEventListener('click', () => openPersonaModal());
    DOM.closePersonaModalBtn.addEventListener('click', closePersonaModal);
    document.getElementById('cancel-persona-btn').addEventListener('click', closePersonaModal);
    DOM.personaModalOverlay.addEventListener('click', closePersonaModal);
    DOM.personaForm.addEventListener('submit', handleSavePersona);
    DOM.generatePromptBtn.addEventListener('click', generateSystemPrompt);

    DOM.confirmationModalCancelBtn.addEventListener('click', () => hideConfirmationModal(false));
    DOM.confirmationModalConfirmBtn.addEventListener('click', () => hideConfirmationModal(true));
    DOM.confirmationModalOverlay.addEventListener('click', (e) => {
        if(e.target === DOM.confirmationModalOverlay) hideConfirmationModal(false);
    });
}

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    (function loadIcons() {
        document.querySelectorAll('[data-icon]').forEach(placeholder => {
            if (svgIcons[placeholder.dataset.icon]) {
                const template = document.createElement('template');
                template.innerHTML = svgIcons[placeholder.dataset.icon];
                placeholder.replaceWith(template.content.firstChild);
            }
        });
    })();
    
    updateThemeIcon();
    setupEventListeners();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            currentUserName = user.displayName || user.email.split('@')[0];
            DOM.welcomeUserName.textContent = currentUserName;
            DOM.authContainer.classList.add('hidden');
            DOM.appContainer.classList.remove('hidden');
            await showPersonaSelectionScreen();
        } else {
            currentUserId = null;
            currentUserName = '';
            currentPersona = null;
            customPersonas = [];
            localHistory = [];
            DOM.authContainer.classList.remove('hidden');
            DOM.appContainer.classList.add('hidden');
        }
    });
});

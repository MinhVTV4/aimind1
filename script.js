import { svgIcons } from './icons.js';

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
const fastModel = getGenerativeModel(ai, { model: "gemini-2.0-flash" });

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
let confirmationResolve = null; // To handle promise-based confirmation
let completedTopics = []; // === BIẾN MỚI: Lưu trữ các chủ đề đã học ===

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


// === CẬP NHẬT: Thêm các biến cho modal xác nhận ===
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
const confirmationModalOverlay = document.getElementById('confirmation-modal-overlay');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationModalIcon = document.getElementById('confirmation-modal-icon');
const confirmationModalTitle = document.getElementById('confirmation-modal-title');
const confirmationModalMessage = document.getElementById('confirmation-modal-message');
const confirmationModalConfirmBtn = document.getElementById('confirmation-modal-confirm-btn');
const confirmationModalCancelBtn = document.getElementById('confirmation-modal-cancel-btn');


// --- CẬP NHẬT: Nâng cấp persona "Gia sư Ngoại ngữ" ---
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
            "Giải thích sự khác biệt giữa \`let\`, \`const\`, và \`var\` trong JavaScript.",
            "Làm thế nào để tối ưu một truy vấn SQL có sử dụng \`JOIN\` trên nhiều bảng lớn?"
        ]
    },
    // === PERSONA ĐƯỢC NÂNG CẤP VỚI TÍNH NĂNG TRẮC NGHIỆM VÀ PHÁT ÂM ===
    { 
        id: 'language_tutor', 
        name: 'Gia sư Ngoại ngữ', 
        icon: '🌐', 
        description: 'Dạy từ vựng, ngữ pháp và kiểm tra kiến thức.', 
        systemPrompt: `**Chỉ thị hệ thống:** Bạn là một gia sư ngôn ngữ chuyên nghiệp, thân thiện, chuyên về các ngôn ngữ Á Đông (Tiếng Trung, Nhật, Hàn) và Tiếng Anh. Khi dạy, hãy tuân thủ nghiêm ngặt các quy tắc sau:

1.  **Định dạng từ vựng:** Khi giới thiệu một từ mới, luôn trình bày theo cấu trúc: Ký tự gốc (nếu có), sau đó là phiên âm trong ngoặc tròn (), và cuối cùng là nghĩa tiếng Việt.
    * **Tiếng Anh:** Hello (həˈloʊ) - Xin chào.
    * **Tiếng Trung:** 你好 (Nǐ hǎo) - Xin chào.
    * **Tiếng Nhật:** こんにちは (Konnichiwa) - Xin chào.
    * **Tiếng Hàn:** 안녕하세요 (Annyeonghaseyo) - Xin chào.

2.  **Câu ví dụ:** Luôn cung cấp ít nhất một câu ví dụ thực tế cho mỗi từ vựng hoặc điểm ngữ pháp. Câu ví dụ cũng phải có đủ 3 thành phần: Câu gốc, phiên âm (nếu là ngôn ngữ Á Đông), và bản dịch tiếng Việt.
    * **Tiếng Anh ví dụ:** Good morning (ɡʊd ˈmɔːrnɪŋ) - Chào buổi sáng.
    * **Tiếng Trung ví dụ:** 早上好 (Zǎo shàng hǎo) - Chào buổi sáng.

3.  **Rõ ràng và có cấu trúc:** Sử dụng Markdown (tiêu đề, danh sách) để tổ chức bài học một cách logic và dễ theo dõi. Giọng văn của bạn phải khích lệ và kiên nhẫn.

4.  **Tương tác chủ động:** Sau khi giảng dạy một khái niệm (khoảng 3-5 từ vựng hoặc một điểm ngữ pháp), bạn PHẢI chủ động đặt câu hỏi cho người học để kiểm tra sự hiểu biết của họ. Sử dụng cú pháp đặc biệt sau để tạo câu hỏi trắc nghiệm trong một khối mã 'quiz':
    \`\`\`quiz
    {
      "question": "Câu hỏi của bạn ở đây bằng tiếng Việt?",
      "options": {
        "A": "Lựa chọn A",
        "B": "Lựa chọn B",
        "C": "Lựa chọn C"
      },
      "answer": "A",
      "explanation": "Giải thích chi tiết tại sao đáp án đó đúng, bằng tiếng Việt."
    }
    \`\`\`

5.  **Tạo lộ trình học:** Khi người dùng yêu cầu một lộ trình học (ví dụ: "dạy tôi tiếng Nhật cơ bản"), hãy sử dụng cú pháp [Chủ đề]{"prompt":"..."} để tạo các bài học tương tác.
6.  **Hỗ trợ phát âm:** Khi bạn đưa ra các từ/cụm từ tiếng Trung, Nhật, Hàn hoặc Anh, đặc biệt là các từ mới, hãy luôn kèm theo phiên âm. Người dùng sẽ có thể nhấp vào từ đó để nghe phát âm.`,
        samplePrompts: [
            "Dạy tôi 5 câu chào hỏi thông dụng trong tiếng Trung và sau đó kiểm tra tôi.",
            "Tạo một đoạn hội thoại ngắn về chủ đề đi mua sắm bằng tiếng Nhật, rồi đố tôi một câu hỏi.",
            "Sự khác biệt giữa '은/는' và '이/가' trong tiếng Hàn là gì? Cho ví dụ và một câu hỏi trắc nghiệm.",
            "Dạy tôi cách chào hỏi cơ bản trong tiếng Anh và kiểm tra tôi."
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

// --- HÀM MỚI: Logic cho Modal Xác nhận ---

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
const confirmationModalOverlay = document.getElementById('confirmation-modal-overlay');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationModalIcon = document.getElementById('confirmation-modal-icon');
const confirmationModalTitle = document.getElementById('confirmation-modal-title');
const confirmationModalMessage = document.getElementById('confirmation-modal-message');
const confirmationModalConfirmBtn = document.getElementById('confirmation-modal-confirm-btn');
const confirmationModalCancelBtn = document.getElementById('confirmation-modal-cancel-btn');


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


// --- CHAT LOGIC ---

/**
 * === HÀM MỚI: Dành riêng cho việc render HTML của một khối trắc nghiệm ===
 * @param {object} data - Dữ liệu JSON của quiz đã được parse.
 * @param {string} quizId - Một ID duy nhất cho khối quiz này.
 * @returns {HTMLElement} - Phần tử DOM của khối quiz.
 */
function renderQuiz(data, quizId) {
    let optionsHtml = '';
    const letters = Object.keys(data.options);
    letters.forEach(letter => {
        optionsHtml += `
            <button class="quiz-option-btn" data-quiz-id="${quizId}" data-option="${letter}">
                <span class="quiz-option-letter">${letter}</span>
                <span class="quiz-option-text">${DOMPurify.sanitize(data.options[letter])}</span>
            </button>
        `;
    });

    const quizWrapper = document.createElement('div');
    quizWrapper.className = "my-4 p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50";
    quizWrapper.id = quizId;
    // Lưu trữ toàn bộ dữ liệu quiz trên DOM element để dễ dàng truy xuất sau này
    quizWrapper.dataset.quizData = JSON.stringify(data);

    quizWrapper.innerHTML = `
        <p class="font-semibold mb-3 text-gray-800 dark:text-gray-200">${DOMPurify.sanitize(data.question)}</p>
        <div class="space-y-2">
            ${optionsHtml}
        </div>
        <div class="quiz-explanation mt-3 hidden text-sm p-3 rounded-lg"></div>
    `;
    return quizWrapper;
}

/**
 * === HÀM MỚI: Xử lý khi người dùng chọn một đáp án trắc nghiệm ===
 * @param {HTMLElement} button - Nút đáp án mà người dùng đã nhấn.
 */
function handleQuizAnswer(button) {
    const quizId = button.dataset.quizId;
    const selectedOption = button.dataset.option;
    const quizContainer = document.getElementById(quizId);
    
    if (!quizContainer || !quizContainer.dataset.quizData) return;

    const allOptions = quizContainer.querySelectorAll('.quiz-option-btn');
    const quizData = JSON.parse(quizContainer.dataset.quizData);
    const correctAnswer = quizData.answer;
    const explanation = quizData.explanation;

    // Vô hiệu hóa tất cả các lựa chọn và hiển thị kết quả
    allOptions.forEach(opt => {
        opt.disabled = true;
        const optionLetter = opt.dataset.option;
        if (optionLetter === correctAnswer) {
            opt.classList.add('correct');
        }
        if (optionLetter === selectedOption && selectedOption !== correctAnswer) {
            opt.classList.add('incorrect');
        }
    });

    // Hiển thị phần giải thích
    const explanationDiv = quizContainer.querySelector('.quiz-explanation');
    if (explanation) {
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Giải thích:** ${explanation}`));
        explanationDiv.classList.remove('hidden');
        // Thêm class màu nền dựa trên kết quả
        if (selectedOption === correctAnswer) {
            explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        } else {
            explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
        }
    }
}

/**
 * === HÀM MỚI: Tìm và thay thế các khối mã quiz bằng HTML tương tác ===
 * Hàm này sẽ được gọi sau khi nội dung markdown đã được render.
 * @param {HTMLElement} containerElement - Phần tử chứa nội dung tin nhắn.
 */
function processQuizBlocks(containerElement) {
    // Tìm các khối mã có class 'language-quiz' do marked.js tạo ra
    const quizCodeBlocks = containerElement.querySelectorAll('pre code.language-quiz');
    quizCodeBlocks.forEach(codeBlock => {
        const preElement = codeBlock.parentElement;
        try {
            const quizData = JSON.parse(codeBlock.textContent);
            const quizId = `quiz-${crypto.randomUUID()}`;
            const quizHtmlElement = renderQuiz(quizData, quizId);
            // Thay thế thẻ <pre> bằng khối quiz tương tác
            preElement.replaceWith(quizHtmlElement);
        } catch (error) {
            console.error("Lỗi phân tích JSON của quiz:", error, codeBlock.textContent);
            preElement.innerHTML = `<div class="text-red-500">Lỗi hiển thị quiz. Định dạng JSON không hợp lệ.</div>`;
        }
    });
}


/**
 * Speaks a given text using the browser's Speech Synthesis API.
 * @param {string} text - The text to be spoken.
 * @param {string} lang - The BCP 47 language code (e.g., 'zh-CN', 'ja-JP', 'ko-KR', 'en-US').
 */
function speakText(text, lang) {
    if (!('speechSynthesis' in window)) {
        showToast("Trình duyệt không hỗ trợ phát âm.", "error");
        return;
    }
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voices = speechSynthesis.getVoices();
    const specificVoice = voices.find(voice => voice.lang === lang);
    if (specificVoice) {
        utterance.voice = specificVoice;
    } else {
        const baseLang = lang.split('-')[0];
        const fallbackVoice = voices.find(voice => voice.lang.startsWith(baseLang));
        if (fallbackVoice) {
            utterance.voice = fallbackVoice;
        } else {
            // Fallback for English if no specific voice is found
            if (baseLang === 'en') {
                const enVoice = voices.find(voice => voice.lang.startsWith('en'));
                if (enVoice) utterance.voice = enVoice;
            }
        }
    }

    utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance error:", event);
        if (event.error === 'no-speech' || event.error === 'not-allowed') {
             showToast(`Không tìm thấy hoặc không thể dùng giọng đọc cho ngôn ngữ ${lang}.`, 'error');
        } else {
             showToast(`Lỗi phát âm: ${event.error}`, 'error');
        }
    };

    speechSynthesis.speak(utterance);
}

/**
 * Finds foreign characters (Chinese, Japanese, Korean) and English words in an element's text nodes 
 * and wraps them in a clickable span that can be used for pronunciation.
 * @param {HTMLElement} container - The element whose text nodes should be processed.
 */
function makeForeignTextClickable(container) {
    // Combined regex for CJK and English words.
    // This regex will NOT match Vietnamese characters (e.g., "á", "à", "ẽ")
    // It specifically looks for CJK Unicode ranges and standard English alphabet characters.
    const foreignAndEnglishRegex = /([\u4E00-\u9FFF]+|[\u3040-\u309F\u30A0-\u30FF]+|[\uAC00-\uD7AF]+|[a-zA-Z']+)/g;
    const hiraganaKatakanaRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
    const hangulRegex = /[\uAC00-\uD7AF]/;
    const englishRegex = /[a-zA-Z']+/; // Simple regex for English words (letters and apostrophes)

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const nodesToProcess = [];
    let currentNode;
    while (currentNode = walker.nextNode()) {
        nodesToProcess.push(currentNode);
    }

    nodesToProcess.forEach(textNode => {
        // Avoid processing inside code blocks or already processed clickable spans
        if (textNode.parentElement.closest('pre, code, .clickable-foreign')) {
            return;
        }

        const text = textNode.nodeValue;
        foreignAndEnglishRegex.lastIndex = 0; // Reset regex lastIndex for each node
        if (!foreignAndEnglishRegex.test(text)) {
            return;
        }
        foreignAndEnglishRegex.lastIndex = 0; // Reset again after test

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = foreignAndEnglishRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            const span = document.createElement('span');
            span.className = 'clickable-foreign';
            span.textContent = match[0];
            
            // Determine language based on the matched text
            if (hangulRegex.test(match[0])) {
                span.dataset.lang = 'ko-KR';
            } else if (hiraganaKatakanaRegex.test(match[0])) {
                span.dataset.lang = 'ja-JP';
            } else if (englishRegex.test(match[0])) { 
                // A stricter check for English words (no Vietnamese diacritics)
                // This might need more refinement if dealing with complex mixed text
                span.dataset.lang = 'en-US'; 
            } else { 
                // Assume Chinese for remaining CJK characters
                span.dataset.lang = 'zh-CN';
            }
            
            span.title = `Phát âm (${span.dataset.lang})`;
            fragment.appendChild(span);
            lastIndex = foreignAndEnglishRegex.lastIndex;
        }
        
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        
        if (fragment.hasChildNodes()) {
             textNode.parentNode.replaceChild(fragment, textNode);
        }
    });
}


/**
 * Hiển thị modal xác nhận với các tùy chọn.
 * @param {object} options - Các tùy chọn cho modal.
 * @param {string} options.title - Tiêu đề của modal.
 * @param {string} options.message - Thông điệp cảnh báo.
 * @param {string} [options.confirmText='Xóa'] - Chữ trên nút xác nhận.
 * @param {string} [options.confirmColor='red'] - Màu của nút xác nhận ('red' hoặc 'blue').
 * @returns {Promise<boolean>} - Trả về true nếu người dùng xác nhận, false nếu hủy.
 */
function showConfirmationModal({ title, message, confirmText = 'Xóa', confirmColor = 'red' }) {
    return new Promise(resolve => {
        confirmationResolve = resolve; // Lưu hàm resolve để sử dụng sau

        confirmationModalTitle.textContent = title;
        confirmationModalMessage.textContent = message;
        confirmationModalConfirmBtn.textContent = confirmText;

        // Reset màu nút
        confirmationModalConfirmBtn.classList.remove('bg-red-600', 'hover:bg-red-700', 'bg-blue-600', 'hover:bg-blue-700');
        
        if (confirmColor === 'red') {
            confirmationModalConfirmBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        } else {
            confirmationModalConfirmBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }

        confirmationModalIcon.innerHTML = svgIcons.warning || '<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>';

        confirmationModalOverlay.classList.remove('hidden');
        setTimeout(() => {
            confirmationModalOverlay.classList.add('opacity-100');
            confirmationModal.classList.add('scale-100', 'opacity-100');
            confirmationModal.classList.remove('scale-95', 'opacity-0');
        }, 10);
    });
}

function hideConfirmationModal() {
    confirmationModalOverlay.classList.remove('opacity-100');
    confirmationModal.classList.remove('scale-100', 'opacity-100');
    confirmationModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        confirmationModalOverlay.classList.add('hidden');
    }, 300);
}


// --- CẬP NHẬT CÁC HÀM XÓA ---

// Cập nhật hàm deletePersona để sử dụng modal mới
async function deletePersona(personaId, personaName) {
    const confirmed = await showConfirmationModal({
        title: `Xóa Persona "${personaName}"?`,
        message: 'Hành động này không thể hoàn tác. Tất cả các cuộc trò chuyện liên quan đến persona này cũng sẽ bị ảnh hưởng.',
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

// Cập nhật hàm deleteChat để sử dụng modal mới
async function deleteChat(chatId) {
    const confirmed = await showConfirmationModal({
        title: 'Xóa cuộc trò chuyện này?',
        message: 'Bạn có chắc chắn muốn xóa vĩnh viễn cuộc trò chuyện này không?',
        confirmText: 'Đồng ý xóa'
    });
    
    if (!confirmed) return;
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

    const finalParts = parts.map(part => {
        if (part.startsWith('<a href="#" class="learning-link')) {
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
    completedTopics = [];
    
    personaSelectionScreen.classList.add('hidden');
    chatViewContainer.classList.remove('hidden');
    chatViewContainer.classList.add('flex');

    updateChatHeader(currentPersona);
    updateLearningModeIndicator();
    
    currentChatId = null;
    chat = null;
    localHistory = [{
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ text: currentPersona.systemPrompt }],
    }, {
        id: crypto.randomUUID(),
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

function addMessageActions(actionsContainer, rawText, messageId) {
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

    const regenerateBtn = document.createElement('button');
    regenerateBtn.className = 'regenerate-btn p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors';
    regenerateBtn.innerHTML = svgIcons.regenerate;
    regenerateBtn.title = 'Tái tạo phản hồi';
    regenerateBtn.dataset.targetId = messageId;
    actionsContainer.appendChild(regenerateBtn);
}

function addMessage(role, text, shouldScroll = true) {
    const messageId = crypto.randomUUID();
    const messageWrapper = document.createElement('div');
    messageWrapper.dataset.messageId = messageId;

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

    highlightAllCode(contentElem);
    
    // === CẬP NHẬT: Gọi hàm xử lý quiz sau khi render nội dung ===
    processQuizBlocks(contentElem);

    // Chỉ thực hiện makeForeignTextClickable nếu persona hiện tại là 'language_tutor'
    if (currentPersona && currentPersona.id === 'language_tutor') {
        makeForeignTextClickable(contentElem);
    }
    
    if (actionsContainer) {
        addMessageActions(actionsContainer, text, messageId);
    }

    chatContainer.insertBefore(messageWrapper, notificationArea);
    if (shouldScroll) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    return { messageWrapper, contentElem, statusElem, actionsContainer, messageId };
}

function addCopyButton(preElement) {
    if (preElement.querySelector('.copy-code-btn')) return;
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.textContent = 'Copy';
    button.addEventListener('click', () => {
        const codeElement = preElement.querySelector('code');
        if (codeElement) {
            copyToClipboard(codeElement.innerText);
            button.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = 'Copy';
                button.classList.remove('copied');
            }, 2000);
        }
    });
    preElement.appendChild(button);
}

function highlightAllCode(container) {
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
        // Thêm class language-quiz nếu khối mã là quiz để hàm processQuizBlocks có thể tìm thấy
        if (block.textContent.trim().startsWith('{') && block.textContent.trim().endsWith('}')) {
             try {
                const potentialJson = JSON.parse(block.textContent);
                if (potentialJson.question && potentialJson.options && potentialJson.answer) {
                   block.classList.add('language-quiz');
                }
             } catch(e) { /* không phải JSON hợp lệ, bỏ qua */ }
        }
        hljs.highlightElement(block);
        addCopyButton(block.parentElement);
    });
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

        const { messageId } = addMessage('summary', summaryText);
        
        localHistory.push({ id: messageId, role: 'summary', parts: [{ text: summaryText }] });
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
    welcomeScreen.classList.add('hidden');
    welcomeScreen.classList.remove('flex');
    chatContainer.classList.remove('hidden');

    const userDisplayedText = promptTextOverride ? promptTextOverride : promptInput.value.trim(); 
    if (!userDisplayedText || isSummarizing) return;

    if (!promptTextOverride) {
        promptInput.value = '';
        adjustInputHeight();
    }
    sendBtn.disabled = true;
    clearSuggestions();

    const userMessage = addMessage('user', userDisplayedText);
    localHistory.push({ id: userMessage.messageId, role: 'user', parts: [{ text: userDisplayedText }] });

    const { messageWrapper, contentElem, statusElem, actionsContainer, messageId: aiMessageId } = addMessage('ai', '<span class="blinking-cursor"></span>');
    if (statusElem) statusElem.textContent = 'Đang suy nghĩ...';

    try {
        let historyForThisCall = [];
        const validHistory = localHistory.filter(m => ['user', 'model'].includes(m.role));
        if (validHistory.length > 1) {
             historyForThisCall = validHistory.slice(0, -1).map(({role, parts}) => ({role, parts}));
        }

        let finalPrompt;
        if (isLearningMode && !promptTextOverride) { 
            finalPrompt = `${LEARNING_MODE_SYSTEM_PROMPT}\n\nYêu cầu của người học: "${userDisplayedText}"`;
        } else {
            finalPrompt = userDisplayedText;
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
            
            // Tạm thời chỉ render link, không render quiz khi đang stream để tránh lỗi JSON
            const processedChunkForStreaming = preprocessText(fullResponseText + '<span class="blinking-cursor"></span>');
            contentElem.innerHTML = DOMPurify.sanitize(marked.parse(processedChunkForStreaming), { ADD_ATTR: ['target', 'data-term', 'data-prompt'] });
            highlightAllCode(contentElem);
            if (currentPersona && currentPersona.id === 'language_tutor') {
                makeForeignTextClickable(contentElem);
            }
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
        if (statusElem) statusElem.classList.add('hidden');
        
        // Render cuối cùng với đầy đủ quiz
        const finalProcessedText = preprocessText(fullResponseText);
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(finalProcessedText), {ADD_ATTR: ['target', 'data-term', 'data-prompt']});
        contentElem.dataset.rawText = fullResponseText;
        
        highlightAllCode(contentElem);
        processQuizBlocks(contentElem); // Xử lý quiz sau khi render xong
        if (currentPersona && currentPersona.id === 'language_tutor') {
            makeForeignTextClickable(contentElem);
        }

        addMessageActions(actionsContainer, fullResponseText, aiMessageId);
        
        setTimeout(() => messageWrapper.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

        localHistory.push({ id: aiMessageId, role: 'model', parts: [{ text: fullResponseText }] });
        await updateConversationInDb();
        
        if (!isLearningMode) {
            await getFollowUpSuggestions(fullResponseText);
        } else {
            clearSuggestions();
        }

    } catch (error) {
        console.error("Error during sendMessage:", error);
        contentElem.innerHTML = `**Lỗi:** ${error.message}`;
        if (localHistory.length > 0) localHistory.pop();
        showToast(`Lỗi gửi tin nhắn: ${error.message}`, 'error');
    } finally {
        sendBtn.disabled = false;
    }
}

async function handleRegenerate(targetMessageId) {
    const messageWrapper = document.querySelector(`[data-message-id="${targetMessageId}"]`);
    if (!messageWrapper) return;

    const messageIndex = localHistory.findIndex(m => m.id === targetMessageId);
    if (messageIndex < 1 || localHistory[messageIndex].role !== 'model') {
        showToast('Không thể tái tạo tin nhắn này.', 'error');
        return;
    }

    let userPrompt = null;
    let historyForCall = [];
    for (let i = messageIndex - 1; i >= 0; i--) {
        if (localHistory[i].role === 'user') {
            userPrompt = localHistory[i].parts[0].text;
            historyForCall = localHistory.slice(0, i).filter(m => ['user', 'model'].includes(m.role)).map(({role, parts}) => ({role, parts}));
            break;
        }
    }
    
    if (!userPrompt) {
        showToast('Không tìm thấy prompt gốc.', 'error');
        return;
    }

    const allButtons = messageWrapper.querySelectorAll('.message-actions button');
    allButtons.forEach(btn => btn.disabled = true);
    
    const contentElem = messageWrapper.querySelector('.message-content');
    const statusElem = messageWrapper.querySelector('.ai-status');
    const actionsContainer = messageWrapper.querySelector('.message-actions');
    
    contentElem.innerHTML = '<span class="blinking-cursor"></span>';
    if(statusElem) {
        statusElem.textContent = 'Đang suy nghĩ lại...';
        statusElem.classList.remove('hidden');
    }
    if(actionsContainer) actionsContainer.innerHTML = '';
    
    try {
        const chatSession = model.startChat({ history: historyForCall });
        const result = await chatSession.sendMessageStream(userPrompt);

        let newFullResponseText = "";
        for await (const chunk of result.stream) {
            newFullResponseText += chunk.text();
            const processedChunk = preprocessText(newFullResponseText + '<span class="blinking-cursor"></span>');
            contentElem.innerHTML = DOMPurify.sanitize(marked.parse(processedChunk), {ADD_ATTR: ['target', 'data-term', 'data-prompt']});
            highlightAllCode(contentElem);
            if (currentPersona && currentPersona.id === 'language_tutor') {
                makeForeignTextClickable(contentElem);
            }
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        if(statusElem) statusElem.classList.add('hidden');

        const finalProcessedText = preprocessText(newFullResponseText);
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(finalProcessedText), {ADD_ATTR: ['target', 'data-term', 'data-prompt']});
        contentElem.dataset.rawText = newFullResponseText;
        
        highlightAllCode(contentElem);
        processQuizBlocks(contentElem); // Xử lý quiz sau khi render xong
        if (currentPersona && currentPersona.id === 'language_tutor') {
            makeForeignTextClickable(contentElem);
        }

        localHistory[messageIndex].parts[0].text = newFullResponseText;
        addMessageActions(actionsContainer, newFullResponseText, targetMessageId);
        await updateConversationInDb();

    } catch (error) {
        console.error("Lỗi khi tái tạo:", error);
        contentElem.innerHTML = `**Lỗi:** Không thể tái tạo câu trả lời.`;
        showToast('Lỗi khi tái tạo câu trả lời.', 'error');
    } finally {
        allButtons.forEach(btn => btn.disabled = false);
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
            completedTopics = data.completedTopics || [];
            
            const loadedPersonaId = data.personaId || 'general';
            
            let foundPersona = defaultPersonas.find(p => p.id === loadedPersonaId);
            if (!foundPersona) {
                await fetchCustomPersonas();
                foundPersona = customPersonas.find(p => p.id === loadedPersonaId);
                if (!foundPersona) {
                     const personaDocRef = doc(db, 'users', currentUserId, 'customPersonas', loadedPersonaId);
                    const personaDoc = await getDoc(personaDocRef);
                    if (personaDoc.exists()) {
                        foundPersona = { id: personaDoc.id, ...personaDoc.data() };
                    } else {
                        foundPersona = { id: 'deleted', name: 'Persona đã xóa', icon: '❓', description: '', systemPrompt: 'Hãy trả lời một cách bình thường.' };
                    }
                }
            }
            currentPersona = foundPersona;
            updateChatHeader(currentPersona);
            updateLearningModeIndicator();

            currentChatId = chatDoc.id;
            localHistory = data.history || [];
            
            await renderAllChats();
            welcomeScreen.classList.add('hidden');
            welcomeScreen.classList.remove('flex');
            chatContainer.classList.remove('hidden');
            chatContainer.innerHTML = ''; 
            chatContainer.appendChild(notificationArea);

            clearSuggestions();

            const messagesToDisplay = localHistory.slice(2);
            messagesToDisplay.forEach(msg => {
                if (!msg.id) {
                    msg.id = crypto.randomUUID();
                }
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

async function showWelcomeScreenForPersona(persona) {
    if (!persona) return; 

    welcomeScreen.classList.remove('hidden');
    welcomeScreen.classList.add('flex');
    chatContainer.classList.add('hidden');

    document.getElementById('welcome-persona-icon').textContent = persona.icon;
    document.getElementById('welcome-persona-name').textContent = persona.name;
    document.getElementById('welcome-persona-description').textContent = persona.description;
    
    const suggestionsContainer = document.getElementById('welcome-suggestions-container');
    suggestionsContainer.innerHTML = '';

    if (isLearningMode) {
         suggestionsContainer.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Ở Chế độ Học tập, bạn sẽ nhận được các liên kết tương tác và câu hỏi trắc nghiệm thay vì gợi ý.</p>';
         return;
    }
    
    const suggestions = persona.samplePrompts;

    if (suggestions && suggestions.length > 0) {
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
        suggestionsContainer.innerHTML = `
            <div class="w-full p-4 border border-dashed dark:border-gray-700 rounded-lg animate-pulse h-12"></div>
            <div class="w-full p-4 border border-dashed dark:border-gray-700 rounded-lg animate-pulse h-12"></div>
        `;
        try {
            const prompt = `Bạn là chuyên gia về ${persona.name}. Hãy tạo ra 3 câu hỏi gợi ý, ngắn gọn và thú vị mà người dùng có thể hỏi bạn để bắt đầu. Mỗi câu hỏi trên một dòng. Không dùng định dạng markdown, không đánh số hay gạch đầu dòng.`;
            const result = await fastModel.generateContent(prompt);
            const responseText = result.response.text();
            const aiSuggestions = responseText.split('\n').filter(s => s.trim() !== '');
            
            suggestionsContainer.innerHTML = '';
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
    const { messageId } = addMessage('note', fullNoteText);
    const noteMessage = { id: messageId, role: 'note', parts: [{ text: fullNoteText }] };
    localHistory.push(noteMessage);
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

    if (!completedTopics.includes(promptForAI)) {
        completedTopics.push(promptForAI);
        linkElement.classList.add('completed');
        await updateConversationInDb();
    }

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
            // Assume learningModeIndicator is a text element or similar
            // This part of the code in your original `index.html` file is just a placeholder and
            // needs to be properly implemented to show an actual indicator.
            // For now, it toggles a hidden class, but if you want a visual indicator
            // like a chip, you'd need to create and append it here.
            // Example of how you might dynamically add a chip:
            // if (!document.getElementById('learning-mode-chip')) {
            //     const chip = document.createElement('span');
            //     chip.id = 'learning-mode-chip';
            //     chip.className = 'ml-2 px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full';
            //     chip.textContent = 'Chế độ Học tập';
            //     chatHeaderInfo.appendChild(chip);
            // }
            // For the provided structure, simply ensuring the toggle reflects the state:
             learningModeToggle.checked = true;
        } else {
             learningModeToggle.checked = false;
        }
    }
}

learningModeToggle.addEventListener('change', async (e) => { 
    isLearningMode = e.target.checked;
    showToast(`Chế độ Học tập đã được ${isLearningMode ? 'bật' : 'tắt'}.`, 'info');
    updateLearningModeIndicator();

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

// === CẬP NHẬT: Thêm xử lý cho nút quiz và các nút khác ===
chatContainer.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    const button = e.target.closest('button');
    const clickableForeign = e.target.closest('.clickable-foreign'); // === THÊM MỚI: Bắt sự kiện click cho từ ngoại ngữ ===
    const quizButton = e.target.closest('.quiz-option-btn');

    e.stopPropagation();

    if (link) {
        e.preventDefault();
        if (link.classList.contains('learning-link')) {
            await handleLearningPromptClick(link);
        } else if (link.classList.contains('term-link')) {
            const term = link.dataset.term;
            const messageContentElement = link.closest('.message-content');
            const context = messageContentElement ? messageContentElement.dataset.rawText : '';
            await explainTerm(term, context);
        }
    } else if (quizButton && !quizButton.disabled) { // === THÊM MỚI: Xử lý click nút quiz ===
        e.preventDefault();
        handleQuizAnswer(quizButton);
    } else if (button) {
        e.preventDefault();
         if (button.classList.contains('copy-btn')) {
            copyToClipboard(button.dataset.text);
         } else if (button.classList.contains('speak-btn')) {
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
            utterance.lang = 'vi-VN'; // Mặc định tiếng Việt cho nút speak chung
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
         } else if (button.classList.contains('regenerate-btn')) {
            handleRegenerate(button.dataset.targetId);
         }
    } else if (clickableForeign) { // === THÊM MỚI: Xử lý click vào từ ngoại ngữ để phát âm ===
        e.preventDefault();
        const textToSpeak = clickableForeign.textContent;
        const lang = clickableForeign.dataset.lang;
        if (lang) {
            speakText(textToSpeak, lang);
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
    
    confirmationModalCancelBtn.addEventListener('click', () => {
        if (confirmationResolve) confirmationResolve(false);
        hideConfirmationModal();
    });

    confirmationModalOverlay.addEventListener('click', (e) => {
        if (e.target === confirmationModalOverlay) {
            if (confirmationResolve) confirmationResolve(false);
            hideConfirmationModal();
        }
    });

    confirmationModalConfirmBtn.addEventListener('click', () => {
        if (confirmationResolve) confirmationResolve(true);
        hideConfirmationModal();
    });
});

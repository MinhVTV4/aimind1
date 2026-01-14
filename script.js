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

// Thêm các định nghĩa SVG bị thiếu trực tiếp vào đối tượng svgIcons
// để đảm bảo các biểu tượng Flashcard được hiển thị chính xác.
// Đây là biện pháp dự phòng nếu icons.js không chứa chúng.
Object.assign(svgIcons, {
    arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>`,
    arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.532-1.676-1.676a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>`,
    speaker: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9.792 9.792 0 010 12.728l-1.674-1.672a7.29 7.29 0 000-9.384l1.674-1.673zM17.477 7.363l1.293-1.293a7.5 7.5 0 010 10.606l-1.293-1.293a5.002 5.002 0 000-7.07zM12 18.75a.75.75 0 00.75-.75V5.25a.75.75 0 00-1.5 0v12.75a.75.75 0 00.75.75z" /></svg>`,
});


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
const fastModel = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

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
let completedTopics = []; // Lưu trữ các chủ đề đã học (learning-link)
let completedQuizIds = []; // Lưu trữ ID các quiz đã hoàn thành

// === CẬP NHẬT: Thêm chỉ thị cho KaTeX vào System Prompt ===
const LEARNING_MODE_SYSTEM_PROMPT = `**CHỈ THỊ HỆ THỐNG - CHẾ ĐỘ HỌC TẬP ĐANG BẬT**
Bạn là một người hướng dẫn học tập chuyên nghiệp. Khi người dùng yêu cầu một lộ trình học, hãy tuân thủ các quy tắc sau:
1.  **Tạo Lộ trình:** Trả lời bằng một danh sách có cấu trúc (dùng Markdown với gạch đầu dòng).
2.  **Tạo Liên kết Tương tác:** Đối với MỖI MỤC trong lộ trình, bạn PHẢI định dạng nó theo cú pháp đặc biệt sau: \`[Tên mục học]{"prompt":"Yêu cầu chi tiết để giải thích về mục học này"}\`
    * **[Tên mục học]**: Là tiêu đề của bài học. QUAN TRỌNG: Bên trong "Tên mục học", bạn không được sử dụng thêm dấu ngoặc vuông \`[]\` để nhấn mạnh bất kỳ thuật ngữ nào nào khác. Hãy viết tên mục một cách tự nhiên.
    * **{"prompt":"..."}**: Là một đối tượng JSON chứa một khóa "prompt". Giá trị của khóa này là một câu lệnh đầy đủ bạn tự tạo ra để yêu cầu chính bạn giải thích sâu về mục học đó. Prompt phải chi tiết và bằng tiếng Việt.
3.  **Công thức Toán học (QUAN TRỌNG):** Luôn sử dụng cú pháp LaTeX để viết công thức toán.
    * Dùng \`$...$\` cho công thức inline (ví dụ: $x^2 + y^2 = z^2$).
    * Dùng \`$$...$$\` cho công thức display (ví dụ: $$e^{i\pi} + 1 = 0$$).
    * **TUYỆT ĐỐI KHÔNG** thoát các dấu gạch chéo ngược \`\\\` bên trong các biểu thức LaTeX (ví dụ: viết là \`\\frac{a}{b}\` chứ không phải \`\\\\frac{a}{b}\`).

**Định dạng các loại câu hỏi trắc nghiệm (LUÔN BỌC TRONG KHỐI MÃ \`\`\`quiz... \`\`\`):**
**CỰC KỲ QUAN TRỌNG: Tất cả các giá trị chuỗi (strings) BÊN TRONG BẤT KỲ KHỐI JSON nào của quiz (bao gồm "question", "options", "blanks", "keywords", "explanation", "expected_answer_gist", "front", "back", "pronunciation", "text", "matchId", "correctOrder", "title", "scenario", "speaker", "nextId") PHẢI LÀ VĂN BẢN THUẦN TÚY.**
**TUYỆT ĐỐI KHÔNG ĐƯỢC CHỨA BẤT KỲ ĐỊNH DẠNG MARKDOWN NÀO (NHƯ **IN ĐẬM**, *IN NGHIÊNG*, [LIÊN KẾT]), hoặc THẺ HTML (<br>, <a>, etc.), hoặc các ký tự đặc biệt không phải JSON như $ (khi không phải là nội dung LaTeX) TRONG CÁC CHUỖI NÀY!**
**LUÔN DÙNG DẤU NHÁY KÉP \`"\` cho tất cả các khóa và giá trị chuỗi trong JSON. KHÔNG DÙNG DẤU NHÁY ĐƠN \`'\`. Đảm bảo các mảng JSON được định dạng đúng là \`[]\`, không phải chuỗi.**

* **Thẻ từ vựng (Flashcard) - VÍ DỤ ƯU TIÊN HÀNG ĐẦU VÀ CẦN CHÍNH XÁC TUYỆT ĐỐI:**
    \`\`\`quiz
    {
      "type": "flashcard",
      "title": "Tiêu đề của bộ Flashcard",
      "cards": [
        { "front": "Từ/Khái niệm (chỉ văn bản thuần túy)", "back": "Giải thích/Nghĩa (chỉ văn bản thuần túy)", "pronunciation": "phiên âm (nếu có, chỉ văn bản thuần túy)" },
        { "front": "Từ/Khái niệm khác", "back": "Giải thích/Nghĩa khác", "pronunciation": "phiên âm khác" }
      ],
      "explanation": "Giải thích chung về bộ flashcard này (chỉ văn bản thuần túy)."
    }
    \`\`\`
    *Lưu ý:* Mảng "cards" phải là MỘT MẢNG JSON CỦA CÁC ĐỐI TƯỢNG, KHÔNG PHẢI MỘT CHUỖI. Mỗi "card" là một đối tượng JSON hợp lệ.

* **Câu hỏi trắc nghiệm nhiều lựa chọn (Multiple Choice):**
    \`\`\`quiz
    {
      "type": "multiple_choice",
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

* **Câu hỏi Điền từ (Fill-in-the-Blank):** Sử dụng \`{{BLANK}}\` để đánh dấu vị trí trống.
    \`\`\`quiz
    {
      "type": "fill_in_the_blank",
      "sentence": "Thủ đô của Việt Nam là {{BLANK}}.",
      "blanks": ["Hà Nội"],
      "explanation": "Hà Nội là thủ đô của Việt Nam, nổi tiếng với lịch sử và văn hóa phong phú."
    }
    \`\`\`
    *Lưu ý:* Mảng "blanks" phải chứa ĐÚNG THỨ TỰ các từ/cụm từ cần điền vào các \`{{BLANK}}\`.

* **Câu hỏi Tự luận ngắn (Short Answer):**
    \`\`\`quiz
    {
      "type": "short_answer",
      "question": "Giải thích ngắn gọn khái niệm 'biến' trong lập trình.",
      "keywords": ["lưu trữ", "dữ liệu", "giá trị"],
      "expected_answer_gist": "Biến là một vùng bộ nhớ được đặt tên dùng để lưu trữ dữ liệu hoặc giá trị có thể thay đổi trong quá trình thực thi chương trình.",
      "explanation": "Trong lập trình, biến (variable) là một tên gọi (identifier) được gán cho một vị trí trong bộ nhớ máy tính. Vị trí này dùng để lưu trữ một giá trị hoặc một đối tượng. Giá trị của biến có thể được thay đổi trong suốt quá trình thực thi chương trình. Biến giúp lập trình viên quản lý dữ liệu một cách linh hoạt."
    }
    \`\`\`
    *Lưu ý:* "keywords" là các từ khóa quan trọng mà AI sẽ tìm kiếm trong câu trả lời của người dùng. "expected_answer_gist" là tóm tắt ý chính của câu trả lời đúng, dùng cho AI đánh giá. "explanation" là câu trả lời đầy đủ để hiển thị sau khi người dùng trả lời.

* **Kéo và Thả (Ghép nối) (Drag and Drop Matching):**
    \`\`\`quiz
    {
      "type": "drag_and_drop_matching",
      "title": "Ghép nối từ vựng với định nghĩa của chúng.",
      "items": [
        {"id": "item1", "text": "Hello"},
        {"id": "item2", "text": "Goodbye"},
        {"id": "item3", "text": "Thank you"}
      ],
      "targets": [
        {"id": "target1", "text": "Lời chào khi gặp mặt.", "matchId": "item1"},
        {"id": "target2", "text": "Lời chào khi chia tay.", "matchId": "item2"},
        {"id": "target3", "text": "Lời cảm ơn.", "matchId": "item3"}
      ],
      "explanation": "Bài tập này kiểm tra khả năng ghép nối từ vựng."
    }
    \`\`\`
    *Lưu ý:* "items" là các phần tử có thể kéo. "targets" là các vùng đích, mỗi vùng có một "matchId" tương ứng với "id" của phần tử đúng.

* **Sắp xếp câu/đoạn văn (Sentence/Paragraph Ordering):**
    \`\`\`quiz
    {
      "type": "sentence_ordering",
      "title": "Sắp xếp các câu để tạo thành một đoạn văn mạch lạc.",
      "sentences": [
        {"id": "s1", "text": "Đầu tiên, bạn cần chuẩn bị nguyên liệu."},
        {"id": "s2", "text": "Tiếp theo, trộn đều chúng trong một cái bát lớn."},
        {"id": "s3", "text": "Cuối cùng, nướng trong 30 phút."},
        {"id": "s4", "text": "Thưởng thức chiếc bánh thơm ngon của bạn!"}
      ],
      "correctOrder": ["s1", "s2", "s3", "s4"],
      "explanation": "Bài tập này kiểm tra khả năng sắp xếp câu theo trình tự logic."
    }
    \`\`\`
    *Lưu ý:* "sentences" là các câu riêng lẻ với "id" duy nhất. "correctOrder" là một mảng chứa "id" của các câu theo đúng thứ tự.

**Quy tắc chung:**
* Luôn trả lời bằng tiếng Việt.
* Khi có thể, hãy lồng ghép các loại câu hỏi quiz sau khi giảng bài.`;


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
    // === PERSONA GIA SƯ NGOẠI NGỮ (CÓ DIALOGUE CHOICE CHO CÁC NGÔN NGỮ Á ĐÔNG) ===
    { 
        id: 'language_tutor', 
        name: 'Gia sư Ngoại ngữ', 
        icon: '�', 
        description: 'Dạy từ vựng, ngữ pháp và kiểm tra kiến thức.', 
        systemPrompt: `**Chỉ thị hệ thống:** Bạn là một gia sư ngôn ngữ chuyên nghiệp, thân thiện, chuyên về các ngôn ngữ Á Đông (Tiếng Trung, Nhật, Hàn). Khi dạy, hãy tuân thủ nghiêm ngặt các quy tắc sau:

1.  **Định dạng từ vựng:** Khi giới thiệu một từ mới, luôn trình bày theo cấu trúc: Ký tự gốc, sau đó là phiên âm trong ngoặc tròn (), và cuối cùng là nghĩa tiếng Việt.
    * **Tiếng Trung:** 你好 (Nǐ hǎo) - Xin chào.
    * **Tiếng Nhật:** こんにちは (Konnichiwa) - Xin chào.
    * **Tiếng Hàn:** 안녕하세요 (Annyeonghaseyo) - Xin chào.

2.  **Câu ví dụ:** Luôn cung cấp ít nhất một câu ví dụ thực tế cho mỗi từ vựng hoặc điểm ngữ pháp. Câu ví dụ cũng phải có đủ 3 thành phần: Câu gốc, phiên âm, và bản dịch.

3.  **Rõ ràng và có cấu trúc:** Sử dụng Markdown (tiêu đề, danh sách) để tổ chức bài học một cách logic và dễ theo dõi. Giọng văn của bạn phải khích lệ và kiên nhẫn.

4.  **Tương tác chủ động:** Sau khi giảng dạy một khái niệm (khoảng 3-5 từ vựng hoặc một điểm ngữ pháp), bạn PHẢI chủ động đặt câu hỏi cho người học để kiểm tra sự hiểu biết của họ. Sử dụng cú pháp đặc biệt sau để tạo câu hỏi trắc nghiệm trong một khối mã 'quiz':

    **CỰC KỲ QUAN TRỌNG: Tất cả các giá trị chuỗi (strings) BÊN TRONG BẤT KỲ KHỐI JSON nào của quiz (bao gồm "question", "options", "blanks", "keywords", "explanation", "expected_answer_gist", "front", "back", "pronunciation", "text", "matchId", "correctOrder", "title", "scenario", "speaker", "nextId") PHẢI LÀ VĂN BẢN THUẦN TÚY. TUYỆT ĐỐI KHÔNG ĐƯỢC CHỨA BẤT KỲ ĐỊNH DẠNG MARKDOWN NÀO (NHƯ **IN ĐẬM**, *IN NGHIÊNG*, [LIÊN KẾT]), hoặc THẺ HTML (<br>, <a>, etc.), hoặc các ký tự đặc biệt không phải JSON như $ (khi không phải là nội dung LaTeX) TRONG CÁC CHUỖI NÀY! LUÔN DÙNG DẤU NHÁY KÉP \`"\` cho tất cả các khóa và giá trị chuỗi trong JSON. KHÔNG DÙNG DẤY NHÁY ĐƠN \`'\`. Đảm bảo các mảng JSON được định dạng đúng là \`[]\`, không phải chuỗi.**

    * **Thẻ từ vựng (Flashcard) - VÍ DỤ ƯU TIÊN HÀNG ĐẦU VÀ CẦN CHÍNH XÁC TUYỆT ĐỐI:**
        \`\`\`quiz
        {
          "type": "flashcard",
          "title": "Vocabulary: Daily Greetings",
          "cards": [
            { "front": "Hello", "back": "Xin chào", "pronunciation": "həˈloʊ" },
            { "front": "Good morning", "back": "Chào buổi sáng", "pronunciation": "ɡʊd ˈmɔːrnɪŋ" }
          ],
          "explanation": "This set helps you practice common English greetings."
        }
        \`\`\`

    * **Câu hỏi trắc nghiệm nhiều lựa chọn (Multiple Choice):**
        \`\`\`quiz
        {
          "type": "multiple_choice",
          "question": "Câu hỏi của bạn ở đây bằng tiếng Việt?",
          "options": {
            "A": "Lựa chọn A",
            "B": "Lựa chọn B",
            "C": "Lựa chọn C"
          },
          "answer": "B",
          "explanation": "'Joyful' means feeling, expressing, or causing great pleasure and happiness."
        }
        \`\`\`

    * **Câu hỏi Điền từ (Fill-in-the-Blank):**
        \`\`\`quiz
        {
          "type": "fill_in_the_blank",
          "sentence": "She is a very {{BLANK}} student.",
          "blanks": ["diligent"],
          "explanation": "'Diligent' means having or showing care and conscientiousness in one's work or duties."
        }
        \`\`\`

    * **Câu hỏi Tự luận ngắn (Short Answer):**
        \`\`\`quiz
        {
          "type": "short_answer",
          "question": "Explain the difference between 'affect' and 'effect'.",
          "keywords": ["verb", "noun", "influence", "result"],
          "expected_answer_gist": "'Affect' is usually a verb meaning to influence, and 'effect' is usually a noun meaning a result.",
          "explanation": "'Affect' (verb) means to influence or produce a change in something. For example: 'The weather affected my mood.' 'Effect' (noun) is the result of an action or cause. For example: 'The effect of the rain was slippery roads.' 'Effect' can also be a verb meaning to bring about (e.g., 'to effect change'), but this is less common."
        }
        \`\`\`
    
    * **Kéo và Thả (Ghép nối) (Drag and Drop Matching):**
        \`\`\`quiz
        {
          "type": "drag_and_drop_matching",
          "title": "Match the English words to their Vietnamese definitions.",
          "items": [
            {"id": "item-hello", "text": "Hello"},
            {"id": "item-goodbye", "text": "Goodbye"},
            {"id": "item-thankyou", "text": "Thank you"}
          ],
          "targets": [
            {"id": "target-hello", "text": "Xin chào", "matchId": "item-hello"},
            {"id": "target-goodbye", "text": "Tạm biệt", "matchId": "item-goodbye"},
            {"id": "target-thankyou", "text": "Cảm ơn", "matchId": "item-thankyou"}
          ],
          "explanation": "This exercise tests your English vocabulary matching skills."
        }
        \`\`\`

    * **Sắp xếp câu/đoạn văn (Sentence/Paragraph Ordering):**
        \`\`\`quiz
        {
          "type": "sentence_ordering",
          "title": "Order these sentences to form a logical paragraph.",
          "sentences": [
            {"id": "s-start", "text": "The sun rises in the east."},
            {"id": "s-mid", "text": "Birds begin to sing their morning songs."},
            {"id": "s-end", "text": "A new day has officially begun."}
          ],
          "correctOrder": ["s-start", "s-mid", "s-end"],
          "explanation": "This exercise helps you understand sentence flow and coherence."
        }
        \`\`\`

    * **Hội thoại tương tác có lựa chọn (Interactive Dialogue with Choices):**
        \`\`\`quiz
        {
          "type": "dialogue_choice",
          "title": "点餐 (Diǎncān) - Gọi món",
          "scenario": "你正在一家高档餐厅，服务员过来为你点餐。请选择合适的回复。(Nǐ zhèngzài yījiā gāodàng cāntīng, fúwùyuán guòlái wèi nǐ diǎncān. Qǐng xuǎnzé héshì de huífù.) - Bạn đang ở một nhà hàng sang trọng, và người phục vụ đến để lấy order của bạn. Hãy chọn cách phản hồi phù hợp.",
          "dialogue_flow": [
            {
              "id": "start",
              "speaker": "AI",
              "text": "晚上好，您准备好点餐了吗？ (Wǎnshàng hǎo, nín zhǔnbèi hǎo diǎncān le ma?) - Chào buổi tối, quý khách đã sẵn sàng gọi món chưa ạ?",
              "choices": [
                {"text": "是的，我想点餐。(Shì de, wǒ xiǎng diǎncān.) - Vâng, tôi muốn gọi món.", "nextId": "user_choice_1"},
                {"text": "请再给我几分钟看菜单。(Qǐng zài gěi wǒ jǐ fēnzhōng kàn càidān.) - Cho tôi thêm vài phút để xem thực đơn.", "nextId": "user_choice_2"},
                {"text": "不，我在等我的朋友。(Bù, wǒ zài děng wǒ de péngyǒu.) - Không, tôi đang đợi bạn.", "nextId": "user_choice_3"}
              ]
            },
            {
              "id": "user_choice_1",
              "speaker": "USER_RESPONSE_DISPLAY",
              "text": "是的，我想点餐。(Shì de, wǒ xiǎng diǎncān.) - Vâng, tôi muốn gọi món."
            },
            {
              "id": "ai_response_1",
              "speaker": "AI",
              "text": "好的，您想吃什么？(Hǎo de, nín xiǎng chī shénme?) - Tuyệt vời, quý khách muốn dùng món gì ạ?",
              "choices": [
                {"text": "我想要一份五分熟的牛排。(Wǒ xiǎng yào yī fèn wǔ fēn shú de niúpái.) - Tôi muốn một suất bít tết vừa chín tới.", "nextId": "user_choice_4"},
                {"text": "今天的特色菜是什么？(Jīntiān de tèsè cài shì shénme?) - Món đặc biệt của nhà hàng hôm nay là gì?", "nextId": "user_choice_5"}
              ]
            },
            {
              "id": "user_choice_2",
              "speaker": "USER_RESPONSE_DISPLAY",
              "text": "请再给我几分钟看菜单。(Qǐng zài gěi wǒ jǐ fēnzhōng kàn càidān.) - Cho tôi thêm vài phút để xem thực đơn."
            },
            {
              "id": "ai_response_2",
              "speaker": "AI",
              "text": "好的，没问题。我稍后回来。(Hǎo de, méi wèntí. Wǒ shāohòu huílái.) - Vâng, không vấn đề gì ạ. Tôi sẽ quay lại sau ít phút.",
              "explanation": "这是您需要更多时间时的礼貌和恰当的回复。(Zhè shì nín xūyào gèng duō shíjiān shí de lǐmào hé qiàdàng de huífù.) - Đây là một phản hồi lịch sự và phù hợp khi bạn cần thêm thời gian."
            },
            {
              "id": "user_choice_3",
              "speaker": "USER_RESPONSE_DISPLAY",
              "text": "不，我在等我的朋友。(Bù, wǒ zài děng wǒ de péngyǒu.) - Không, tôi đang đợi bạn."
            },
            {
              "id": "ai_response_3",
              "speaker": "AI",
              "text": "好的，您朋友到了请招呼我一声。(Hǎo de, nín péngyǒu dàole qǐng zhāohū wǒ yī shēng.) - Dạ vâng, khi nào bạn của quý khách đến, hãy vẫy tay gọi tôi nhé.",
              "explanation": "这个回复也可以，但可能有点直接。选择“请再给我几分钟”会更自然。(Zhège huífù yě kěyǐ, dàn kěnéng yǒudiǎn zhíjiē. Xuǎnzé “qǐng zài gěi wǒ jǐ fēnzhōng” huì gèng zìrán.) - Phản hồi này cũng ổn, nhưng có thể hơi trực tiếp. Lựa chọn 'Cho tôi thêm vài phút' sẽ tự nhiên hơn."
            },
            {
              "id": "user_choice_4",
              "speaker": "USER_RESPONSE_DISPLAY",
              "text": "我想要一份五分熟的牛排。(Wǒ xiǎng yào yī fèn wǔ fēn shú de niúpái.) - Tôi muốn một suất bít tết vừa chín tới."
            },
            {
              "id": "ai_response_4",
              "speaker": "AI",
              "text": "好的，您需要搭配什么酱汁吗？(Hǎo de, nín xūyào dàpèi shénme jiàngzhī ma?) - Tuyệt vời, quý khách có muốn dùng kèm với sốt nào không ạ?",
              "explanation": "您已成功点餐。继续对话以选择酱汁。(Nín yǐ chénggōng diǎncān. Jìxù duìhuà yǐ xuǎnzé jiàngzhī.) - Bạn đã gọi món thành công. Tiếp tục hội thoại để chọn sốt."
            },
            {
              "id": "user_choice_5",
              "speaker": "USER_RESPONSE_DISPLAY",
              "text": "今天的特色菜是什么？(Jīntiān de tèsè cài shì shénme?) - Món đặc biệt của nhà hàng hôm nay là gì?"
            },
            {
              "id": "ai_response_5",
              "speaker": "AI",
              "text": "我们的特色菜是香煎三文鱼配百香果酱。(Wǒmen jīntiān de tèsè cài shì xiāng jiān sānwènyú pèi bǎixiāngguǒ jiàng.) - Món đặc biệt hôm nay của chúng tôi là cá hồi nướng sốt chanh dây ạ.",
              "explanation": "一个很好的问题，可以探索其他选择。(Yīgè hěn hǎo de wèntí, kěyǐ tànsuǒ qítā xuǎnzé.) - Một câu hỏi tốt để khám phá các lựa chọn khác."
            }
          ],
          "start_node_id": "start",
          "explanation": "这个练习可以帮助您在餐厅点餐时练习礼貌和有效的沟通。请始终注意上下文和适当的选择。(Zhège liànxí kěyǐ bāngzhù nín zài cāntīng diǎncān shí liànxí lǐmào hé yǒuxiào de gōutōng. Qǐng shǐzhōng zhùyì shàngxiàwén hé shìdàng de xuǎnzé.) - Bài tập này giúp bạn thực hành cách giao tiếp lịch sự và hiệu quả khi gọi món tại nhà hàng. Luôn chú ý đến ngữ cảnh và các lựa chọn phù hợp."
        }
        \`\`\`

5.  **Tạo lộ trình học:** Khi người dùng yêu cầu một lộ trình học (ví dụ: "dạy tôi tiếng Anh giao tiếp cơ bản"), hãy sử dụng cú pháp [Chủ đề]{"prompt":"..."} để tạo các bài học tương tác.`,
        samplePrompts: [
            "Dạy tôi các thì cơ bản trong tiếng Anh và kiểm tra tôi bằng câu hỏi điền từ.",
            "Tạo một bộ flashcards về các động từ bất quy tắc phổ biến.",
            "Tạo một bài tập hội thoại tương tác về việc hỏi đường ở một thành phố mới." // Ví dụ mới
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
 * Hiển thị modal xác nhận với các tùy chọn.
 * @param {object} options - Các tùy chọn cho modal.
 * @param {string} options.title - Tiêu đề của modal.
 * @param {string} options.message - Thông điệp cảnh báo.
 * @param {string} [options.confirmText='Xóa'] - Chữ trên nút xác nhận.
 * @param {string} [options.param="confirm"] - Parameter to help resolve confirm actions for callback.
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

        confirmationModalIcon.innerHTML = svgIcons.warning || '<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1-5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>';

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
        icon: personaIconInput.value.trim() || '',
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
 * Renders an interactive multiple choice quiz block.
 * @param {object} data - Parsed JSON data for the multiple choice quiz.
 * @param {string} quizId - Unique ID for this quiz block.
 * @returns {HTMLElement} - The DOM element of the quiz block.
 */
function renderMultipleChoiceQuiz(data, quizId) {
    let optionsHtml = '';
    const letters = Object.keys(data.options);
    letters.forEach(letter => {
        optionsHtml += `
            <button class="quiz-option-btn" data-quiz-id="${quizId}" data-option="${letter}" ${completedQuizIds.includes(quizId) ? 'disabled' : ''}>
                <span class="quiz-option-letter">${letter}</span>
                <span class="quiz-option-text">${DOMPurify.sanitize(data.options[letter])}</span>
            </button>
        `;
    });

    const quizWrapper = document.createElement('div');
    quizWrapper.className = "my-4 p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50";
    quizWrapper.id = quizId;
    quizWrapper.dataset.quizData = JSON.stringify(data); // Store data on DOM element

    quizWrapper.innerHTML = `
        <p class="font-semibold mb-3 text-gray-800 dark:text-gray-200">${DOMPurify.sanitize(data.question)}</p>
        <div class="space-y-2">
            ${optionsHtml}
        </div>
        <div class="quiz-explanation mt-3 hidden text-sm p-3 rounded-lg"></div>
    `;

    // If quiz is completed, show explanation immediately and disable options
    if (completedQuizIds.includes(quizId)) {
        const explanationDiv = quizWrapper.querySelector('.quiz-explanation');
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Giải thích:** ${data.explanation}`));
        explanationDiv.classList.remove('hidden');
        // Assume correct for display if already completed (we don't store which option was chosen)
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
    }


    return quizWrapper;
}

/**
 * Renders an interactive fill-in-the-blank quiz block.
 * @param {object} data - Parsed JSON data for the fill-in-the-blank quiz.
 * @param {string} quizId - Unique ID for this quiz block.
 * @returns {HTMLElement} - The DOM element of the quiz block.
 */
function renderFillInTheBlankQuiz(data, quizId) {
    const quizWrapper = document.createElement('div');
    quizWrapper.className = "my-4 p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50";
    quizWrapper.id = quizId;
    quizWrapper.dataset.quizData = JSON.stringify(data); // Store data on DOM element

    let sentenceHtml = DOMPurify.sanitize(data.sentence);
    const blanksCount = (sentenceHtml.match(/\{\{BLANK\}\}/g) || []).length;
    let inputFields = '';

    if (completedQuizIds.includes(quizId)) {
        // If completed, show filled sentence and explanation
        sentenceHtml = sentenceHtml.replace(/\{\{BLANK\}\}/g, (match, index) => {
            const answer = data.blanks[index] || '???';
            return `<span class="quiz-filled-blank completed-blank">${DOMPurify.sanitize(answer)}</span>`;
        });
        inputFields = `<div class="quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                           ${DOMPurify.sanitize(marked.parse(`**Giải thích:** ${data.explanation}`))
                       }</div>`;
    } else {
        // Otherwise, show input fields for blanks
        inputFields = '<div class="quiz-blank-inputs space-y-2 mt-3">';
        for (let i = 0; i < blanksCount; i++) {
            inputFields += `
                <input type="text" placeholder="Điền vào chỗ trống ${i + 1}" class="quiz-blank-input w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 focus:ring focus:ring-blue-500 focus:border-blue-500" data-blank-index="${i}">
            `;
        }
        inputFields += `
            <button class="quiz-submit-btn w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors mt-3">Kiểm tra</button>
        </div>
        <div class="quiz-explanation mt-3 hidden text-sm p-3 rounded-lg"></div>`;
        
        sentenceHtml = sentenceHtml.replace(/\{\{BLANK\}\}/g, '<span class="quiz-blank-placeholder">_____</span>');
    }

    quizWrapper.innerHTML = `
        <p class="font-semibold mb-3 text-gray-800 dark:text-gray-200">${sentenceHtml}</p>
        ${inputFields}
    `;
    return quizWrapper;
}

/**
 * Renders an interactive short answer quiz block.
 * @param {object} data - Parsed JSON data for the short answer quiz.
 * @param {string} quizId - Unique ID for this quiz block.
 * @returns {HTMLElement} - The DOM element of the quiz block.
 */
function renderShortAnswerQuiz(data, quizId) {
    const quizWrapper = document.createElement('div');
    quizWrapper.className = "my-4 p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50";
    quizWrapper.id = quizId;
    quizWrapper.dataset.quizData = JSON.stringify(data); // Store data on DOM element

    let inputArea = '';
    let explanationDiv = '';

    if (completedQuizIds.includes(quizId)) {
        // If completed, show explanation
        inputArea = `<div class="text-sm text-gray-600 dark:text-gray-400">Bạn đã trả lời quiz này.</div>`;
        explanationDiv = `<div class="quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                              ${DOMPurify.sanitize(marked.parse(`**Giải thích:** ${data.explanation}`))}
                          </div>`;
    } else {
        inputArea = `
            <textarea placeholder="Nhập câu trả lời của bạn..." rows="3" class="quiz-short-answer-input w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 focus:ring focus:ring-blue-500 focus:border-blue-500"></textarea>
            <button class="quiz-submit-btn w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors mt-3">Kiểm tra</button>
        `;
        explanationDiv = `<div class="quiz-explanation mt-3 hidden text-sm p-3 rounded-lg"></div>`;
    }

    quizWrapper.innerHTML = `
        <p class="font-semibold mb-3 text-gray-800 dark:text-gray-200">${DOMPurify.sanitize(data.question)}</p>
        <div class="space-y-2">
            ${inputArea}
        </div>
        ${explanationDiv}
    `;
    return quizWrapper;
}

/**
 * Renders an interactive flashcard quiz block.
 * @param {object} data - Parsed JSON data for the flashcard quiz.
 * @param {string} quizId - Unique ID for this quiz block.
 * @returns {HTMLElement} - The DOM element of the quiz block.
 */
function renderFlashcardQuiz(data, quizId) {
    const quizWrapper = document.createElement('div');
    quizWrapper.className = "my-4 p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 flashcard-quiz-wrapper";
    quizWrapper.id = quizId;
    quizWrapper.dataset.quizData = JSON.stringify(data);
    
    // Check if the flashcard set is completed
    const isFlashcardSetCompleted = completedQuizIds.includes(quizId);
    
    // Determine the initial card index. If the set is completed, we don't care about a specific card.
    // Otherwise, try to restore the last viewed card or start from 0.
    // For simplicity, let's always start from 0 if not completed.
    let initialCardIndex = 0; 
    if (isFlashcardSetCompleted && data.cards.length > 0) {
        // If completed, just show the first card or a "completed" message
        initialCardIndex = 0; // Or we could add a "review all" mode later
    }
    quizWrapper.dataset.currentCardIndex = initialCardIndex;
    quizWrapper.dataset.isFlipped = "false"; // Track if current card is flipped

    let cardHtml = '';
    data.cards.forEach((card, index) => {
        const displayStyle = index === initialCardIndex ? '' : 'display: none;';
        // A flashcard is 'completed' if its specific ID (quizId-index) is in completedQuizIds
        // Or if the entire set is completed, we consider all its cards completed for display purposes
        const cardSpecificId = `${quizId}-${index}`;
        const isCardCompleted = isFlashcardSetCompleted || completedQuizIds.includes(cardSpecificId);
        const cardClass = isCardCompleted ? 'flashcard-item completed' : 'flashcard-item';

        cardHtml += `
            <div class="${cardClass}" data-card-index="${index}" style="${displayStyle}">
                <div class="flashcard-face flashcard-front">
                    <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">${DOMPurify.sanitize(card.front)}</p>
                    ${card.pronunciation ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">(${DOMPurify.sanitize(card.pronunciation)})</p>` : ''}
                    <button class="flashcard-speak-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 mt-2" data-text="${DOMPurify.sanitize(card.front)}" data-lang="${currentPersona.id === 'english_tutor' ? 'en-US' : 'vi-VN'}">${svgIcons.speaker}</button>
                </div>
                <div class="flashcard-face flashcard-back">
                    <p class="text-base text-gray-700 dark:text-gray-300">${DOMPurify.sanitize(card.back)}</p>
                    <button class="flashcard-speak-btn p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 mt-2" data-text="${DOMPurify.sanitize(card.back)}" data-lang="vi-VN">${svgIcons.speaker}</button>
                </div>
            </div>
        `;
    });

    const totalCards = data.cards.length;
    const currentCardIndex = parseInt(quizWrapper.dataset.currentCardIndex);

    quizWrapper.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">${DOMPurify.sanitize(data.title)}</h3>
        <div class="flashcard-container relative w-full h-48 sm:h-64 md:h-80 rounded-xl shadow-lg flex items-center justify-center cursor-pointer overflow-hidden group">
            ${cardHtml}
            <div class="flashcard-overlay absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                <span class="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity">Lật thẻ</span>
            </div>
        </div>
        <div class="flex justify-between items-center mt-4">
            <button class="flashcard-nav-btn prev-card-btn px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                ${svgIcons.arrowLeft} Trước
            </button>
            <span class="flashcard-counter text-gray-600 dark:text-gray-400 font-medium">
                ${totalCards > 0 ? `${currentCardIndex + 1}/${totalCards}` : '0/0'}
            </span>
            <button class="flashcard-nav-btn next-card-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Tiếp theo ${svgIcons.arrowRight}
            </button>
        </div>
        <div class="mt-4 text-center flashcard-actions">
             ${isFlashcardSetCompleted ? 
                `<p class="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                    ${svgIcons.checkCircle} Bạn đã hoàn thành bộ Flashcard này!
                </p>` :
                `<button class="flashcard-mark-completed-btn px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    ${svgIcons.check} Đánh dấu đã học
                </button>`
            }
        </div>
        ${data.explanation ? `<div class="quiz-explanation mt-3 text-sm p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300">${DOMPurify.sanitize(marked.parse(data.explanation))}</div>` : ''}
    `;

    // Initialize navigation button states
    const prevBtn = quizWrapper.querySelector('.prev-card-btn');
    const nextBtn = quizWrapper.querySelector('.next-card-btn');
    const markCompletedContainer = quizWrapper.querySelector('.flashcard-actions');

    if (totalCards === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        if (markCompletedContainer) markCompletedContainer.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Bộ Flashcard trống.</p>';
    } else {
        prevBtn.disabled = currentCardIndex === 0;
        nextBtn.disabled = currentCardIndex === totalCards - 1;
    }

    // If the set is completed, disable interactions
    if (isFlashcardSetCompleted) {
        const flashcardContainerElement = quizWrapper.querySelector('.flashcard-container');
        if (flashcardContainerElement) flashcardContainerElement.style.pointerEvents = 'none';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }


    return quizWrapper;
}

/**
 * Renders an interactive Drag and Drop Matching quiz block.
 * @param {object} data - Parsed JSON data for the drag and drop quiz.
 * @param {string} quizId - Unique ID for this quiz block.
 * @returns {HTMLElement} - The DOM element of the quiz block.
 */
function renderDragAndDropMatchingQuiz(data, quizId) {
    const quizWrapper = document.createElement('div');
    quizWrapper.className = "my-4 p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 drag-drop-quiz-wrapper";
    quizWrapper.id = quizId;
    quizWrapper.dataset.quizData = JSON.stringify(data);

    const isCompleted = completedQuizIds.includes(quizId);

    let itemsHtml = '';
    // Shuffle items to make it a real quiz
    const shuffledItems = [...data.items].sort(() => Math.random() - 0.5);
    shuffledItems.forEach(item => {
        itemsHtml += `<div class="drag-item p-3 bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded-lg cursor-grab ${isCompleted ? 'disabled' : ''}" draggable="${!isCompleted}" data-item-id="${item.id}">${DOMPurify.sanitize(item.text)}</div>`;
    });

    let targetsHtml = '';
    // Shuffle targets as well, but keep track of their original matchId for checking
    const shuffledTargets = [...data.targets].sort(() => Math.random() - 0.5);
    shuffledTargets.forEach(target => {
        targetsHtml += `
            <div class="drop-target p-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex-1 min-h-[60px] flex items-center justify-center text-gray-700 dark:text-gray-300 ${isCompleted ? 'completed' : ''}" data-target-id="${target.id}" data-correct-match-id="${target.matchId}">
                ${DOMPurify.sanitize(target.text)}
                <div class="dropped-item-placeholder ml-2 font-semibold text-blue-700 dark:text-blue-200"></div>
            </div>
        `;
    });

    quizWrapper.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">${DOMPurify.sanitize(data.title)}</h3>
        <div class="flex flex-col md:flex-row gap-4">
            <div class="drag-items-container flex flex-wrap gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg w-full md:w-1/2">
                ${itemsHtml}
            </div>
            <div class="drop-targets-container flex flex-col gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg w-full md:w-1/2">
                ${targetsHtml}
            </div>
        </div>
        <div class="mt-4 text-center">
            ${isCompleted ? 
                `<p class="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                    ${svgIcons.checkCircle} Bạn đã hoàn thành bài tập này!
                </p>` :
                `<button class="quiz-submit-btn px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Kiểm tra</button>`
            }
        </div>
        <div class="quiz-explanation mt-3 hidden text-sm p-3 rounded-lg"></div>
    `;

    if (isCompleted) {
        const explanationDiv = quizWrapper.querySelector('.quiz-explanation');
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Giải thích:** ${data.explanation}`));
        explanationDiv.classList.remove('hidden');
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';

        // Re-render dropped items if completed
        const targetsContainer = quizWrapper.querySelector('.drop-targets-container');
        targetsContainer.innerHTML = ''; // Clear existing targets
        data.targets.forEach(target => {
            const matchedItem = data.items.find(item => item.id === target.matchId);
            targetsHtml += `
                <div class="drop-target p-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex-1 min-h-[60px] flex items-center justify-center text-gray-700 dark:text-gray-300 completed" data-target-id="${target.id}" data-correct-match-id="${target.matchId}">
                    ${DOMPurify.sanitize(target.text)}
                    <div class="dropped-item-placeholder ml-2 font-semibold text-green-700 dark:text-green-200">
                        (${DOMPurify.sanitize(matchedItem.text)})
                    </div>
                </div>
            `;
        });
        targetsContainer.innerHTML = targetsHtml; // Re-populate with completed state
        quizWrapper.querySelector('.drag-items-container').remove(); // Remove draggable items
    }

    return quizWrapper;
}

/**
 * Renders an interactive Sentence Ordering quiz block.
 * @param {object} data - Parsed JSON data for the sentence ordering quiz.
 * @param {string} quizId - Unique ID for this quiz block.
 * @returns {HTMLElement} - The DOM element of the quiz block.
 */
function renderSentenceOrderingQuiz(data, quizId) {
    const quizWrapper = document.createElement('div');
    quizWrapper.className = "my-4 p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 sentence-ordering-quiz-wrapper";
    quizWrapper.id = quizId;
    quizWrapper.dataset.quizData = JSON.stringify(data);

    const isCompleted = completedQuizIds.includes(quizId);

    let sentencesHtml = '';
    // Shuffle sentences for the quiz, unless it's completed
    const sentencesToDisplay = isCompleted ? data.sentences.filter(s => data.correctOrder.includes(s.id)).sort((a, b) => data.correctOrder.indexOf(a.id) - data.correctOrder.indexOf(b.id)) : [...data.sentences].sort(() => Math.random() - 0.5);

    sentencesToDisplay.forEach(sentence => {
        sentencesHtml += `
            <div class="sentence-item p-3 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-lg mb-2 cursor-grab ${isCompleted ? 'disabled' : ''}" draggable="${!isCompleted}" data-sentence-id="${sentence.id}">
                ${DOMPurify.sanitize(sentence.text)}
            </div>
        `;
    });

    quizWrapper.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">${DOMPurify.sanitize(data.title)}</h3>
        <div class="sentences-container flex flex-col gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            ${sentencesHtml}
        </div>
        <div class="mt-4 text-center">
            ${isCompleted ? 
                `<p class="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                    ${svgIcons.checkCircle} Bạn đã hoàn thành bài tập này!
                </p>` :
                `<button class="quiz-submit-btn px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Kiểm tra</button>`
            }
        </div>
        <div class="quiz-explanation mt-3 hidden text-sm p-3 rounded-lg"></div>
    `;

    if (isCompleted) {
        const explanationDiv = quizWrapper.querySelector('.quiz-explanation');
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Giải thích:** ${data.explanation}`));
        explanationDiv.classList.remove('hidden');
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
    }

    return quizWrapper;
}


/**
 * Renders an interactive dialogue with choices quiz block.
 * @param {object} data - Parsed JSON data for the dialogue choice quiz.
 * @param {string} quizId - Unique ID for this quiz block.
 * @returns {HTMLElement} - The DOM element of the quiz block.
 */
function renderInteractiveDialogueQuiz(data, quizId) {
    const quizWrapper = document.createElement('div');
    quizWrapper.className = "my-4 p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 dialogue-choice-quiz-wrapper";
    quizWrapper.id = quizId;
    quizWrapper.dataset.quizData = JSON.stringify(data);
    
    // Check if the entire dialogue is completed
    const isCompleted = completedQuizIds.includes(quizId);

    let currentNodeId = data.start_node_id;
    // If completed, we should just show the full dialogue without interaction
    if (isCompleted) {
        quizWrapper.dataset.currentNodeId = 'completed'; // Mark as completed
    } else {
        quizWrapper.dataset.currentNodeId = currentNodeId; // Store current node ID
    }

    quizWrapper.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">${DOMPurify.sanitize(data.title)}</h3>
        ${data.scenario ? `<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${DOMPurify.sanitize(data.scenario)}</p>` : ''}
        <div class="dialogue-transcript space-y-3 overflow-y-auto max-h-96 p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"></div>
        <div class="dialogue-choices mt-4 space-y-2"></div>
        ${data.explanation ? `<div class="quiz-explanation mt-3 text-sm p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300">${DOMPurify.sanitize(marked.parse(data.explanation))}</div>` : ''}
    `;

    const dialogueTranscript = quizWrapper.querySelector('.dialogue-transcript');
    const dialogueChoices = quizWrapper.querySelector('.dialogue-choices');

    // Function to render a specific node
    const renderNode = (nodeId) => {
        const node = data.dialogue_flow.find(n => n.id === nodeId);
        if (!node) {
            console.error(`Dialogue node with ID ${nodeId} not found.`);
            dialogueTranscript.innerHTML += `<p class="text-red-500">Error: Dialogue path ended unexpectedly.</p>`;
            dialogueChoices.innerHTML = ''; // No more choices
            markQuizCompleted(quizId); // Mark as completed on error
            return;
        }

        if (node.speaker === "AI") {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'flex items-start space-x-2';
            aiMessage.innerHTML = `
                <div class="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center">${svgIcons.aiAvatar}</div>
                <div class="message-content ai-dialogue-text px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">${DOMPurify.sanitize(marked.parse(node.text))}</div>
            `;
            dialogueTranscript.appendChild(aiMessage);
            
            // Add explanation if present
            if (node.explanation) {
                const explanationDiv = document.createElement('div');
                explanationDiv.className = 'text-xs italic text-gray-500 dark:text-gray-400 ml-9 mt-1';
                explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`*Giải thích: ${node.explanation}*`));
                dialogueTranscript.appendChild(explanationDiv);
            }

            dialogueChoices.innerHTML = ''; // Clear previous choices
            if (node.choices && node.choices.length > 0 && !isCompleted) {
                node.choices.forEach(choice => {
                    const choiceBtn = document.createElement('button');
                    choiceBtn.className = 'dialogue-choice-btn w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors';
                    choiceBtn.textContent = DOMPurify.sanitize(choice.text);
                    choiceBtn.dataset.nextId = choice.nextId;
                    choiceBtn.dataset.userText = choice.text; // Store user text for display
                    dialogueChoices.appendChild(choiceBtn);
                });
            } else if (!isCompleted) {
                // If AI has no more choices, the dialogue branch ends
                dialogueChoices.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Hội thoại đã kết thúc tại đây.</p>';
                markQuizCompleted(quizId); // Mark the entire dialogue as completed
            }
        } else if (node.speaker === "USER_RESPONSE_DISPLAY") {
            const userMessage = document.createElement('div');
            userMessage.className = 'flex justify-end';
            userMessage.innerHTML = `
                <div class="message-content user-dialogue-text px-3 py-2 rounded-lg bg-blue-500 dark:bg-blue-700 text-white">${DOMPurify.sanitize(marked.parse(node.text))}</div>
            `;
            dialogueTranscript.appendChild(userMessage);

            dialogueChoices.innerHTML = ''; // User choice, so no choices from AI yet.
            
            // Find the next AI response in the flow that follows this user response.
            // This assumes the next node in dialogue_flow array is the AI response after USER_RESPONSE_DISPLAY
            const currentIndex = data.dialogue_flow.findIndex(n => n.id === nodeId);
            if (currentIndex !== -1 && currentIndex + 1 < data.dialogue_flow.length) {
                const nextFlowItem = data.dialogue_flow[currentIndex + 1];
                if (nextFlowItem.speaker === "AI") { // Ensure it's an AI response
                    quizWrapper.dataset.currentNodeId = nextFlowItem.id;
                    renderNode(nextFlowItem.id); // Recursively call to render next AI node
                } else {
                     // If the next item is not AI, it means this user response also ends the branch
                     dialogueChoices.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Hội thoại đã kết thúc tại đây.</p>';
                     markQuizCompleted(quizId);
                }
            } else {
                dialogueChoices.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Hội thoại đã kết thúc tại đây.</p>';
                markQuizCompleted(quizId);
            }
        }
        dialogueTranscript.scrollTop = dialogueTranscript.scrollHeight; // Scroll to bottom
    };

    // Initial render based on current state
    if (isCompleted) {
        // If completed, just display the full linear path for review or indicate completion
        dialogueTranscript.innerHTML = `<p class="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">${svgIcons.checkCircle} Bạn đã hoàn thành bài tập hội thoại này!</p>`;
        dialogueChoices.innerHTML = ''; // No choices for completed dialogue
    } else {
        renderNode(currentNodeId); // Start the dialogue
    }

    return quizWrapper;
}


/**
 * Handles the logic for a multiple choice quiz answer.
 * @param {HTMLElement} button - The option button clicked.
 * @param {string} quizId - The ID of the quiz.
 * @param {object} quizData - The quiz data.
 */
function handleMultipleChoiceAnswer(button, quizId, quizData) {
    const quizContainer = document.getElementById(quizId);
    if (!quizContainer || completedQuizIds.includes(quizId)) return; // Prevent re-answering

    const allOptions = quizContainer.querySelectorAll('.quiz-option-btn');
    const selectedOption = button.dataset.option;
    const correctAnswer = quizData.answer;
    const explanation = quizData.explanation;

    // Disable all options and show results
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

    // Display explanation
    const explanationDiv = quizContainer.querySelector('.quiz-explanation');
    if (explanation) {
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Giải thích:** ${explanation}`));
        explanationDiv.classList.remove('hidden');
        if (selectedOption === correctAnswer) {
            explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        } else {
            explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
        }
    }
    markQuizCompleted(quizId);
}

/**
 * Handles the logic for a fill-in-the-blank quiz submission.
 * @param {HTMLElement} submitButton - The submit button clicked.
 * @param {string} quizId - The ID of the quiz.
 * @param {object} quizData - The quiz data.
 */
function handleFillInTheBlankSubmit(submitButton, quizId, quizData) {
    const quizContainer = document.getElementById(quizId);
    if (!quizContainer || completedQuizIds.includes(quizId)) return; // Prevent re-answering

    const inputBlanks = quizContainer.querySelectorAll('.quiz-blank-input');
    const userAnswers = Array.from(inputBlanks).map(input => input.value.trim());
    const correctAnswers = quizData.blanks.map(ans => ans.trim());
    const explanation = quizData.explanation;
    
    let allCorrect = true;
    for (let i = 0; i < userAnswers.length; i++) {
        if (userAnswers[i].toLowerCase() !== correctAnswers[i].toLowerCase()) {
            allCorrect = false;
            break;
        }
    }

    const explanationDiv = quizContainer.querySelector('.quiz-explanation');
    explanationDiv.classList.remove('hidden');

    if (allCorrect) {
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Chính xác!** ${explanation}`));
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        // Replace input fields with filled text
        let sentenceHtml = DOMPurify.sanitize(quizData.sentence);
        sentenceHtml = sentenceHtml.replace(/\{\{BLANK\}\}/g, (match, index) => {
            const answer = quizData.blanks[index] || '???'; // Use quizData.blanks directly
            return `<span class="quiz-filled-blank correct">${DOMPurify.sanitize(answer)}</span>`;
        });
        quizContainer.querySelector('p').innerHTML = sentenceHtml;
        quizContainer.querySelector('.quiz-blank-inputs').remove();
        markQuizCompleted(quizId);
    } else {
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Chưa chính xác.** Vui lòng thử lại. ${explanation}`));
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
        // Optionally, highlight incorrect inputs
        inputBlanks.forEach((input, index) => {
            if (input.value.trim().toLowerCase() !== correctAnswers[index].toLowerCase()) {
                input.classList.add('incorrect-input');
            } else {
                input.classList.remove('incorrect-input');
            }
        });
    }

    inputBlanks.forEach(input => input.disabled = true);
    submitButton.disabled = true;
}


/**
 * Handles the logic for a short answer quiz submission.
 * @param {HTMLElement} submitButton - The submit button clicked.
 * @param {string} quizId - The ID of the quiz.
 * @param {object} quizData - The quiz data.
 */
async function handleShortAnswerSubmit(submitButton, quizId, quizData) {
    const quizContainer = document.getElementById(quizId);
    if (!quizContainer || completedQuizIds.includes(quizId)) return; // Prevent re-answering

    const userAnswerInput = quizContainer.querySelector('.quiz-short-answer-input');
    const userAnswer = userAnswerInput.value.trim();
    const explanationDiv = quizContainer.querySelector('.quiz-explanation');
    const originalButtonText = submitButton.innerHTML;

    if (!userAnswer) {
        showToast('Vui lòng nhập câu trả lời của bạn.', 'info');
        return;
    }

    submitButton.disabled = true;
    userAnswerInput.disabled = true;
    submitButton.innerHTML = `<span class="loading-spinner">${svgIcons.spinner}</span> Đang đánh giá...`;
    
    try {
        const evaluationPrompt = `Tôi đã trả lời câu hỏi "${quizData.question}" với câu trả lời: "${userAnswer}".
        Các từ khóa quan trọng là: ${quizData.keywords.join(', ')}.
        Câu trả lời gợi ý hoặc ý chính là: "${quizData.expected_answer_gist}".
        Dựa trên thông tin này, hãy cho biết câu trả lời của tôi CÓ ĐÚNG hay KHÔNG ĐÚNG, và giải thích ngắn gọn tại sao.
        Chỉ trả lời "ĐÚNG" hoặc "KHÔNG ĐÚNG" ở dòng đầu tiên, sau đó là giải thích.`;

        const result = await fastModel.generateContent(evaluationPrompt);
        const feedback = result.response.text();
        const isCorrect = feedback.toLowerCase().startsWith('đúng');

        explanationDiv.classList.remove('hidden');
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Phản hồi:** ${feedback}`));

        if (isCorrect) {
            explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
            markQuizCompleted(quizId);
        } else {
            explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
            // Add a "Learn More" button if incorrect
            const learnMoreBtn = document.createElement('button');
            learnMoreBtn.className = 'quiz-learn-more-btn flex items-center gap-2 text-xs px-3 py-1 bg-blue-100 dark:bg-slate-600 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-slate-500 transition-colors mt-2';
            learnMoreBtn.innerHTML = `<span>Học lại</span> 📖`;
            learnMoreBtn.onclick = () => {
                const fullExplanationPrompt = `Giải thích đầy đủ về "${quizData.question}" (lấy từ explanation trong JSON quiz).`;
                sendMessage(fullExplanationPrompt);
                markQuizCompleted(quizId); // Mark as completed if user chooses to learn more
            };
            explanationDiv.appendChild(learnMoreBtn);
        }

    } catch (error) {
        console.error("Lỗi khi đánh giá tự luận:", error);
        explanationDiv.classList.remove('hidden');
        explanationDiv.innerHTML = `<span class="text-red-500">Lỗi khi đánh giá câu trả lời. Vui lòng thử lại.</span>`;
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
    } finally {
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        if (completedQuizIds.includes(quizId)) {
            userAnswerInput.disabled = true;
            if (quizContainer.querySelector('.quiz-submit-btn')) { // Check if button exists before removing
                quizContainer.querySelector('.quiz-submit-btn').remove();
            }
        } else {
            userAnswerInput.disabled = false;
        }
    }
}

/**
 * Handles the logic for a drag and drop matching quiz submission.
 * @param {HTMLElement} submitButton - The submit button clicked.
 * @param {string} quizId - The ID of the quiz.
 * @param {object} quizData - The quiz data.
 */
function handleDragAndDropMatchingSubmit(submitButton, quizId, quizData) {
    const quizContainer = document.getElementById(quizId);
    if (!quizContainer || completedQuizIds.includes(quizId)) return;

    const dropTargets = quizContainer.querySelectorAll('.drop-target');
    let allCorrect = true;
    const userMatches = {}; // { targetId: itemId }

    dropTargets.forEach(target => {
        const droppedItem = target.querySelector('.drag-item');
        if (droppedItem) {
            userMatches[target.dataset.targetId] = droppedItem.dataset.itemId;
        } else {
            userMatches[target.dataset.targetId] = null; // No item dropped
        }
    });

    dropTargets.forEach(target => {
        const correctMatchId = target.dataset.correctMatchId;
        const droppedItemId = userMatches[target.dataset.targetId];
        const droppedItemPlaceholder = target.querySelector('.dropped-item-placeholder');

        if (droppedItemId === correctMatchId) {
            target.classList.add('correct');
            target.classList.remove('incorrect');
            if (droppedItemPlaceholder) {
                droppedItemPlaceholder.textContent = `(${DOMPurify.sanitize(quizData.items.find(item => item.id === droppedItemId).text)})`;
                droppedItemPlaceholder.classList.remove('text-red-700', 'dark:text-red-200');
                droppedItemPlaceholder.classList.add('text-green-700', 'dark:text-green-200');
            }
        } else {
            allCorrect = false;
            target.classList.add('incorrect');
            target.classList.remove('correct');
            if (droppedItemPlaceholder) {
                const correctItemText = quizData.items.find(item => item.id === correctMatchId).text;
                droppedItemPlaceholder.textContent = droppedItemId ? `(Sai: ${DOMPurify.sanitize(correctItemText)})` : `(Thiếu: ${DOMPurify.sanitize(correctItemText)})`;
                droppedItemPlaceholder.classList.remove('text-green-700', 'dark:text-green-200');
                droppedItemPlaceholder.classList.add('text-red-700', 'dark:text-red-200');
            }
        }
    });

    const explanationDiv = quizContainer.querySelector('.quiz-explanation');
    explanationDiv.classList.remove('hidden');

    if (allCorrect) {
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Chính xác!** ${quizData.explanation}`));
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        markQuizCompleted(quizId);
        quizContainer.querySelectorAll('.drag-item').forEach(item => item.draggable = false);
        submitButton.remove(); // Remove submit button
    } else {
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Chưa chính xác.** Vui lòng thử lại. ${quizData.explanation}`));
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
    }
}

/**
 * Handles the logic for a sentence ordering quiz submission.
 * @param {HTMLElement} submitButton - The submit button clicked.
 * @param {string} quizId - The ID of the quiz.
 * @param {object} quizData - The quiz data.
 */
function handleSentenceOrderingSubmit(submitButton, quizId, quizData) {
    const quizContainer = document.getElementById(quizId);
    if (!quizContainer || completedQuizIds.includes(quizId)) return;

    const sentenceItems = quizContainer.querySelectorAll('.sentence-item');
    const userOrder = Array.from(sentenceItems).map(item => item.dataset.sentenceId);
    const correctOrder = quizData.correctOrder;

    let allCorrect = true;
    for (let i = 0; i < userOrder.length; i++) {
        if (userOrder[i] !== correctOrder[i]) {
            allCorrect = false;
            break;
        }
    }

    const explanationDiv = quizContainer.querySelector('.quiz-explanation');
    explanationDiv.classList.remove('hidden');

    if (allCorrect) {
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Chính xác!** ${quizData.explanation}`));
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        markQuizCompleted(quizId);
        quizContainer.querySelectorAll('.sentence-item').forEach(item => item.draggable = false);
        submitButton.remove(); // Remove submit button
    } else {
        explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`**Chưa chính xác.** Vui lòng thử lại. ${quizData.explanation}`));
        explanationDiv.className = 'quiz-explanation mt-3 text-sm p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
    }

    // Highlight correct/incorrect positions
    sentenceItems.forEach((item, index) => {
        if (item.dataset.sentenceId === correctOrder[index]) {
            item.classList.add('correct');
            item.classList.remove('incorrect');
        } else {
            item.classList.add('incorrect');
            item.classList.remove('correct');
        }
    });
}


/**
 * Marks a quiz as completed and updates the database.
 * @param {string} quizId - The ID of the quiz to mark as completed.
 */
function markQuizCompleted(quizId) {
    if (!completedQuizIds.includes(quizId)) {
        completedQuizIds.push(quizId);
        updateConversationInDb(); // Save the updated completed quiz IDs
    }
}


/**
 * Dành riêng cho việc render HTML của một khối trắc nghiệm (đa dạng loại).
 * @param {object} data - Dữ liệu JSON của quiz đã được parse.
 * @param {string} quizId - Một ID duy nhất cho khối quiz này.
 * @returns {HTMLElement} - Phần tử DOM của khối quiz.
 */
function renderQuiz(data, quizId) {
    // Nếu dữ liệu quiz không hợp lệ hoặc không có type, trả về div lỗi
    if (!data || !data.type) {
        console.warn('Invalid or missing quiz type in data:', data);
        const errorDiv = document.createElement('div');
        errorDiv.className = "text-red-500 my-4 p-4 border rounded-xl bg-red-50 dark:bg-red-900/50";
        errorDiv.textContent = `Lỗi: Loại quiz không xác định hoặc không được hỗ trợ. Vui lòng kiểm tra định dạng JSON. Dữ liệu: ${JSON.stringify(data)}`;
        return errorDiv;
    }

    switch (data.type) {
        case 'multiple_choice':
            return renderMultipleChoiceQuiz(data, quizId);
        case 'fill_in_the_blank':
            return renderFillInTheBlankQuiz(data, quizId);
        case 'short_answer':
            return renderShortAnswerQuiz(data, quizId);
        case 'flashcard':
            return renderFlashcardQuiz(data, quizId); // === THÊM: Xử lý Flashcard ===
        case 'drag_and_drop_matching':
            return renderDragAndDropMatchingQuiz(data, quizId); // === THÊM: Xử lý Kéo và Thả ===
        case 'sentence_ordering':
            return renderSentenceOrderingQuiz(data, quizId); // === THÊM: Xử lý Sắp xếp câu ===
        case 'dialogue_choice': // THÊM DÒNG NÀY
            return renderInteractiveDialogueQuiz(data, quizId); // THÊM DÒNG NÀY
        default:
            console.warn('Unknown quiz type:', data.type);
            const errorDiv = document.createElement('div');
            errorDiv.className = "text-red-500 my-4 p-4 border rounded-xl bg-red-50 dark:bg-red-900/50";
            errorDiv.textContent = `Lỗi: Loại quiz không xác định hoặc không được hỗ trợ: ${data.type}. Vui lòng kiểm tra định dạng JSON.`;
            return errorDiv;
    }
}

/**
 * === HÀM MỚI: Trích xuất và thay thế các khối quiz bằng placeholder ===
 * @param {string} rawText - Toàn bộ phản hồi thô từ AI.
 * @returns {{processedText: string, quizzes: Array<{id: string, rawJson: string}>}} - Văn bản với placeholder và mảng các quiz thô.
 */
function extractAndReplaceQuizBlocks(rawText) {
    // Regex để tìm các khối ```quiz...```. Sử dụng non-greedy match `*?`
    const quizRegex = /```quiz\n([\s\S]*?)\n```/g;
    const extractedQuizzes = [];
    let processedText = rawText;
    let match;

    // Sử dụng Array.from(rawText.matchAll(quizRegex)) để lấy tất cả các trận đấu
    // Điều này tạo một mảng các trận đấu mà không cần lo lắng về lastIndex
    const matches = Array.from(rawText.matchAll(quizRegex));
    
    // Duyệt ngược để thay thế, tránh ảnh hưởng đến chỉ số của các trận đấu sau
    for (let i = matches.length - 1; i >= 0; i--) {
        match = matches[i];
        const rawJsonContent = match[1]; // Nội dung JSON bên trong khối quiz
        const placeholderId = `QUIZ_PLACEHOLDER_${crypto.randomUUID()}`;
        extractedQuizzes.unshift({ id: placeholderId, rawJson: rawJsonContent }); // Thêm vào đầu mảng để giữ đúng thứ tự
        
        // Thay thế khối quiz bằng placeholder trong văn bản
        processedText = processedText.substring(0, match.index) + `<!--${placeholderId}-->` + processedText.substring(match.index + match[0].length);
    }

    return { processedText: processedText, quizzes: extractedQuizzes };
}

/**
 * === HÀM MỚI: Chèn các quiz đã render vào DOM ===
 * @param {HTMLElement} containerElement - Phần tử DOM chứa nội dung tin nhắn.
 * @param {Array<object>} extractedQuizzes - Mảng các quiz đã được trích xuất.
 */
function insertRenderedQuizzes(containerElement, extractedQuizzes) {
    extractedQuizzes.forEach(quiz => {
        let quizData = null;
        let originalJsonContent = quiz.rawJson; // Giữ lại nội dung JSON gốc để hiển thị lỗi

        try {
            // Áp dụng các bước làm sạch JSON cho từng khối quiz riêng biệt
            let cleanJsonText = originalJsonContent
                .replace(/<[^>]*>/g, '') // Loại bỏ bất kỳ thẻ HTML nào
                .replace(/`+/g, '') // Loại bỏ các dấu huyền
                .replace(/“|”/g, '"') // Thay thế smart quotes
                .replace(/(\r\n|\n|\r)/gm, ' ') // Thay thế ngắt dòng trong chuỗi bằng khoảng trắng
                .replace(/\$/g, ''); // Loại bỏ ký hiệu đô la
            
            // Loại bỏ các ký tự điều khiển không hợp lệ trong JSON
            cleanJsonText = cleanJsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            
            cleanJsonText = cleanJsonText.trim();
            
            quizData = JSON.parse(cleanJsonText);

            // Kiểm tra định dạng cũ hoặc không đầy đủ (như trong processQuizBlocks cũ)
            if (!quizData.type) {
                if (quizData.question && (quizData.options || quizData.blanks || quizData.keywords) && quizData.answer) { 
                    quizData.type = 'multiple_choice';
                    if (!quizData.explanation && quizData.explanationText) {
                        quizData.explanation = quizData.explanationText;
                    }
                } else {
                    throw new Error('Unrecognized old quiz format or incomplete data.');
                }
            }

            const quizHtmlElement = renderQuiz(quizData, `quiz-${quiz.id}`); // Tạo ID duy nhất
            
            // Tìm comment node placeholder và thay thế nó
            // Duyệt qua childNodes để tìm comment node
            let foundPlaceholder = false;
            for (let i = 0; i < containerElement.childNodes.length; i++) {
                const node = containerElement.childNodes[i];
                if (node.nodeType === Node.COMMENT_NODE && node.nodeValue.trim() === quiz.id) {
                    node.replaceWith(quizHtmlElement);
                    foundPlaceholder = true;
                    break;
                }
            }
            if (!foundPlaceholder) {
                console.warn(`Placeholder ${quiz.id} không được tìm thấy trong DOM.`);
                // Fallback: Nếu không tìm thấy placeholder, thêm vào cuối container
                containerElement.appendChild(quizHtmlElement);
            }

        } catch (error) {
            console.error("Lỗi phân tích JSON của quiz:", error, originalJsonContent);
            const errorDiv = document.createElement('div');
            errorDiv.className = "text-red-500 my-4 p-4 border rounded-xl bg-red-50 dark:bg-red-900/50";
            errorDiv.innerHTML = `
                <p class="font-semibold mb-2">Lỗi hiển thị quiz:</p>
                <p class="text-sm">Nội dung quiz từ AI bị lỗi định dạng JSON. Vui lòng thử <button class="text-blue-600 dark:text-blue-400 hover:underline regenerate-btn" data-target-id="${containerElement.closest('[data-message-id]') ? containerElement.closest('[data-message-id]').dataset.messageId : ''}">tái tạo phản hồi</button> để thử lại hoặc thông báo cho quản trị viên.</p>
                <details class="mt-2">
                    <summary class="text-xs cursor-pointer text-gray-700 dark:text-gray-300">Chi tiết lỗi (dành cho nhà phát triển)</summary>
                    <pre class="whitespace-pre-wrap text-xs text-red-700 dark:text-red-300 p-2 bg-red-100 dark:bg-red-900 rounded mt-1">${DOMPurify.sanitize(error.message)}\n\nNội dung gốc:\n${DOMPurify.sanitize(originalJsonContent)}</pre>
                </details>
            `;
            // Cố gắng tìm placeholder và thay thế, nếu không thì thêm vào cuối
            let replacedWithError = false;
            for (let i = 0; i < containerElement.childNodes.length; i++) {
                const node = containerElement.childNodes[i];
                if (node.nodeType === Node.COMMENT_NODE && node.nodeValue.trim() === quiz.id) {
                    node.replaceWith(errorDiv);
                    replacedWithError = true;
                    break;
                }
            }
            if (!replacedWithError) {
                containerElement.appendChild(errorDiv);
            }
        }
    });
}


// processQuizBlocks cũ sẽ không còn được gọi trực tiếp nữa.
// Giữ lại định nghĩa để tránh lỗi nếu có nơi khác gọi tới, nhưng logic chính đã chuyển sang insertRenderedQuizzes
// và extractAndReplaceQuizBlocks.
function processQuizBlocks(containerElement) {
    // Hàm này giờ đây không còn xử lý parsing JSON trực tiếp nữa.
    // Logic đã được chuyển sang extractAndReplaceQuizBlocks và insertRenderedQuizzes.
    // Nếu hàm này vẫn được gọi, có thể là một dấu hiệu của lỗi logic.
    console.warn("processQuizBlocks (old logic) được gọi. Vui lòng kiểm tra luồng xử lý.");
    // Có thể thêm logic để tìm và chèn quiz nếu cần, nhưng tốt nhất là không gọi hàm này nữa.
}

// === HÀM MỚI: Tích hợp KaTeX ===
/**
 * Finds and renders mathematical formulas (LaTeX) in a given DOM element using KaTeX.
 * This function relies on the KaTeX auto-render extension being loaded on the page.
 * @param {HTMLElement} element The container element to search for math formulas.
 */
function renderMathFormulas(element) {
    // Check if the KaTeX auto-render function is available
    if (typeof renderMathInElement === 'function') {
        try {
            // Use the auto-render function to find and render math
            renderMathInElement(element, {
                // A list of delimiters to look for
                delimiters: [
                    {left: '$$', right: '$$', display: true},  // For display mode math
                    {left: '$', right: '$', display: false},   // For inline mode math
                    {left: '\\(', right: '\\)', display: false}, // Alternative for inline
                    {left: '\\[', right: '\\]', display: true}  // Alternative for display
                ],
                // Don't throw an error on malformed LaTeX.
                // It will simply display the raw text instead.
                throwOnError: false
            });
        } catch (error) {
            console.error("KaTeX rendering error:", error);
        }
    }
}


/**
 * Speaks a given text using the browser's Speech Synthesis API.
 * @param {string} text - The text to be spoken.
 * @param {string} lang - The BCP 47 language code (e.g., 'zh-CN', 'ja-JP', 'ko-KR', 'en-US', 'vi-VN').
 * @param {boolean} [suppressErrors=false] - If true, suppresses toast notifications on speech errors.
 */
function speakText(text, lang, suppressErrors = false) {
    if (!('speechSynthesis' in window)) {
        if (!suppressErrors) {
            showToast("Trình duyệt không hỗ trợ phát âm.", "error");
        }
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
        }
    }

    utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance error:", event);
        if (!suppressErrors) {
            if (event.error === 'no-speech' || event.error === 'not-allowed') {
                showToast(`Không tìm thấy hoặc không thể dùng giọng đọc cho ngôn ngữ ${lang}.`, 'error');
            } else {
                showToast(`Lỗi phát âm: ${event.error}`, 'error');
            }
        }
    };

    speechSynthesis.speak(utterance);
}

/**
 * Finds foreign characters (Chinese, Japanese, Korean) in an element's text nodes 
 * and wraps them in a clickable span that can be used for pronunciation.
 * @param {HTMLElement} container - The element whose text nodes should be processed.
 */
function makeForeignTextClickable(container) {
    // Chỉ áp dụng cho Gia sư Ngoại ngữ (ngôn ngữ Á Đông)
    if (currentPersona && currentPersona.id !== 'language_tutor') {
        return;
    }

    const foreignRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]+/g;
    const hiraganaKatakanaRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
    const hangulRegex = /[\uAC00-\uD7AF]/;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const nodesToProcess = [];
    let currentNode;
    while (currentNode = walker.nextNode()) {
        nodesToProcess.push(currentNode);
    }

    nodesToProcess.forEach(textNode => {
        if (textNode.parentElement.closest('script, style, .clickable-foreign')) {
            return;
        }

        const text = textNode.nodeValue;
        foreignRegex.lastIndex = 0;
        if (!foreignRegex.test(text)) {
            return;
        }
        foreignRegex.lastIndex = 0;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = foreignRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            const span = document.createElement('span');
            span.className = 'clickable-foreign';
            span.textContent = match[0];
            if (hangulRegex.test(match[0])) {
                span.dataset.lang = 'ko-KR';
            } else if (hiraganaKatakanaRegex.test(match[0])) {
                span.dataset.lang = 'ja-JP';
            } else {
                span.dataset.lang = 'zh-CN';
            }
            span.title = `Phát âm (${span.dataset.lang})`;
            fragment.appendChild(span);
            lastIndex = foreignRegex.lastIndex;
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
 * Finds English words/phrases marked by the AI with specific span tags
 * and makes them clickable for pronunciation.
 * @param {HTMLElement} container - The element whose content should be processed.
 */
function makeEnglishWordsSpeakable(container) {
    // Only apply for the English Tutor persona
    if (currentPersona && currentPersona.id !== 'english_tutor') {
        return;
    }

    container.querySelectorAll('span.english-word-to-speak').forEach(span => {
        if (!span.dataset.listenerAdded) { // Prevent adding multiple listeners
            span.classList.add('clickable-foreign'); // Reuse existing styling for clickable text
            span.title = 'Phát âm tiếng Anh';
            span.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                speakText(span.textContent, 'en-US', true); // Pass true to suppress errors
            });
            span.dataset.listenerAdded = 'true'; // Mark as processed
        }
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
            // Updated to handle actual JSON string parsing from the prompt attribute
            prompt = JSON.parse(match[2]).prompt;
        } catch(e) {
            prompt = match[2]; // Fallback if it's not a valid JSON string
        }

        const sanitizedPrompt = prompt.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const isCompleted = completedTopics.includes(sanitizedPrompt); // Check against sanitized prompt
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
    completedQuizIds = []; // Reset completed quizzes for a new chat
    
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
    
    // Bước 1: Trích xuất quiz và thay thế bằng placeholder
    const { processedText: textWithQuizPlaceholders, quizzes: extractedQuizzes } = extractAndReplaceQuizBlocks(text);

    // Bước 2: Xử lý Markdown và các liên kết trên phần còn lại
    const preprocessedText = preprocessText(textWithQuizPlaceholders);
    // Allow 'span' tags and 'class' attribute for custom styling/behavior
    contentElem.innerHTML = DOMPurify.sanitize(marked.parse(preprocessedText), { ADD_ATTR: ['target', 'data-term', 'data-prompt', 'data-lang', 'data-listener-added'], ADD_TAGS: ['span'] });

    highlightAllCode(contentElem);
    makeForeignTextClickable(contentElem); 
    // Gọi hàm mới cho tiếng Anh
    makeEnglishWordsSpeakable(contentElem);
    
    if (actionsContainer) {
        addMessageActions(actionsContainer, text, messageId);
    }

    chatContainer.insertBefore(messageWrapper, notificationArea);

    // Bước 3: Chèn quiz tương tác vào vị trí placeholder
    insertRenderedQuizzes(contentElem, extractedQuizzes);

    // === CẬP NHẬT: Gọi hàm render KaTeX ===
    renderMathFormulas(contentElem);

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
                // Check if it matches any of our known quiz structures
                if (
                    (potentialJson.type === 'multiple_choice' && potentialJson.question && potentialJson.options && potentialJson.answer) ||
                    (potentialJson.type === 'fill_in_the_blank' && potentialJson.sentence && potentialJson.blanks) ||
                    (potentialJson.type === 'short_answer' && potentialJson.question && potentialJson.keywords && potentialJson.expected_answer_gist) ||
                    (potentialJson.type === 'flashcard' && potentialJson.cards && potentialJson.cards.length > 0 && potentialJson.cards[0].front && potentialJson.cards[0].back) ||
                    (potentialJson.type === 'drag_and_drop_matching' && potentialJson.items && potentialJson.targets) ||
                    (potentialJson.type === 'sentence_ordering' && potentialJson.sentences && potentialJson.correctOrder) ||
                    (potentialJson.type === 'dialogue_choice' && potentialJson.dialogue_flow && potentialJson.start_node_id) || // THÊM ĐIỀU KIỆN NÀY
                    // Check for old multiple_choice format (no type field)
                    (potentialJson.question && potentialJson.options && potentialJson.answer) 
                ) {
                   block.classList.add('language-quiz'); // Sẽ không highlight block này
                }
             } catch(e) { /* not valid JSON, ignore */ }
        }
        
        // FIX: Bỏ qua highlight cho các khối ngôn ngữ 'quiz'
        if (block.classList.contains('language-quiz')) {
            return; // Skip highlighting this block
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
            // Bước 1: Trích xuất quiz và thay thế bằng placeholder
            const { processedText: textWithQuizPlaceholders, quizzes: extractedQuizzesDuringStream } = extractAndReplaceQuizBlocks(fullResponseText);

            // Bước 2: Xử lý Markdown và các liên kết trên phần còn lại
            const processedChunkForStreaming = preprocessText(textWithQuizPlaceholders + '<span class="blinking-cursor"></span>');
            // Allow 'span' tags and 'class' attribute for custom styling/behavior
            contentElem.innerHTML = DOMPurify.sanitize(marked.parse(processedChunkForStreaming), { ADD_ATTR: ['target', 'data-term', 'data-prompt', 'data-lang', 'data-listener-added'], ADD_TAGS: ['span'] });
            highlightAllCode(contentElem);
            makeForeignTextClickable(contentElem); // Gọi lại để xử lý văn bản tiếng nước ngoài khi stream
            makeEnglishWordsSpeakable(contentElem); // Gọi lại để xử lý văn bản tiếng Anh khi stream
            renderMathFormulas(contentElem); // === CẬP NHẬT: Render toán học trong khi stream ===
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // Trong quá trình stream, chúng ta không chèn quiz tương tác ngay lập tức
            // vì JSON có thể chưa hoàn chỉnh. Chúng ta sẽ làm điều đó ở cuối.
        }
        
        if (statusElem) statusElem.classList.add('hidden');
        
        // Render cuối cùng với đầy đủ quiz
        const { processedText: finalProcessedTextWithPlaceholders, quizzes: finalExtractedQuizzes } = extractAndReplaceQuizBlocks(fullResponseText);
        const finalProcessedText = preprocessText(finalProcessedTextWithPlaceholders);

        // Allow 'span' tags and 'class' attribute for custom styling/behavior
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(finalProcessedText), {ADD_ATTR: ['target', 'data-term', 'data-prompt', 'data-lang', 'data-listener-added'], ADD_TAGS: ['span']});
        contentElem.dataset.rawText = fullResponseText; // Lưu rawText gốc

        highlightAllCode(contentElem);
        // Bước 3: Chèn quiz tương tác vào vị trí placeholder
        insertRenderedQuizzes(contentElem, finalExtractedQuizzes);
        makeForeignTextClickable(contentElem); // Gọi lại để xử lý văn bản tiếng nước ngoài sau khi stream kết thúc
        makeEnglishWordsSpeakable(contentElem); // Gọi lại để xử lý văn bản tiếng Anh sau khi stream kết thúc
        renderMathFormulas(contentElem); // === CẬP NHẬT: Render toán học lần cuối để đảm bảo ===

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
            // Bước 1: Trích xuất quiz và thay thế bằng placeholder
            const { processedText: textWithQuizPlaceholders, quizzes: extractedQuizzesDuringStream } = extractAndReplaceQuizBlocks(newFullResponseText);

            // Bước 2: Xử lý Markdown và các liên kết trên phần còn lại
            const processedChunk = preprocessText(textWithQuizPlaceholders + '<span class="blinking-cursor"></span>');
            // Allow 'span' tags and 'class' attribute for custom styling/behavior
            contentElem.innerHTML = DOMPurify.sanitize(marked.parse(processedChunk), {ADD_ATTR: ['target', 'data-term', 'data-prompt', 'data-lang', 'data-listener-added'], ADD_TAGS: ['span']});
            highlightAllCode(contentElem);
            makeForeignTextClickable(contentElem); // Gọi lại để xử lý văn bản tiếng nước ngoài khi stream
            makeEnglishWordsSpeakable(contentElem); // Gọi lại để xử lý văn bản tiếng Anh khi stream
            renderMathFormulas(contentElem); // === CẬP NHẬT: Render toán học trong khi stream ===
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        if(statusElem) statusElem.classList.add('hidden');

        // Render cuối cùng với đầy đủ quiz
        const { processedText: finalProcessedTextWithPlaceholders, quizzes: finalExtractedQuizzes } = extractAndReplaceQuizBlocks(newFullResponseText);
        const finalProcessedText = preprocessText(finalProcessedTextWithPlaceholders);

        // Allow 'span' tags and 'class' attribute for custom styling/behavior
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(finalProcessedText), {ADD_ATTR: ['target', 'data-term', 'data-prompt', 'data-lang', 'data-listener-added'], ADD_TAGS: ['span']});
        contentElem.dataset.rawText = newFullResponseText;
        
        highlightAllCode(contentElem);
        // Bước 3: Chèn quiz tương tác vào vị trí placeholder
        insertRenderedQuizzes(contentElem, finalExtractedQuizzes);
        makeForeignTextClickable(contentElem); // Gọi lại để xử lý văn bản tiếng nước ngoài sau khi stream kết thúc
        makeEnglishWordsSpeakable(contentElem); // Gọi lại để xử lý văn bản tiếng Anh sau khi stream kết thúc
        renderMathFormulas(contentElem); // === CẬP NHẬT: Render toán học lần cuối để đảm bảo ===

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
        completedTopics: completedTopics || [],
        completedQuizIds: completedQuizIds || [] // Save completed quiz IDs
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
            completedQuizIds = data.completedQuizIds || []; // Load completed quiz IDs
            
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
        const result = await fastModel.generateContent(prompt);
        // === FIX: Thêm kiểm tra an toàn cho result.response và result.response.text() ===
        if (result && result.response && typeof result.response.text === 'function') {
            const responseText = result.response.text();
            const suggestions = responseText.split('\n').filter(s => s.trim() !== '');
            displaySuggestions(suggestions);
        } else {
            console.warn("API không trả về phản hồi hợp lệ cho gợi ý.", result);
            // Optionally, clear suggestions or show a message if API response is not valid
            clearSuggestions(); 
        }
    }
    catch (error) {
        console.error("Error getting suggestions:", error);
        clearSuggestions(); // Clear suggestions on error as well
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
    renderMathFormulas(contentElem); // === CẬP NHẬT: Render toán học cho trợ lý phụ ===
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
            renderMathFormulas(contentElem); // === CẬP NHẬT: Render toán học trong khi stream ===
            referenceContent.scrollTop = referenceContent.scrollHeight;
        }
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(fullResponseText));
        renderMathFormulas(contentElem); // === CẬP NHẬT: Render toán học lần cuối ===

        const actionsContainer = messageWrapper.querySelector('.message-actions');
        if (actionsContainer && fullResponseText.trim()) {
            const saveNoteBtn = document.createElement('button');
            saveNoteBtn.className = 'flex items-center gap-2 text-xs px-3 py-1 bg-yellow-200 dark:bg-slate-600 text-yellow-800 dark:text-yellow-200 rounded-full hover:bg-yellow-300 dark:hover:bg-slate-500 transition-colors';
            saveNoteBtn.innerHTML = `${svgIcons.saveNote} <span>Lưu Ghi chú</span>`;
            saveNoteBtn.onclick = () => saveAsNote(userPrompt, fullResponseText); // Pass fullResponseText
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
        renderMathFormulas(contentElem); // === CẬP NHẬT: Render toán học cho giải thích thuật ngữ ===

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
    const clickableForeign = e.target.closest('.clickable-foreign'); // For Asian languages and now English words
    
    // Check for quiz related clicks
    const quizOptionButton = e.target.closest('.quiz-option-btn');
    const quizSubmitButton = e.target.closest('.quiz-submit-btn');
    const flashcardContainer = e.target.closest('.flashcard-container'); // for flipping flashcard
    const flashcardNavButton = e.target.closest('.flashcard-nav-btn'); // for flashcard navigation
    const flashcardSpeakButton = e.target.closest('.flashcard-speak-btn'); // for flashcard speaking
    const flashcardMarkCompletedButton = e.target.closest('.flashcard-mark-completed-btn'); // for marking flashcard completed
    const dialogueChoiceButton = e.target.closest('.dialogue-choice-btn'); // THÊM DÒNG NÀY
    
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
    } else if (quizOptionButton && !quizOptionButton.disabled) {
        e.preventDefault();
        const quizId = quizOptionButton.dataset.quizId;
        const quizContainer = document.getElementById(quizId);
        if (quizContainer && quizContainer.dataset.quizData) {
            const quizData = JSON.parse(quizContainer.dataset.quizData);
            if (quizData.type === 'multiple_choice') {
                handleMultipleChoiceAnswer(quizOptionButton, quizId, quizData);
            }
        }
    } else if (quizSubmitButton && !quizSubmitButton.disabled) {
        e.preventDefault();
        const quizId = quizSubmitButton.closest('[id^="quiz-"]').id;
        const quizContainer = document.getElementById(quizId);
        if (quizContainer && quizContainer.dataset.quizData) {
            const quizData = JSON.parse(quizContainer.dataset.quizData);
            if (quizData.type === 'fill_in_the_blank') {
                handleFillInTheBlankSubmit(quizSubmitButton, quizId, quizData);
            } else if (quizData.type === 'short_answer') {
                await handleShortAnswerSubmit(quizSubmitButton, quizId, quizData);
            } else if (quizData.type === 'drag_and_drop_matching') {
                handleDragAndDropMatchingSubmit(quizSubmitButton, quizId, quizData);
            } else if (quizData.type === 'sentence_ordering') {
                handleSentenceOrderingSubmit(quizSubmitButton, quizId, quizData);
            }
        }
    } else if (flashcardContainer) {
        // Handle flashcard flip
        // Ngăn chặn sự kiện nổi bọt từ các nút bên trong flashcardContainer
        if (e.target.closest('.flashcard-speak-btn') || e.target.closest('.flashcard-nav-btn') || e.target.closest('.flashcard-mark-completed-btn')) {
            // Nếu click vào một trong các nút này, không lật thẻ
            e.stopPropagation();
            return; 
        }

        const quizWrapper = flashcardContainer.closest('.flashcard-quiz-wrapper');
        // Only flip if the entire quiz set is not completed.
        if (quizWrapper && !completedQuizIds.includes(quizWrapper.id)) {
            const isFlipped = flashcardContainer.classList.contains('flipped'); // Lấy trạng thái lật từ container
            flashcardContainer.classList.toggle('flipped', !isFlipped); // Áp dụng class 'flipped' cho container
        }
    } else if (flashcardNavButton) {
        e.stopPropagation(); // Ngăn chặn nổi bọt để không lật thẻ
        const quizWrapper = flashcardNavButton.closest('.flashcard-quiz-wrapper');
        if (!quizWrapper || completedQuizIds.includes(quizWrapper.id)) return; // Prevent navigation if completed
        const quizData = JSON.parse(quizWrapper.dataset.quizData);
        let currentCardIndex = parseInt(quizWrapper.dataset.currentCardIndex);
        const totalCards = quizData.cards.length;

        // Reset flip state for new card by removing 'flipped' class from container
        const container = quizWrapper.querySelector('.flashcard-container');
        if (container) {
            container.classList.remove('flipped');
        }

        if (flashcardNavButton.classList.contains('prev-card-btn')) {
            currentCardIndex--;
        } else if (flashcardNavButton.classList.contains('next-card-btn')) {
            currentCardIndex++;
        }

        if (currentCardIndex >= 0 && currentCardIndex < totalCards) {
            quizWrapper.dataset.currentCardIndex = currentCardIndex;
            quizWrapper.querySelector('.flashcard-counter').textContent = `${currentCardIndex + 1}/${totalCards}`;
            
            quizWrapper.querySelectorAll('.flashcard-item').forEach((card, index) => {
                card.style.display = index === currentCardIndex ? 'flex' : 'none';
            });
            // Update button disabled states
            quizWrapper.querySelector('.prev-card-btn').disabled = currentCardIndex === 0;
            quizWrapper.querySelector('.next-card-btn').disabled = currentCardIndex === totalCards - 1;
        }
    } else if (flashcardSpeakButton) {
        e.stopPropagation(); // Ngăn chặn nổi bọt để không lật thẻ
        const textToSpeak = flashcardSpeakButton.dataset.text;
        const lang = flashcardSpeakButton.dataset.lang;
        if (lang) { // Check if lang is defined
            speakText(textToSpeak, lang);
        }
    } else if (flashcardMarkCompletedButton) {
        e.stopPropagation(); // Ngăn chặn nổi bọt để không lật thẻ
        const quizWrapper = flashcardMarkCompletedButton.closest('.flashcard-quiz-wrapper');
        if (quizWrapper && !completedQuizIds.includes(quizWrapper.id)) { // Prevent marking if already completed
            markQuizCompleted(quizWrapper.id);
            flashcardMarkCompletedButton.disabled = true;
            flashcardMarkCompletedButton.innerHTML = `${svgIcons.checkCircle} Bạn đã hoàn thành bộ Flashcard này!`;
            flashcardMarkCompletedButton.classList.add('text-green-600', 'dark:text-green-400');
            // Disable navigation and flip
            const flashcardContainerElement = quizWrapper.querySelector('.flashcard-container');
            if (flashcardContainerElement) flashcardContainerElement.style.pointerEvents = 'none';
            quizWrapper.querySelectorAll('.flashcard-nav-btn').forEach(btn => btn.disabled = true);
        }
    } else if (dialogueChoiceButton) { // THÊM KHỐI NÀY
        e.preventDefault();
        const quizWrapper = dialogueChoiceButton.closest('.dialogue-choice-quiz-wrapper');
        if (!quizWrapper || completedQuizIds.includes(quizWrapper.id)) return; // Prevent interaction if completed

        const quizData = JSON.parse(quizWrapper.dataset.quizData);
        const nextNodeId = dialogueChoiceButton.dataset.nextId;
        const userText = dialogueChoiceButton.dataset.userText; // Get user's selected text

        const dialogueTranscript = quizWrapper.querySelector('.dialogue-transcript');
        const dialogueChoices = quizWrapper.querySelector('.dialogue-choices');

        // Append user's choice to the transcript
        const userMessage = document.createElement('div');
        userMessage.className = 'flex justify-end';
        userMessage.innerHTML = `
            <div class="message-content user-dialogue-text px-3 py-2 rounded-lg bg-blue-500 dark:bg-blue-700 text-white">${DOMPurify.sanitize(userText)}</div>
        `;
        dialogueTranscript.appendChild(userMessage);
        dialogueTranscript.scrollTop = dialogueTranscript.scrollHeight; // Scroll to bottom after adding user message
        
        // Disable choices
        dialogueChoices.innerHTML = ''; 

        // Find the corresponding "USER_RESPONSE_DISPLAY" node in the flow or the next AI node directly
        const renderNode = (nodeIdToRender) => {
            const node = quizData.dialogue_flow.find(n => n.id === nodeIdToRender);
            if (!node) {
                console.error(`Dialogue node with ID ${nodeIdToRender} not found.`);
                dialogueTranscript.innerHTML += `<p class="text-red-500">Error: Dialogue path ended unexpectedly.</p>`;
                dialogueChoices.innerHTML = '';
                markQuizCompleted(quizWrapper.id); // Mark as completed on error
                return;
            }

            if (node.speaker === "AI") {
                const aiMessage = document.createElement('div');
                aiMessage.className = 'flex items-start space-x-2';
                aiMessage.innerHTML = `
                    <div class="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center">${svgIcons.aiAvatar}</div>
                    <div class="message-content ai-dialogue-text px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">${DOMPurify.sanitize(marked.parse(node.text))}</div>
                `;
                dialogueTranscript.appendChild(aiMessage);

                if (node.explanation) {
                    const explanationDiv = document.createElement('div');
                    explanationDiv.className = 'text-xs italic text-gray-500 dark:text-gray-400 ml-9 mt-1';
                    explanationDiv.innerHTML = DOMPurify.sanitize(marked.parse(`*Giải thích: ${node.explanation}*`));
                    dialogueTranscript.appendChild(explanationDiv);
                }

                dialogueChoices.innerHTML = '';
                if (node.choices && node.choices.length > 0) {
                    node.choices.forEach(choice => {
                        const choiceBtn = document.createElement('button');
                        choiceBtn.className = 'dialogue-choice-btn w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors';
                        choiceBtn.textContent = DOMPurify.sanitize(choice.text);
                        choiceBtn.dataset.nextId = choice.nextId;
                        choiceBtn.dataset.userText = choice.text;
                        dialogueChoices.appendChild(choiceBtn);
                    });
                } else {
                    // End of this dialogue branch
                    dialogueChoices.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Hội thoại đã kết thúc tại đây.</p>';
                    markQuizCompleted(quizId); // Mark the dialogue as completed
                }
            } else if (node.speaker === "USER_RESPONSE_DISPLAY") {
                // If the next node is a USER_RESPONSE_DISPLAY, render it and then immediately find the next AI response
                const userMessageForDisplay = document.createElement('div');
                userMessageForDisplay.className = 'flex justify-end';
                userMessageForDisplay.innerHTML = `
                    <div class="message-content user-dialogue-text px-3 py-2 rounded-lg bg-blue-500 dark:bg-blue-700 text-white">${DOMPurify.sanitize(marked.parse(node.text))}</div>
                `;
                dialogueTranscript.appendChild(userMessageForDisplay);
                
                dialogueChoices.innerHTML = ''; // Clear choices as it's a user display
                
                 // Find the next AI response in the flow immediately after this USER_RESPONSE_DISPLAY
                const currentIndex = quizData.dialogue_flow.findIndex(n => n.id === nodeIdToRender);
                if (currentIndex !== -1 && currentIndex + 1 < quizData.dialogue_flow.length) {
                    const nextFlowItem = quizData.dialogue_flow[currentIndex + 1];
                    if (nextFlowItem.speaker === "AI") {
                        quizWrapper.dataset.currentNodeId = nextFlowItem.id;
                        renderNode(nextFlowItem.id); // Recursively call to render next AI node
                    } else {
                        // Unexpected sequence: USER_RESPONSE_DISPLAY followed by another non-AI node
                        dialogueChoices.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Hội thoại đã kết thúc tại đây (lỗi luồng).</p>';
                        markQuizCompleted(quizWrapper.id);
                    }
                } else {
                    dialogueChoices.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Hội thoại đã kết thúc tại đây.</p>';
                    markQuizCompleted(quizWrapper.id);
                }
            }
            dialogueTranscript.scrollTop = dialogueTranscript.scrollHeight; // Scroll to bottom
        };

        renderNode(nextNodeId); // Start rendering from the chosen next node

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
            utterance.lang = 'vi-VN'; // Default to Vietnamese for general chat
            // For language-specific pronunciation, we might need a more sophisticated check
            // based on persona or detected language. For now, keep it simple.
            
            utterance.onstart = () => {
                resetActiveSpeechButton();
                activeSpeech = { utterance, button: button };
                button.innerHTML = '⏸️'; button.dataset.state = 'playing'; button.title = 'Tạm dừng';
            };
            utterance.onend = () => { resetActiveSpeechButton(); activeSpeech = null; };
            utterance.onerror = (event) => { 
                console.error("SpeechSynthesisUtterance error:", event);
                showToast(`Lỗi phát âm: ${event.error}`, 'error'); // Keep toast for general speak button
                resetActiveSpeechButton(); 
                activeSpeech = null; 
            };
            speechSynthesis.speak(utterance);
         } else if (button.classList.contains('regenerate-btn')) {
            handleRegenerate(button.dataset.targetId);
         }
    } else if (clickableForeign) { // This handles both Asian and now English words
        e.preventDefault();
        const textToSpeak = clickableForeign.textContent;
        const lang = clickableForeign.dataset.lang; // Will be 'zh-CN', 'ja-JP', 'ko-KR', or 'en-US'
        if (lang) {
            speakText(textToSpeak, lang, true); // Pass true to suppress errors for clicked words
        }
    }
});

// === Kéo và Thả (Drag and Drop) Logic ===
let draggedItem = null;

chatContainer.addEventListener('dragstart', (e) => {
    // Cập nhật: Đảm bảo nhận diện cả drag-item và sentence-item
    const item = e.target.closest('.drag-item') || e.target.closest('.sentence-item');
    if (item && !item.classList.contains('disabled')) {
        draggedItem = item;
        // Cập nhật: Sử dụng ID phù hợp cho từng loại item
        e.dataTransfer.setData('text/plain', item.dataset.itemId || item.dataset.sentenceId);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => item.classList.add('dragging'), 0);
    }
});

chatContainer.addEventListener('dragover', (e) => {
    const target = e.target.closest('.drop-target');
    const sentenceContainer = e.target.closest('.sentences-container');
    if (target || sentenceContainer) {
        e.preventDefault(); // Allow drop
        e.dataTransfer.dropEffect = 'move';
        if (target && !target.classList.contains('completed')) {
            target.classList.add('drag-over');
        }
    }
});

chatContainer.addEventListener('dragleave', (e) => {
    const target = e.target.closest('.drop-target');
    if (target) {
        target.classList.remove('drag-over');
    }
});

chatContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.drop-target');
    const sentenceContainer = e.target.closest('.sentences-container');

    if (target && !target.classList.contains('completed')) {
        target.classList.remove('drag-over');
        if (draggedItem && draggedItem.classList.contains('drag-item')) { // Chỉ cho phép drag-item vào drop-target
            // Remove previous item from this target if any
            const existingItem = target.querySelector('.drag-item');
            if (existingItem) {
                const sourceContainer = draggedItem.closest('.drag-items-container');
                if (sourceContainer) {
                    sourceContainer.appendChild(existingItem); // Move it back to source
                }
            }
            target.appendChild(draggedItem);
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
    } else if (sentenceContainer) {
        // Handle drop for sentence ordering
        if (draggedItem && draggedItem.classList.contains('sentence-item')) {
            const afterElement = getDragAfterElement(sentenceContainer, e.clientY);
            if (afterElement == null) {
                sentenceContainer.appendChild(draggedItem);
            } else {
                sentenceContainer.insertBefore(draggedItem, afterElement);
            }
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
    }
});

chatContainer.addEventListener('dragend', (e) => {
    const items = document.querySelectorAll('.drag-item, .sentence-item');
    items.forEach(item => item.classList.remove('dragging'));
    draggedItem = null; // Reset dragged item
});

// Helper for sentence ordering drag and drop
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sentence-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}


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
        scrollToTopBtn.classList.remove('show'); // Sửa lỗi ở đây
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

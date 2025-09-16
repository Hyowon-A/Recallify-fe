import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    common: {
      landing: {
        login: "Log in",
        signup: "Sign up",
        heroTitle: "Master Your Memory with",
        heroSub: {
          part1:"Turn your notes into study-ready ",
          highlight: "MCQs and flashcards",
          part2: ", and remember them with space repetition."
        },
        getStarted: "Get Started",
        how: "How it works",
        howTitle1: "Add Your Notes",
        howSub1: "Upload study notes or lecture material",
        howTitle2: "AI Generates Questions",
        howSub2: "Get MCQs and flashcards instantly",
        howTitle3: "Spaced Repetition",
        howSub3: "Review at the right time to remember longer",
        howTitle4: "Share with Others",
        howSub4: "Publish your sets to the public library",
      },
      auth: {
        name: "Name",
        email: "Email",
        password: "Password",
        forgotPw: "Forgot password?",
        close: "Close",
      },
      profile: {
        profile: "Profile",
        name: "Name",
        email: "Email",
        logout: "Log out",
        cancel: "Cancel",
        edit: "Edit",
        currentPw: "Current Password",
        newPw: "New Password",
        confirmNewPw: "Confirm New Password",
        save: "Save",
        editMsg: "Profile updated."
      },
      dashboard: {
        noMcq: "No MCQ sets yet. Click Add to create one.",
        noFlash: "No flashcard sets yet. Click Add to create one.",
      },
      public: {
        noMcq: "No public MCQ sets yet.",
        noFlash: "No public flashcard sets yet.",
      }, 
      create: {
        setType: {mcq: "Create MCQs", flashcard: "Create Flashcards"}, 
        uploadText: "Upload notes → AI generates questions.",
        title: "Set Title",
        upload: "Upload",
        drop: "Drag & drop a PDF",
        or: "or",
        chooseFile: "Choose file",
        selected: "Selected: ",
        questions: "Questions",
        generate: {mcq: "Generate MCQs", flashcard: "Generate Flashcards", loading: "Generating..."},
        loadingMsg: "Extracting, chunking and generating questions…",
        titleMissing: "Please enter a set title.",
        fileMissing: "Please upload a file.",
        level: {easy: "Easy", normal: "Normal", hard: "Hard"}
      },
      nav: { dashboard: "Dashboard", library: "Public Library" },
      sectionHeader: {
        setType: {mcq: "MCQ sets", flashcard: "Flashcard sets"}, 
        add: "+ Add"
      },
      set: {
        type: { mcq: "MCQ", flashcard: "Flashcard" },
        visibility: { public: "Public", private: "Private" },
        status: { new: "New", learn: "Learn", due: "Due" },
        unit: {mcq: "question", flashcard: "card"},
        score: "Score Progress (Last 5 Attempts)",
        noAttempt: "No attempts yet. Try this quiz to see progress here.",
        learn: {mcq: "Start quiz", flashcard: "Start review"},
        backButton: "← Back",
        edit: "Edit",
        copy: "Save to My Dashboard",
        explanation: "Explanations",
        card: "Card",
        front: "Front",
        back: "Back",
        save: {change: "Save Changes", ing: "Saving..."}
      },
      study: {
        label: {again: "Again", hard: "Hard", good: "Good", easy: "Easy"},
        answer: "Show answer (Space)",
        submit: "Submit",
      },
      errors: {
        required: "This field is required.",
        unknown: "Something went wrong.",
      },
      lang: { en: "English", ko: "한국어" },
    },
  },
  ko: {
    common: {
      landing: {
        login: "로그인",
        signup: "회원가입",
        heroTitle: {part1: "로 기억력을", part2: "마스터하세요"},
        heroSub: {
          part1: "노트를 학습 준비가 된 ",
          highlight: "객관식 문제와 플래시카드",
          part2: "로 변환하고, 간격 반복으로 오래 기억하세요."
        },
        getStarted: "시작하기",
        how: "어떻게 사용하나요?",
        howTitle1: "노트 추가하기",
        howSub1: "학습 노트나 강의 자료를 업로드하세요",
        howTitle2: "AI 문제 생성",
        howSub2: "객관식 문제와 플래시카드를 바로 받아보세요",
        howTitle3: "간격 반복 학습",
        howSub3: "적절한 시점에 복습하여 더 오래 기억하세요",
        howTitle4: "다른 사람과 공유",
        howSub4: "세트를 공개 라이브러리에 게시하세요",
      },
      auth: {
        name: "이름",
        email: "이메일",
        password: "비밀번호",
        forgotPw: "비밀번호 찾기",
        close: "닫기",
      },
      profile: {
        profile: "프로필",
        name: "이름",
        email: "이메일",
        logout: "로그아웃",
        cancel: "취소",
        edit: "수정",
        currentPw: "현재 비밀번호",
        newPw: "새 비밀번호",
        confirmNewPw: "새 비밀번호 확인",
        save: "저장",
        editMsg: "프로필이 수정되었습니다."
      },
      dashboard: {
        noMcq: "아직 객관식 문제 세트가 없습니다. 추가 버튼을 눌러 생성하세요.",
        noFlash: "아직 플래시카드 세트가 없습니다. 추가 버튼을 눌러 생성하세요.",
      },
      public: {
        noMcq: "아직 공개 객관식 세트가 없습니다.",
        noFlash: "아직 공개 플래시카드 세트가 아직 없습니다",
      }, 
      create: {
        setType: {mcq: "객관식 문제 생성", flashcard: "플래시카드 생성"}, 
        uploadText: "노트 업로드 → AI 문제 생성",
        title: "세트 이름",
        upload: "업로드",
        drop: "PDF 파일 끌어서 놓기",
        or: "또는",
        chooseFile: "파일 선택하기",
        selected: "선택된 파일 : ",
        questions: "문제 수",
        generate: {mcq: "객관식 문제 생성하기", flashcard: "플래시카드 생성하기", loading: "문제 생성 중"},
        loadingMsg: "텍스트 추출, 분할 및 문제 생성 중...",
        titleMissing: "세트 이름을 입력해주세요.",
        fileMissing: "파일을 업로드해주세요.",
        level: {easy: "쉬움", normal: "보통", hard: "어려움"}
      },
      nav: { dashboard: "대시보드", library: "라이브러리" },
      sectionHeader: {
        setType: {mcq: "객관식 문제 세트", flashcard: "플래시카드 세트"}, 
        add: "+ 추가"
      },
      set: {
        title: "세트 제목",
        type: { mcq: "객관식 문제", flashcard: "플래시카드" },
        visibility: { public: "공개", private: "비공개" },
        status: { new: "신규", learn: "학습", due: "복습 예정" },
        unit: {mcq: "문제", flashcard: "장"},
        score: "점수 분석 (최근 5회 결과)",
        noAttempt: "아직 결과가 없습니다. 퀴즈를 공부해보세요.",
        learn: {mcq: "공부하기", flashcard: "공부하기"},
        backButton: "← 뒤로가기",
        edit: "수정",
        copy: "대시보드에 저장하기",
        explanation: "설명",
        card: "카드",
        front: "앞면",
        back: "뒷면",
        save: {change: "변경 사항 저장", ing: "저장 중..."}
      },
      study: {
        label: {again: "매우 어려움", hard: "어려움", good: "보통", easy: "쉬움"},
        answer: "정답 보기 (스페이스바)",
        submit: "제출",
      },
      errors: {
        required: "이 입력은 필수입니다.",
        unknown: "오류가 발생했어요.",
      },
      lang: { en: "English", ko: "한국어" },
    },
  },
};

i18n
  .use(LanguageDetector) // checks localStorage, navigator.language, etc.
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",  // force English at startup
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      // persist user choice
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;

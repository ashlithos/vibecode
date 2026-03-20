import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Data ────────────────────────────────────────────────── */

const questions = [
  {
    id: "focus",
    question: "What's your peak focus time?",
    options: [
      { label: "Early Bird", emoji: "🌅", value: "early-bird" },
      { label: "Afternoon Hustler", emoji: "☀️", value: "afternoon-hustler" },
      { label: "Night Owl", emoji: "🦉", value: "night-owl" },
    ],
  },
  {
    id: "collab",
    question: "How do you prefer to collaborate?",
    options: [
      { label: "Quick Huddle", emoji: "🤝", value: "quick-huddle" },
      { label: "Async Docs", emoji: "📝", value: "async-docs" },
      { label: "Slack Only", emoji: "💬", value: "slack-only" },
    ],
  },
  {
    id: "weapon",
    question: "Choose your ultimate weapon:",
    options: [
      { label: "Figma", emoji: "🎨", value: "figma" },
      { label: "VS Code", emoji: "💻", value: "vscode" },
      { label: "Jira", emoji: "📋", value: "jira" },
      { label: "Spreadsheets", emoji: "📊", value: "spreadsheets" },
    ],
  },
];

const focusCopy = {
  "early-bird": {
    title: "The Early Bird",
    sub: "You crush it before most people hit snooze.",
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    bg: "from-amber-950/40 via-orange-950/30 to-transparent",
    icon: "🌅",
    hours: ["5am", "6am", "7am", "8am", "9am", "10am"],
    peak: 2,
  },
  "afternoon-hustler": {
    title: "The Afternoon Hustler",
    sub: "Post-lunch is your power hour (or three).",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    bg: "from-yellow-950/40 via-amber-950/30 to-transparent",
    icon: "☀️",
    hours: ["12pm", "1pm", "2pm", "3pm", "4pm", "5pm"],
    peak: 2,
  },
  "night-owl": {
    title: "The Night Owl",
    sub: "Deadlines fear your midnight commits.",
    gradient: "from-indigo-400 via-purple-500 to-violet-600",
    bg: "from-indigo-950/40 via-purple-950/30 to-transparent",
    icon: "🦉",
    hours: ["8pm", "9pm", "10pm", "11pm", "12am", "1am"],
    peak: 3,
  },
};

const collabCopy = {
  "quick-huddle": {
    title: "The Huddle Master",
    sub: "5 minutes face-to-face > 50 Slack threads.",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    bg: "from-emerald-950/40 via-teal-950/30 to-transparent",
    icon: "🤝",
    vibe: "Sync-first, always in the room",
  },
  "async-docs": {
    title: "The Doc Whisperer",
    sub: "If it's not in the doc, it didn't happen.",
    gradient: "from-blue-400 via-indigo-500 to-violet-500",
    bg: "from-blue-950/40 via-indigo-950/30 to-transparent",
    icon: "📝",
    vibe: "Async-first, beautifully documented",
  },
  "slack-only": {
    title: "The Slack Ninja",
    sub: "Thread game: immaculate. Emoji game: legendary.",
    gradient: "from-fuchsia-400 via-pink-500 to-rose-500",
    bg: "from-fuchsia-950/40 via-pink-950/30 to-transparent",
    icon: "💬",
    vibe: "Digital-first, emoji-powered",
  },
};

const weaponCopy = {
  figma: {
    title: "Figma Virtuoso",
    sub: "You see the world in auto-layout and components.",
    gradient: "from-purple-400 via-pink-500 to-red-500",
    bg: "from-purple-950/40 via-pink-950/30 to-transparent",
    icon: "🎨",
    class: "Designer",
  },
  vscode: {
    title: "Code Wizard",
    sub: "Your keyboard shortcuts have keyboard shortcuts.",
    gradient: "from-blue-400 via-cyan-500 to-teal-500",
    bg: "from-blue-950/40 via-cyan-950/30 to-transparent",
    icon: "💻",
    class: "Engineer",
  },
  jira: {
    title: "Jira Wrangler",
    sub: "Tickets bow before your sprint planning skills.",
    gradient: "from-sky-400 via-blue-500 to-indigo-500",
    bg: "from-sky-950/40 via-blue-950/30 to-transparent",
    icon: "📋",
    class: "PM / Lead",
  },
  spreadsheets: {
    title: "Spreadsheet Sorcerer",
    sub: "VLOOKUP is your love language.",
    gradient: "from-green-400 via-emerald-500 to-teal-500",
    bg: "from-green-950/40 via-emerald-950/30 to-transparent",
    icon: "📊",
    class: "Ops / Analyst",
  },
};

/* ─── Slide Transition Variants ──────────────────────────── */

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? "100%" : "-100%", opacity: 0 }),
};

/* ─── Components ─────────────────────────────────────────── */

function OptionButton({ option, selected, onSelect }) {
  const isSelected = selected === option.value;
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(option.value)}
      className={`relative flex items-center gap-3 px-5 py-4 rounded-2xl border-2 text-left transition-all cursor-pointer w-full ${
        isSelected
          ? "border-violet-500 bg-violet-500/15 shadow-lg shadow-violet-500/20"
          : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
      }`}
    >
      <span className="text-2xl">{option.emoji}</span>
      <span className="text-lg font-medium text-white">{option.label}</span>
      {isSelected && (
        <motion.div
          layoutId="check"
          className="ml-auto w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center"
        >
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

function QuizPhase({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);

  const current = questions[step];
  const allAnswered = Object.keys(answers).length === questions.length;

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const next = () => {
    if (step < questions.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Team Vibe
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            Discover your working style
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {questions.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full overflow-hidden bg-white/10"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width:
                    i < step ? "100%" : i === step && answers[current.id] ? "100%" : i === step ? "50%" : "0%",
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        {/* Question card */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm min-h-[340px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-1">
                Question {step + 1} of {questions.length}
              </p>
              <h2 className="text-xl font-bold text-white mb-6">
                {current.question}
              </h2>
              <div className="flex flex-col gap-3">
                {current.options.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    option={opt}
                    selected={answers[current.id]}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={prev}
              className="px-6 py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all cursor-pointer"
            >
              Back
            </motion.button>
          )}
          {step < questions.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={next}
              disabled={!answers[current.id]}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/25 transition-all cursor-pointer"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => allAnswered && onComplete(answers)}
              disabled={!allAnswered}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all cursor-pointer"
            >
              Generate My Vibe ✨
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Story Slides ───────────────────────────────────────── */

function FocusSlide({ data }) {
  const info = focusCopy[data];
  const barHeights = [35, 55, 90, 70, 45, 25];
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
        className="text-7xl mb-6"
      >
        {info.icon}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent mb-3`}
      >
        {info.title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/60 text-lg max-w-xs mb-10"
      >
        {info.sub}
      </motion.p>

      {/* Bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-end gap-2 sm:gap-3 h-32"
      >
        {barHeights.map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 120 }}
              className={`w-8 sm:w-10 rounded-lg ${
                i === info.peak
                  ? `bg-gradient-to-t ${info.gradient} shadow-lg`
                  : "bg-white/15"
              }`}
              style={{ minHeight: 8 }}
            />
            <span className="text-[10px] sm:text-xs text-white/40 font-mono">
              {info.hours[i]}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function CollabSlide({ data }) {
  const info = collabCopy[data];
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="text-7xl mb-6"
      >
        {info.icon}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent mb-3`}
      >
        {info.title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/60 text-lg max-w-xs mb-10"
      >
        {info.sub}
      </motion.p>

      {/* Collab vibe tag */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: "spring" }}
        className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${info.gradient} bg-opacity-20 border border-white/10`}
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <p className="text-sm text-white/50 uppercase tracking-wider font-semibold mb-0.5">
          Your collab style
        </p>
        <p className={`text-lg font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}>
          {info.vibe}
        </p>
      </motion.div>
    </div>
  );
}

function WeaponSlide({ data, answers }) {
  const info = weaponCopy[data];
  const focus = focusCopy[answers.focus];
  const collab = collabCopy[answers.collab];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
        className="text-7xl mb-4"
      >
        {info.icon}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent mb-2`}
      >
        {info.title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-white/60 text-lg max-w-xs mb-8"
      >
        {info.sub}
      </motion.p>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="w-full max-w-xs rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-md"
      >
        <div
          className={`h-2 w-full bg-gradient-to-r ${info.gradient}`}
        />
        <div className="p-5">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-3 font-semibold">
            Your Team Vibe Card
          </p>
          <div className="space-y-2.5 text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg">{focus.icon}</span>
              <span className="text-sm text-white/80">{focus.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{collab.icon}</span>
              <span className="text-sm text-white/80">{collab.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{info.icon}</span>
              <span className="text-sm text-white/80">{info.title}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-white/30">
              Class:{" "}
              <span className={`font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}>
                {info.class}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(
              `My Team Vibe: ${focus.title} + ${collab.title} + ${info.title} (${info.class}) ✨`
            );
          }
        }}
        className="mt-6 px-6 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm hover:bg-white/15 hover:text-white transition-all cursor-pointer border border-white/10"
      >
        Copy to clipboard 📋
      </motion.button>
    </div>
  );
}

function StoryPhase({ answers, onRestart }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const totalSlides = 3;

  const goNext = useCallback(() => {
    if (slideIndex < totalSlides - 1) {
      setDirection(1);
      setSlideIndex((s) => s + 1);
    }
  }, [slideIndex]);

  const goPrev = useCallback(() => {
    if (slideIndex > 0) {
      setDirection(-1);
      setSlideIndex((s) => s - 1);
    }
  }, [slideIndex]);

  const slides = [
    <FocusSlide key="focus" data={answers.focus} />,
    <CollabSlide key="collab" data={answers.collab} />,
    <WeaponSlide key="weapon" data={answers.weapon} answers={answers} />,
  ];

  const slideLabels = ["Focus Time", "Collab Style", "Your Weapon"];

  return (
    <div className="min-h-svh flex flex-col relative overflow-hidden bg-[#0a0a0f]">
      {/* Ambient bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/8 rounded-full blur-[120px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-5">
        <button
          onClick={onRestart}
          className="text-white/40 hover:text-white/70 text-sm transition-colors cursor-pointer"
        >
          ← Retake
        </button>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > slideIndex ? 1 : -1);
                setSlideIndex(i);
              }}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === slideIndex
                  ? "w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  : "w-4 bg-white/20 hover:bg-white/30"
              }`}
            />
          ))}
        </div>
        <span className="text-white/30 text-xs font-mono">
          {slideIndex + 1}/{totalSlides}
        </span>
      </div>

      {/* Slide label */}
      <div className="relative z-20 text-center mt-4">
        <span className="text-xs uppercase tracking-[0.2em] text-white/30 font-semibold">
          {slideLabels[slideIndex]}
        </span>
      </div>

      {/* Slides */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slideIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {slides[slideIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="relative z-20 flex items-center justify-between px-6 pb-8">
        <button
          onClick={goPrev}
          disabled={slideIndex === 0}
          className="px-5 py-2.5 rounded-xl text-white/50 hover:text-white disabled:opacity-0 transition-all cursor-pointer"
        >
          ‹ Prev
        </button>
        {slideIndex < totalSlides - 1 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goNext}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all cursor-pointer"
          >
            Next ›
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all cursor-pointer"
          >
            Start Over 🔄
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ─── App Root ───────────────────────────────────────────── */

export default function App() {
  const [phase, setPhase] = useState("quiz");
  const [answers, setAnswers] = useState(null);

  const handleComplete = (ans) => {
    setAnswers(ans);
    setPhase("story");
  };

  const handleRestart = () => {
    setAnswers(null);
    setPhase("quiz");
  };

  return (
    <AnimatePresence mode="wait">
      {phase === "quiz" ? (
        <motion.div
          key="quiz"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <QuizPhase onComplete={handleComplete} />
        </motion.div>
      ) : (
        <motion.div
          key="story"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StoryPhase answers={answers} onRestart={handleRestart} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

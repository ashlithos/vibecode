import { motion } from 'framer-motion'

export default function ErrorScreen({ error, onRetry }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-6xl mb-6"
      >
        ⚠️
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white mb-4"
      >
        Something went wrong
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-lg w-full bg-red-950/50 border border-red-800/60 rounded-xl p-5 mb-8"
      >
        <p className="text-red-300 text-sm font-mono break-words whitespace-pre-wrap">{error}</p>
      </motion.div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-full transition-colors cursor-pointer"
      >
        Try Again
      </motion.button>
    </div>
  )
}

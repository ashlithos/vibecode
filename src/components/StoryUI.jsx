import { motion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.7, ease: 'easeOut' },
}

export default function StoryUI({ stats, userName }) {
  if (!stats) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <motion.div
          className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{ top: '20%', left: '30%' }}
        />
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-5xl md:text-8xl font-black text-center bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent relative z-10"
        >
          {userName ? `${userName}'s` : 'Your'}
          <br />
          Year in Meetings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-400 mt-6 text-lg relative z-10"
        >
          Scroll down to explore
        </motion.p>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-8 text-gray-500 relative z-10"
        >
          ↓
        </motion.div>
      </section>

      {/* Total Hours */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-gray-500 text-lg uppercase tracking-widest mb-4">Total time in meetings</p>
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="text-8xl md:text-[10rem] font-black bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent"
          >
            {stats.totalMeetingHours}
          </motion.p>
          <p className="text-2xl text-gray-400 mt-2">hours</p>
          <p className="text-gray-600 mt-4">
            That&apos;s {Math.round(stats.totalMeetingHours / 24)} full days, or about{' '}
            {Math.round((stats.totalMeetingHours / (52 * 40)) * 100)}% of a work year
          </p>
        </motion.div>
      </section>

      {/* Meeting Count */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-gray-500 text-lg uppercase tracking-widest mb-4">Across</p>
          <p className="text-7xl md:text-9xl font-black text-purple-400">{stats.meetingCount.toLocaleString()}</p>
          <p className="text-2xl text-gray-400 mt-2">meetings</p>
          <div className="flex gap-8 justify-center mt-8 text-gray-500">
            <div>
              <p className="text-3xl font-bold text-white">{stats.avgMeetingsPerDay}</p>
              <p className="text-sm">per day</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stats.avgMeetingLength} min</p>
              <p className="text-sm">avg length</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Busiest Day */}
      {stats.busiestDay && (
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-6">
          <motion.div {...fadeUp} className="text-center">
            <p className="text-gray-500 text-lg uppercase tracking-widest mb-4">Your busiest day</p>
            <p className="text-6xl md:text-8xl font-black text-pink-400">{stats.busiestDay.name}</p>
            <p className="text-gray-400 mt-4 text-xl">
              with <span className="text-white font-bold">{stats.busiestDay.count}</span> meetings this year
            </p>
          </motion.div>
        </section>
      )}

      {/* Monthly Breakdown Bar Chart */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <motion.div {...fadeUp} className="text-center w-full max-w-2xl">
          <p className="text-gray-500 text-lg uppercase tracking-widest mb-2">Meeting hours by month</p>
          <p className="text-gray-600 mb-8">
            Peak month: <span className="text-white font-bold">{stats.busiestMonth}</span> with{' '}
            <span className="text-white font-bold">{stats.busiestMonthHours}h</span>
          </p>
          <div className="flex items-end justify-center gap-2 h-48">
            {stats.monthlyHours.map((hours, i) => {
              const maxH = Math.max(...stats.monthlyHours, 1)
              const pct = (hours / maxH) * 100
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-purple-600 to-pink-500 relative group min-w-[20px]"
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {hours}h
                  </span>
                </motion.div>
              )
            })}
          </div>
          <div className="flex justify-center gap-2 mt-2">
            {stats.monthNames.map((m) => (
              <span key={m} className="flex-1 text-xs text-gray-600 min-w-[20px]">{m}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Meeting Buddy */}
      {stats.topBuddy && (
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-6">
          <motion.div {...fadeUp} className="text-center">
            <p className="text-gray-500 text-lg uppercase tracking-widest mb-4">Your #1 meeting buddy</p>
            <p className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {stats.topBuddy.name}
            </p>
            <p className="text-gray-400 mt-4 text-xl">
              You shared <span className="text-white font-bold">{stats.topBuddy.count}</span> meetings together
            </p>

            {stats.topBuddies.length > 1 && (
              <div className="mt-10 space-y-3 max-w-sm mx-auto">
                {stats.topBuddies.map((b, i) => (
                  <motion.div
                    key={b.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-left"
                  >
                    <span className="text-gray-600 font-bold w-6 text-right">{i + 1}</span>
                    <div className="flex-1 bg-white/5 rounded-lg px-4 py-2">
                      <p className="text-white text-sm truncate">{b.name}</p>
                    </div>
                    <span className="text-gray-500 text-sm">{b.count}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Longest Meeting */}
      {stats.longestMeeting.minutes > 0 && (
        <section className="min-h-[50vh] flex flex-col items-center justify-center px-6">
          <motion.div {...fadeUp} className="text-center">
            <p className="text-gray-500 text-lg uppercase tracking-widest mb-4">Your marathon meeting</p>
            <p className="text-6xl font-black text-yellow-400">
              {stats.longestMeeting.minutes >= 60
                ? `${Math.floor(stats.longestMeeting.minutes / 60)}h ${stats.longestMeeting.minutes % 60}m`
                : `${stats.longestMeeting.minutes}m`}
            </p>
            <p className="text-gray-400 mt-3 text-lg truncate max-w-md">
              &ldquo;{stats.longestMeeting.name}&rdquo;
            </p>
          </motion.div>
        </section>
      )}

      {/* Persona */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <motion.div
          className="absolute w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ top: '25%', left: '25%' }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center relative z-10"
        >
          <p className="text-gray-500 text-lg uppercase tracking-widest mb-6">Your persona</p>
          <p className="text-8xl mb-4">{stats.persona.emoji}</p>
          <h2 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-6">
            {stats.persona.title}
          </h2>
          <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
            {stats.persona.description}
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 text-center text-gray-600">
        <p>Built with Workspace Wrapped</p>
        <p className="text-sm mt-1">Your data never leaves your browser.</p>
      </footer>
    </div>
  )
}

import { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react'
import { tasteQuestions } from '../../data/tasteQuestions'
import { calculateTasteProfile, describeTasteProfile, matchDishes } from '../../utils/flavorMatch'
import type { Dish, FlavorProfile, TasteTestRecord } from '../../types'
import { flavorLabels } from '../../data/provinces'
import { cn } from '../../utils/cn'
import FlavorRadar from '../dish/FlavorRadar'
import DishCard from '../dish/DishCard'
import DishDetailModal from '../dish/DishDetailModal'
import { useApp } from '../../context/AppContext'
import { shareTasteResult } from '../../utils/share'
import { loadTasteHistory, addTasteTestRecord } from '../../utils/storage'

interface TasteTestProps {
  allDishes: Dish[]
}

type Phase = 'intro' | 'quiz' | 'result'

/** 最匹配菜品展示数量 */
const TOP_DISH_COUNT = 5

// ==================== 子组件 ====================

/** 进度条组件 */
const ProgressBar = memo(function ProgressBar({
  current,
  total,
}: {
  current: number
  total: number
}) {
  const progress = (current / total) * 100

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-1">
        <span>
          第 {current + 1} / {total} 题
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div
        className="h-2 bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="测试进度"
      >
        <div
          className="h-full bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
})

/** 题目卡片（带动画过渡） */
const QuestionCard = memo(function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
}: {
  question: (typeof tasteQuestions)[number]
  questionIndex: number
  totalQuestions: number
  selectedAnswer: number | undefined
  onAnswer: (optionIdx: number) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  // 题目切换时添加入场动画
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    el.classList.remove('animate-slide-in')
    // 触发 reflow 以重启动画
    void el.offsetWidth
    el.classList.add('animate-slide-in')
  }, [questionIndex])

  return (
    <div ref={cardRef} className="animate-slide-in">
      <ProgressBar current={questionIndex} total={totalQuestions} />

      <h3 className="text-xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-6 text-center">
        {question.question}
      </h3>

      <div className="space-y-3" role="radiogroup" aria-label={question.question}>
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(idx)}
            role="radio"
            aria-checked={selectedAnswer === idx}
            className={cn(
              'w-full p-4 text-left border-2 rounded-xl transition-all cursor-pointer',
              'bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)]',
              'text-[var(--color-text)] dark:text-[var(--color-dark-text)]',
              'hover:border-[var(--color-primary)] dark:hover:border-[var(--color-dark-primary)]',
              'hover:bg-[var(--color-bg)] dark:hover:bg-[var(--color-dark-surface)]',
              selectedAnswer === idx
                ? 'border-[var(--color-primary)] dark:border-[var(--color-dark-primary)] bg-[var(--color-primary)]/5 dark:bg-[var(--color-dark-primary)]/10'
                : 'border-[var(--color-border)] dark:border-[var(--color-dark-border)]'
            )}
          >
            <span className="inline-flex items-center gap-3">
              <span
                className={cn(
                  'w-7 h-7 rounded-full border flex items-center justify-center text-sm shrink-0',
                  selectedAnswer === idx
                    ? 'bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white border-[var(--color-primary)] dark:border-[var(--color-dark-primary)]'
                    : 'bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] border-[var(--color-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]'
                )}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt.text}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
})

/** 上次测试对比组件 */
const LastTestComparison = memo(function LastTestComparison({
  currentProfile,
  lastRecord,
}: {
  currentProfile: FlavorProfile
  lastRecord: TasteTestRecord
}) {
  const diff = useMemo(() => {
    const keys = Object.keys(currentProfile) as (keyof FlavorProfile)[]
    return keys
      .map((k) => ({
        key: k,
        current: currentProfile[k],
        previous: lastRecord.profile[k],
        delta: Math.round((currentProfile[k] - lastRecord.profile[k]) * 10) / 10,
      }))
      .filter((d) => d.delta !== 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  }, [currentProfile, lastRecord])

  if (diff.length === 0) return null

  const lastDate = new Date(lastRecord.timestamp)
  const dateStr = `${lastDate.getMonth() + 1}/${lastDate.getDate()}`

  return (
    <div className="p-4 bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
      <h4 className="text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
        📊 与 {dateStr} 测试对比
      </h4>
      <div className="flex flex-wrap gap-2">
        {diff.map((d) => (
          <span
            key={d.key}
            className={cn(
              'text-xs px-2 py-1 rounded-full font-medium',
              d.delta > 0
                ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            )}
          >
            {flavorLabels[d.key as keyof FlavorProfile]} {d.delta > 0 ? '+' : ''}
            {d.delta}
          </span>
        ))}
      </div>
      <div className="flex justify-center mt-3">
        <FlavorRadar
          flavors={currentProfile}
          size={180}
          compareWith={lastRecord.profile}
        />
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] text-center mt-2">
        实线为本次，虚线为上次
      </p>
    </div>
  )
})

// ==================== 主组件 ====================

export default function TasteTest({ allDishes }: TasteTestProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [tasteHistory, setTasteHistory] = useState<TasteTestRecord[]>(() =>
    loadTasteHistory()
  )
  const { state, setTasteProfile, favoriteSet, eatenSet, toggleFavorite, toggleEaten } = useApp()

  const profile: FlavorProfile | null = useMemo(() => {
    if (phase !== 'result') return null
    return calculateTasteProfile(answers, tasteQuestions)
  }, [phase, answers])

  const matchedDishes = useMemo(() => {
    if (!profile) return []
    return matchDishes(profile, allDishes, TOP_DISH_COUNT)
  }, [profile, allDishes])

  // 上次测试记录：结果页取 history[1]（history[0] 是本次刚保存的）
  const lastRecord = useMemo(() => {
    if (phase === 'result') {
      return tasteHistory.length >= 2 ? tasteHistory[1] : null
    }
    // intro 阶段取最近一次
    return tasteHistory[0] ?? null
  }, [phase, tasteHistory])

  const handleAnswer = useCallback(
    (optionIdx: number) => {
      const question = tasteQuestions[currentQ]
      const newAnswers = { ...answers, [question.id]: optionIdx }
      setAnswers(newAnswers)

      if (currentQ < tasteQuestions.length - 1) {
        setCurrentQ((prev) => prev + 1)
      } else {
        // 计算结果
        const result = calculateTasteProfile(newAnswers, tasteQuestions)
        setTasteProfile(result)
        // 保存到历史
        const topDishIds = matchDishes(result, allDishes, TOP_DISH_COUNT).map(
          ({ dish }) => dish.id
        )
        const record: TasteTestRecord = {
          timestamp: Date.now(),
          profile: result,
          topDishIds,
        }
        const updated = addTasteTestRecord(record)
        setTasteHistory(updated)
        setPhase('result')
      }
    },
    [currentQ, answers, setTasteProfile, allDishes]
  )

  const handleRestart = useCallback(() => {
    setPhase('intro')
    setCurrentQ(0)
    setAnswers({})
  }, [])

  const handleCloseDetail = useCallback(() => setSelectedDish(null), [])

  const handleShare = useCallback(() => {
    if (!profile) return
    shareTasteResult(profile, matchedDishes)
  }, [profile, matchedDishes])

  // ===== 介绍页 =====
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">🧬</div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
          口味 DNA 测试
        </h2>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-6 leading-relaxed">
          回答 {tasteQuestions.length} 道场景选择题，
          <br />
          我们将为你生成专属的口味图谱，
          <br />
          并推荐最匹配你的中国美食。
        </p>
        <button
          onClick={() => setPhase('quiz')}
          className="px-8 py-3 min-h-[44px] bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white rounded-full text-base font-medium hover:bg-[var(--color-primary-hover)] dark:hover:bg-[var(--color-dark-primary-hover)] transition-colors cursor-pointer"
        >
          开始测试
        </button>
        {state.tasteProfile && (
          <div className="mt-8 p-4 bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
            <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-2">
              你上次的口味图谱：
            </p>
            <div className="flex justify-center">
              <FlavorRadar flavors={state.tasteProfile} size={160} />
            </div>
            <p className="text-sm font-medium text-[var(--color-primary)] dark:text-[var(--color-dark-primary)] mt-2">
              {describeTasteProfile(state.tasteProfile)}
            </p>
          </div>
        )}
      </div>
    )
  }

  // ===== 答题页 =====
  if (phase === 'quiz') {
    const question = tasteQuestions[currentQ]

    return (
      <div className="max-w-xl mx-auto py-8">
        <QuestionCard
          question={question}
          questionIndex={currentQ}
          totalQuestions={tasteQuestions.length}
          selectedAnswer={answers[question.id]}
          onAnswer={handleAnswer}
        />
      </div>
    )
  }

  // ===== 结果页 =====
  if (!profile) return null

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
      {/* 结果标题 */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🧬</div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-1">
          你的口味 DNA
        </h2>
        <p className="text-lg text-[var(--color-primary)] dark:text-[var(--color-dark-primary)] font-medium">
          {describeTasteProfile(profile)}
        </p>
      </div>

      {/* 雷达图 */}
      <div className="flex justify-center mb-8">
        <FlavorRadar flavors={profile} size={280} />
      </div>

      {/* 上次测试对比 */}
      {lastRecord && (
        <div className="mb-8">
          <LastTestComparison
            currentProfile={profile}
            lastRecord={lastRecord}
          />
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={handleRestart}
          className="px-5 py-2 min-h-[44px] bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] rounded-full text-sm hover:border-[var(--color-primary)] dark:hover:border-[var(--color-dark-primary)] cursor-pointer"
        >
          重新测试
        </button>
        <button
          onClick={handleShare}
          className="px-5 py-2 min-h-[44px] bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-primary-hover)] dark:hover:bg-[var(--color-dark-primary-hover)] transition-colors cursor-pointer"
        >
          分享我的口味DNA
        </button>
      </div>

      {/* 匹配推荐 */}
      <div>
        <h3 className="text-lg font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-4">
          🎯 最匹配的 {TOP_DISH_COUNT} 道美食
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {matchedDishes.map(({ dish, score }) => (
            <div key={dish.id} className="relative">
              <div className="absolute top-2 right-2 z-10 bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white text-xs px-2 py-0.5 rounded-full">
                匹配 {score}%
              </div>
              <DishCard
                dish={dish}
                isFavorite={favoriteSet.has(dish.id)}
                isEaten={eatenSet.has(dish.id)}
                onToggleFavorite={() => toggleFavorite(dish.id)}
                onToggleEaten={() => toggleEaten(dish.id)}
                onClick={() => setSelectedDish(dish)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 详情模态 */}
      {selectedDish && (
        <DishDetailModal dish={selectedDish} onClose={handleCloseDetail} />
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { callAIAgent, type NormalizedAgentResponse } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  FiLoader, FiShield, FiTrendingUp, FiAward, FiTarget,
  FiCheckCircle, FiCircle, FiAlertTriangle, FiX,
  FiZap, FiDollarSign, FiLock, FiTrendingDown,
  FiDownload, FiChevronRight, FiChevronLeft, FiInfo,
  FiDroplet, FiCrosshair
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

// AGENT IDs
const AGENTS = {
  COMMANDER: '6985a453301c62c7ca2c7de1',
  FINANCIAL_ANALYST: '6985a3ede17e33c11eed1b5a',
  COACH: '6985a405e17e33c11eed1b5d',
  EDUCATOR: '6985a41bb37fff3a03c07c72',
  ADVISOR: '6985a434e2c0086a4fc43bd5',
}

// TypeScript Interfaces from Test Response Data
interface FinancialAnalystResponse {
  health_score: number
  ratio_analysis: {
    income_to_expense: string
    savings_rate: string
    debt_to_income: string
  }
  risk_flags: string[]
  opportunity_alerts: string[]
  recommendations: string[]
}

interface CoachResponse {
  message_type: string
  primary_message: string
  behavioral_insight: string
  suggested_action: string
  motivation_level: string
}

interface EducatorResponse {
  lesson_type: string
  title: string
  simple_explanation: string
  detailed_explanation: string
  key_takeaways: string[]
  related_concepts: string[]
  literacy_level: string
}

interface AdvisorResponse {
  advice_type: string
  primary_recommendation: string
  clarifying_questions: string[]
  personalized_suggestions: {
    recommended_amount?: string
    rationale?: string
    alternatives?: string[]
  }
  risk_assessment: string
  next_steps: string[]
}

interface CommanderResponse {
  current_screen: string
  financial_analysis: {
    health_score: number
    surplus: string
    insights: string
  }
  handoff_to: string
  next_screen_suggestion: string
  user_profile_update: {
    risk_tolerance: string
    emotional_state: string
    literacy_level: string
  }
  power_level_update: number
  message: string
}

interface UserData {
  income: number
  fixedBills: number
  pluggedLeaks: {
    dining: boolean
    subscriptions: boolean
    impulseBuys: boolean
  }
  termInsurance: boolean
  healthInsurance: boolean
  emergencyFundMonths: number
  sipAmount: number
  sipYears: number
  financialGoal: string
  quizAnswers: {
    q1: string
    q2: string
    q3: string
  }
  riskProfile: string
}

interface AppState {
  currentScreen: number
  powerLevel: number
  userData: UserData
  sessionId: string
}

// Jargon Buster Tooltip Component
function JargonTooltip({ term, definition }: { term: string; definition: string }) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="inline-flex items-center gap-1 underline decoration-dotted decoration-emerald-500/50 hover:decoration-emerald-500 text-emerald-400 transition-colors">
            {term}
            <FiInfo className="w-3 h-3 opacity-70" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="max-w-xs bg-slate-900 border-2 border-emerald-500/50 rounded-lg p-4 text-sm text-slate-200 shadow-2xl shadow-emerald-500/20 z-50"
            sideOffset={5}
          >
            <div className="space-y-2">
              <div className="font-bold text-emerald-400">{term}</div>
              <div className="leading-relaxed">{definition}</div>
            </div>
            <Tooltip.Arrow className="fill-emerald-500/50" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default function Home() {
  // Core App State
  const [currentScreen, setCurrentScreen] = useState(0) // 0 = landing, 1-5 = screens
  const [powerLevel, setPowerLevel] = useState(0)
  const [sessionId] = useState(() => `session_${Date.now()}`)

  // User Financial Data
  const [userData, setUserData] = useState<UserData>({
    income: 0,
    fixedBills: 0,
    pluggedLeaks: { dining: false, subscriptions: false, impulseBuys: false },
    termInsurance: true,
    healthInsurance: true,
    emergencyFundMonths: 6,
    sipAmount: 5000,
    sipYears: 10,
    financialGoal: '',
    quizAnswers: { q1: '', q2: '', q3: '' },
    riskProfile: '',
  })

  // Agent Responses
  const [agentMessages, setAgentMessages] = useState<Array<{
    agent: string
    message: string
    type: string
    timestamp: number
  }>>([])
  const [modalContent, setModalContent] = useState<{
    title: string
    content: string
    type: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showRightPanel, setShowRightPanel] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moneyCommanderState')
    if (saved) {
      const state: AppState = JSON.parse(saved)
      setCurrentScreen(state.currentScreen)
      setPowerLevel(state.powerLevel)
      setUserData(state.userData)
    }
  }, [])

  // Save to localStorage on changes
  useEffect(() => {
    const state: AppState = {
      currentScreen,
      powerLevel,
      userData,
      sessionId,
    }
    localStorage.setItem('moneyCommanderState', JSON.stringify(state))
  }, [currentScreen, powerLevel, userData, sessionId])

  // Agent Integration Functions
  const callFinancialAnalyst = async (message: string) => {
    setLoading(true)
    const result = await callAIAgent(message, AGENTS.FINANCIAL_ANALYST, { session_id: sessionId })
    setLoading(false)

    if (result.success && result.response.status === 'success') {
      const data = result.response.result as FinancialAnalystResponse
      setAgentMessages(prev => [...prev, {
        agent: 'Financial Analyst',
        message: data.recommendations[0] || 'Analysis complete',
        type: 'analysis',
        timestamp: Date.now()
      }])
    }
  }

  const callCoach = async (message: string) => {
    setLoading(true)
    const result = await callAIAgent(message, AGENTS.COACH, { session_id: sessionId })
    setLoading(false)

    if (result.success && result.response.status === 'success') {
      const data = result.response.result as CoachResponse
      setAgentMessages(prev => [...prev, {
        agent: 'Coach',
        message: data.primary_message,
        type: 'encouragement',
        timestamp: Date.now()
      }])
    }
  }

  const callEducator = async (message: string) => {
    setLoading(true)
    const result = await callAIAgent(message, AGENTS.EDUCATOR, { session_id: sessionId })
    setLoading(false)

    if (result.success && result.response.status === 'success') {
      const data = result.response.result as EducatorResponse
      setModalContent({
        title: data.title,
        content: data.simple_explanation,
        type: 'education'
      })
    }
  }

  const callAdvisor = async (message: string) => {
    setLoading(true)
    const result = await callAIAgent(message, AGENTS.ADVISOR, { session_id: sessionId })
    setLoading(false)

    if (result.success && result.response.status === 'success') {
      const data = result.response.result as AdvisorResponse
      setModalContent({
        title: 'Personal Advice',
        content: data.primary_recommendation,
        type: 'advice'
      })
    }
  }

  const callCommander = async (message: string) => {
    setLoading(true)
    const result = await callAIAgent(message, AGENTS.COMMANDER, { session_id: sessionId })
    setLoading(false)

    if (result.success && result.response.status === 'success') {
      const data = result.response.result as CommanderResponse
      setPowerLevel(prev => prev + data.power_level_update)
      setAgentMessages(prev => [...prev, {
        agent: 'Commander',
        message: data.message,
        type: 'orchestration',
        timestamp: Date.now()
      }])
    }
  }

  // Screen Navigation
  const goToNextScreen = async () => {
    if (currentScreen < 5) {
      // Call Commander for orchestration
      const message = `User completed screen ${currentScreen}. Financial data: ${JSON.stringify(userData)}`
      await callCommander(message)

      // Update power level based on screen
      const powerGain = currentScreen === 1 ? 20 : currentScreen === 2 ? 30 : currentScreen === 3 ? 20 : 15
      setPowerLevel(prev => Math.min(100, prev + powerGain))

      setCurrentScreen(prev => prev + 1)
    }
  }

  const goToPrevScreen = () => {
    if (currentScreen > 1) {
      setCurrentScreen(prev => prev - 1)
    }
  }

  const startJourney = () => {
    setCurrentScreen(1)
    callEducator('User just started their financial journey on Screen 1 (The Intel)')
  }

  // Calculate surplus for Screen 1
  const calculateSurplus = () => {
    const leaksSaved =
      (userData.pluggedLeaks.dining ? 5000 : 0) +
      (userData.pluggedLeaks.subscriptions ? 3000 : 0) +
      (userData.pluggedLeaks.impulseBuys ? 4000 : 0)
    return userData.income - userData.fixedBills + leaksSaved
  }

  // Calculate SIP future value
  const calculateSIPValue = () => {
    const monthlyRate = 0.12 / 12 // Assuming 12% annual return
    const months = userData.sipYears * 12
    const fv = userData.sipAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))
    return Math.round(fv)
  }

  // Download PDF Certificate
  const downloadCertificate = () => {
    const certificate = `
MONEY COMMANDER - FINANCIAL BATTLE PLAN
========================================

Power Level: ${powerLevel}/100

FINANCIAL INTEL:
- Monthly Income: ₹${userData.income.toLocaleString()}
- Investment Surplus: ₹${calculateSurplus().toLocaleString()}

THE SHIELD:
- Term Insurance: ${userData.termInsurance ? 'Protected' : 'Unprotected'}
- Health Insurance: ${userData.healthInsurance ? 'Protected' : 'Unprotected'}
- Emergency Fund: ${userData.emergencyFundMonths} months

THE DEPLOYMENT:
- Monthly SIP: ₹${userData.sipAmount.toLocaleString()}
- Time Horizon: ${userData.sipYears} years
- Projected Value: ₹${calculateSIPValue().toLocaleString()}

RISK PROFILE: ${userData.riskProfile}

NEXT 3 STEPS:
1. Set up automatic SIP transfers
2. Review insurance coverage annually
3. Monitor and rebalance portfolio quarterly

Generated: ${new Date().toLocaleDateString()}
    `.trim()

    const blob = new Blob([certificate], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'MoneyCommander-BattlePlan.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Trigger confetti when power level hits 100
  useEffect(() => {
    if (powerLevel >= 100) {
      console.log('CONFETTI!')
    }
  }, [powerLevel])

  // Screen validation
  const isScreen1Complete = userData.income > 0 && userData.fixedBills > 0
  const isScreen2Complete = true // Always can proceed
  const isScreen3Complete = userData.sipAmount > 0
  const isScreen4Complete = userData.quizAnswers.q1 && userData.quizAnswers.q2 && userData.quizAnswers.q3

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#0A1425] to-[#0F172A] text-[#F8FAFC]">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Subtle Particle Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-emerald-500/30 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-emerald-500/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* LANDING SCREEN */}
      {currentScreen === 0 && (
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl w-full text-center space-y-8"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <FiZap className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
              <h1 className="text-6xl font-bold text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                MONEY COMMANDER
              </h1>
            </div>

            <p className="text-2xl text-slate-300 leading-relaxed">
              Your clear, confident path to financial freedom
            </p>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              In just 5 simple steps, build a personalized financial battle plan.
              No jargon. No pressure. Just clarity and action.
            </p>

            <div className="pt-8">
              <Button
                onClick={startJourney}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 text-xl rounded-xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all duration-300 transform hover:scale-105"
              >
                Begin Your Journey
                <FiChevronRight className="ml-3 w-6 h-6" />
              </Button>
            </div>

            <div className="pt-12 text-sm text-slate-500">
              Takes about 5-10 minutes. Progress auto-saved.
            </div>
          </motion.div>
        </div>
      )}

      {/* MAIN APP LAYOUT (Screens 1-5) */}
      {currentScreen > 0 && (
        <div className="relative flex min-h-screen">
          {/* Left Sidebar - Power Level & Progress */}
          <div className="hidden lg:block w-80 border-r border-emerald-500/20 bg-slate-950/50 backdrop-blur-sm p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <FiZap className="w-7 h-7" />
                MONEY COMMANDER
              </h1>
              <p className="text-slate-400 text-sm">Financial Mission Control</p>
            </div>

            {/* Power Level */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-300">POWER LEVEL</span>
                <span className="text-2xl font-bold text-emerald-400">{powerLevel}/100</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${powerLevel}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              {powerLevel > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-400 mt-2 text-center"
                >
                  Nice progress!
                </motion.p>
              )}
            </div>

            {/* Step Progress */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Your Journey</div>
              {[
                { num: 1, title: 'The Intel', desc: 'Income & Leaks' },
                { num: 2, title: 'The Shield', desc: 'Protection First' },
                { num: 3, title: 'The Deployment', desc: 'SIP Strategy' },
                { num: 4, title: 'The Recon', desc: 'Risk Assessment' },
                { num: 5, title: 'Battle Plan', desc: 'Your Summary' },
              ].map((screen) => (
                <div
                  key={screen.num}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    currentScreen === screen.num
                      ? 'bg-emerald-500/10 border-l-4 border-emerald-500'
                      : currentScreen > screen.num
                      ? 'bg-slate-800/30 opacity-70'
                      : 'bg-slate-800/10 opacity-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    currentScreen > screen.num
                      ? 'bg-emerald-500 text-white'
                      : currentScreen === screen.num
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {currentScreen > screen.num ? <FiCheckCircle className="w-5 h-5" /> : screen.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{screen.title}</div>
                    <div className="text-xs text-slate-400 truncate">{screen.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Central Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
              {/* Mobile Step Indicator */}
              <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentScreen === step
                        ? 'bg-emerald-500 w-8'
                        : currentScreen > step
                        ? 'bg-emerald-700'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {/* SCREEN 1: The Intel */}
                  {currentScreen === 1 && (
                    <div className="space-y-8">
                      <div className="mb-8">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4 flex items-center gap-3">
                          <FiDollarSign className="w-10 h-10 lg:w-12 lg:h-12 text-emerald-400" />
                          The Intel
                        </h2>
                        <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed">
                          Let's start with your income — it's quick and easy.
                        </p>
                      </div>

                      {/* Income Input */}
                      <Card className={`border-2 transition-all duration-300 ${
                        userData.income > 0
                          ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'border-slate-700 bg-slate-900/50'
                      }`}>
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-xl flex items-center gap-2">
                            Monthly Income
                            {userData.income > 0 && <FiCheckCircle className="w-5 h-5 text-emerald-500" />}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl text-slate-300">₹</span>
                            <Input
                              type="number"
                              value={userData.income || ''}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                setUserData(prev => ({ ...prev, income: val }))
                                if (val > 0) {
                                  callFinancialAnalyst(`User entered monthly income of ₹${val}`)
                                }
                              }}
                              className={`text-2xl h-16 bg-slate-800 transition-all duration-300 ${
                                userData.income > 0
                                  ? 'border-emerald-500 focus:border-emerald-400 focus:ring-emerald-500/20'
                                  : 'border-emerald-500/30 focus:border-emerald-500'
                              }`}
                              placeholder="80000"
                            />
                          </div>
                          <p className="text-sm text-slate-400 mt-3">Enter your total monthly take-home salary</p>
                        </CardContent>
                      </Card>

                      {/* Fixed Bills */}
                      <Card className={`border-2 transition-all duration-300 ${
                        userData.fixedBills > 0
                          ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'border-slate-700 bg-slate-900/50'
                      }`}>
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-xl flex items-center gap-2">
                            Fixed Monthly Bills
                            {userData.fixedBills > 0 && <FiCheckCircle className="w-5 h-5 text-emerald-500" />}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl text-slate-300">₹</span>
                            <Input
                              type="number"
                              value={userData.fixedBills || ''}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                setUserData(prev => ({ ...prev, fixedBills: val }))
                              }}
                              className={`text-2xl h-16 bg-slate-800 transition-all duration-300 ${
                                userData.fixedBills > 0
                                  ? 'border-emerald-500 focus:border-emerald-400 focus:ring-emerald-500/20'
                                  : 'border-emerald-500/30 focus:border-emerald-500'
                              }`}
                              placeholder="45000"
                            />
                          </div>
                          <p className="text-sm text-slate-400 mt-3">Rent, loan EMIs, utilities, subscriptions</p>
                        </CardContent>
                      </Card>

                      {/* Leaky Bucket */}
                      <Card className="border-2 border-amber-500/30 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-amber-400 text-xl flex items-center gap-2">
                            <FiDroplet className="w-6 h-6" />
                            Plug These Money Leaks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-300 mb-4">Click to recover money you might be leaking each month</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { key: 'dining' as const, label: 'Dining Out', save: 5000 },
                              { key: 'subscriptions' as const, label: 'Unused Subscriptions', save: 3000 },
                              { key: 'impulseBuys' as const, label: 'Impulse Buys', save: 4000 },
                            ].map((leak) => (
                              <Button
                                key={leak.key}
                                variant={userData.pluggedLeaks[leak.key] ? 'default' : 'outline'}
                                className={`h-24 flex flex-col gap-2 transition-all duration-300 ${
                                  userData.pluggedLeaks[leak.key]
                                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-emerald-400'
                                    : 'border-amber-500/50 hover:border-emerald-500 hover:bg-emerald-500/10'
                                }`}
                                onClick={() => {
                                  setUserData(prev => ({
                                    ...prev,
                                    pluggedLeaks: {
                                      ...prev.pluggedLeaks,
                                      [leak.key]: !prev.pluggedLeaks[leak.key]
                                    }
                                  }))
                                  if (!userData.pluggedLeaks[leak.key]) {
                                    callFinancialAnalyst(`User plugged ${leak.label} leak, saving ₹${leak.save}`)
                                  }
                                }}
                              >
                                {userData.pluggedLeaks[leak.key] && <FiCheckCircle className="w-5 h-5" />}
                                <span className="font-semibold">{leak.label}</span>
                                <span className="text-xs">Save ₹{leak.save.toLocaleString()}/mo</span>
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Surplus Display */}
                      {userData.income > 0 && userData.fixedBills > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-transparent shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <CardContent className="p-8">
                              <div className="text-center">
                                <div className="text-sm text-emerald-400 mb-3 uppercase tracking-wide">Investment Ammo (Monthly Surplus)</div>
                                <div className="text-5xl lg:text-6xl font-bold text-emerald-400 mb-2">
                                  ₹{calculateSurplus().toLocaleString()}
                                </div>
                                <p className="text-slate-300 text-lg">This is money you can grow each month</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Next Button */}
                      <div className="flex justify-end pt-4">
                        <Button
                          size="lg"
                          disabled={!isScreen1Complete}
                          onClick={goToNextScreen}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          Continue to Protection
                          <FiChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 2: The Shield */}
                  {currentScreen === 2 && (
                    <div className="space-y-8">
                      <div className="mb-8">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4 flex items-center gap-3">
                          <FiShield className="w-10 h-10 lg:w-12 lg:h-12 text-emerald-400" />
                          The Shield
                        </h2>
                        <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed">
                          You're doing great — next we protect your progress.
                        </p>
                      </div>

                      {/* Insurance Info */}
                      <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
                        <CardContent className="p-6">
                          <p className="text-lg text-slate-300 leading-relaxed">
                            First things first: protect before you grow. <JargonTooltip term="Insurance" definition="Financial protection against unexpected life events like illness or accidents. Prevents your savings from being wiped out." /> keeps your financial plan safe from unexpected events.
                          </p>
                        </CardContent>
                      </Card>

                      {/* Insurance Toggles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className={`border-2 transition-all duration-300 ${
                          userData.termInsurance
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : 'border-amber-500 bg-amber-500/10'
                        }`}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                              <FiShield className="w-6 h-6" />
                              <JargonTooltip term="Term Life Insurance" definition="Affordable insurance that protects your family financially if something happens to you. Costs less than ₹500/month for most people." />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button
                              variant={userData.termInsurance ? 'default' : 'destructive'}
                              className="w-full h-14 text-lg transition-all duration-300"
                              onClick={() => {
                                if (userData.termInsurance) {
                                  setModalContent({
                                    title: 'Consider Keeping Term Insurance',
                                    content: 'Term insurance protects your family in case of an emergency. It's one of the most important steps in financial planning. You can continue anyway, but we recommend keeping it.',
                                    type: 'warning'
                                  })
                                }
                                setUserData(prev => ({ ...prev, termInsurance: !prev.termInsurance }))
                                callAdvisor(`User ${userData.termInsurance ? 'disabled' : 'enabled'} term insurance`)
                              }}
                            >
                              {userData.termInsurance ? (
                                <>
                                  <FiCheckCircle className="w-5 h-5 mr-2" />
                                  Protected
                                </>
                              ) : (
                                'Not Protected'
                              )}
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className={`border-2 transition-all duration-300 ${
                          userData.healthInsurance
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : 'border-amber-500 bg-amber-500/10'
                        }`}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                              <FiLock className="w-6 h-6" />
                              <JargonTooltip term="Health Insurance" definition="Coverage for medical bills and hospital expenses. Even one surgery without insurance can wipe out years of savings." />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button
                              variant={userData.healthInsurance ? 'default' : 'destructive'}
                              className="w-full h-14 text-lg transition-all duration-300"
                              onClick={() => {
                                if (userData.healthInsurance) {
                                  setModalContent({
                                    title: 'Health Insurance is Essential',
                                    content: 'Health insurance protects you from medical emergencies that could derail your entire financial plan. Medical costs are rising fast. We strongly recommend keeping this protection.',
                                    type: 'warning'
                                  })
                                }
                                setUserData(prev => ({ ...prev, healthInsurance: !prev.healthInsurance }))
                                callCoach(`User ${userData.healthInsurance ? 'disabled' : 'enabled'} health insurance`)
                              }}
                            >
                              {userData.healthInsurance ? (
                                <>
                                  <FiCheckCircle className="w-5 h-5 mr-2" />
                                  Protected
                                </>
                              ) : (
                                'Not Protected'
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Emergency Fund Slider */}
                      <Card className="border-2 border-slate-700 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-xl">
                            <JargonTooltip term="Emergency Fund" definition="Money set aside for unexpected events (job loss, medical emergencies, urgent repairs). Financial experts recommend 6-12 months of expenses." />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300 text-lg">Months of Coverage</span>
                              <span className="text-4xl font-bold text-emerald-400">{userData.emergencyFundMonths}</span>
                            </div>
                            <Slider
                              value={[userData.emergencyFundMonths]}
                              onValueChange={([val]) => setUserData(prev => ({ ...prev, emergencyFundMonths: val }))}
                              min={0}
                              max={12}
                              step={1}
                              className="py-4"
                            />
                            <div className="flex justify-between text-sm text-slate-400">
                              <span>0 months</span>
                              <span>12 months</span>
                            </div>
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                              <div className="text-sm text-slate-400 mb-1">Amount needed:</div>
                              <div className="text-2xl font-bold text-emerald-400">
                                ₹{(userData.fixedBills * userData.emergencyFundMonths).toLocaleString()}
                              </div>
                            </div>
                            {userData.emergencyFundMonths >= 6 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-emerald-400 text-center"
                              >
                                Great choice! 6+ months is recommended.
                              </motion.div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Navigation */}
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={goToPrevScreen} className="px-6 py-6 text-lg">
                          <FiChevronLeft className="mr-2 w-5 h-5" />
                          Back
                        </Button>
                        <Button
                          size="lg"
                          onClick={goToNextScreen}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg transition-all duration-300"
                        >
                          Continue to Investing
                          <FiChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 3: The Deployment */}
                  {currentScreen === 3 && (
                    <div className="space-y-8">
                      <div className="mb-8">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4 flex items-center gap-3">
                          <FiTrendingUp className="w-10 h-10 lg:w-12 lg:h-12 text-emerald-400" />
                          The Deployment
                        </h2>
                        <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed">
                          Now let's grow your wealth systematically.
                        </p>
                      </div>

                      {/* Financial Goal */}
                      <Card className="border-2 border-slate-700 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-xl flex items-center gap-2">
                            <FiTarget className="w-6 h-6" />
                            What's Your Financial Goal?
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Input
                            value={userData.financialGoal}
                            onChange={(e) => setUserData(prev => ({ ...prev, financialGoal: e.target.value }))}
                            placeholder="e.g., Retirement fund, Home down payment, Child's education"
                            className="bg-slate-800 border-emerald-500/30 focus:border-emerald-500 h-14 text-lg"
                            onFocus={() => callAdvisor(`User is setting financial goal. Monthly surplus: ₹${calculateSurplus()}`)}
                          />
                          <p className="text-sm text-slate-400 mt-3">Having a clear goal makes investing more meaningful</p>
                        </CardContent>
                      </Card>

                      {/* SIP Info */}
                      <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
                        <CardContent className="p-6">
                          <p className="text-lg text-slate-300 leading-relaxed">
                            A <JargonTooltip term="SIP" definition="Systematic Investment Plan - automatic monthly investments into mutual funds. Like a recurring deposit but with higher potential returns. Start with as little as ₹500/month." /> helps you invest consistently without thinking about market timing.
                          </p>
                        </CardContent>
                      </Card>

                      {/* SIP Amount Slider */}
                      <Card className="border-2 border-slate-700 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-xl">Monthly Investment Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300 text-lg">Investment per month</span>
                              <span className="text-4xl font-bold text-emerald-400">₹{userData.sipAmount.toLocaleString()}</span>
                            </div>
                            <Slider
                              value={[userData.sipAmount]}
                              onValueChange={([val]) => {
                                setUserData(prev => ({ ...prev, sipAmount: val }))
                                callFinancialAnalyst(`User set SIP amount to ₹${val}`)
                              }}
                              min={1000}
                              max={Math.min(100000, calculateSurplus())}
                              step={500}
                              className="py-4"
                            />
                            <div className="flex justify-between text-sm text-slate-400">
                              <span>₹1,000</span>
                              <span>₹{Math.min(100000, calculateSurplus()).toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Years Slider */}
                      <Card className="border-2 border-slate-700 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-xl">Investment Time Horizon</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300 text-lg">Years</span>
                              <span className="text-4xl font-bold text-emerald-400">{userData.sipYears}</span>
                            </div>
                            <Slider
                              value={[userData.sipYears]}
                              onValueChange={([val]) => setUserData(prev => ({ ...prev, sipYears: val }))}
                              min={1}
                              max={30}
                              step={1}
                              className="py-4"
                            />
                            <div className="flex justify-between text-sm text-slate-400">
                              <span>1 year</span>
                              <span>30 years</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Growth Projection */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-transparent shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                          <CardHeader>
                            <CardTitle className="text-emerald-400 text-xl flex items-center gap-2">
                              <FiAward className="w-6 h-6" />
                              Projected Wealth
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center space-y-6">
                              <div>
                                <div className="text-sm text-slate-400 mb-2">After {userData.sipYears} years at ~12% annual return</div>
                                <div className="text-5xl lg:text-6xl font-bold text-emerald-400">
                                  ₹{calculateSIPValue().toLocaleString()}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div className="p-4 bg-slate-800/50 rounded-lg">
                                  <div className="text-sm text-slate-400 mb-1">Total You Invest</div>
                                  <div className="text-2xl font-bold text-white">
                                    ₹{(userData.sipAmount * userData.sipYears * 12).toLocaleString()}
                                  </div>
                                </div>
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                  <div className="text-sm text-slate-400 mb-1">
                                    <JargonTooltip term="Compounding" definition="Your money earning returns, and those returns earning more returns. Time is your biggest advantage here." /> Gains
                                  </div>
                                  <div className="text-2xl font-bold text-emerald-400">
                                    ₹{(calculateSIPValue() - userData.sipAmount * userData.sipYears * 12).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <p className="text-sm text-emerald-400 font-semibold">
                                  Time + consistency beats trying to time the market
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Navigation */}
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={goToPrevScreen} className="px-6 py-6 text-lg">
                          <FiChevronLeft className="mr-2 w-5 h-5" />
                          Back
                        </Button>
                        <Button
                          size="lg"
                          disabled={!isScreen3Complete}
                          onClick={goToNextScreen}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300"
                        >
                          Continue to Risk Assessment
                          <FiChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 4: The Recon */}
                  {currentScreen === 4 && (
                    <div className="space-y-8">
                      <div className="mb-8">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4 flex items-center gap-3">
                          <FiCrosshair className="w-10 h-10 lg:w-12 lg:h-12 text-emerald-400" />
                          The Recon
                        </h2>
                        <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed">
                          Almost done! Let's understand your comfort with risk.
                        </p>
                      </div>

                      {/* 3 Commandments */}
                      <Card className="border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent">
                        <CardHeader>
                          <CardTitle className="text-amber-400 text-xl">3 Golden Rules of Investing</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ol className="space-y-4 list-decimal list-inside text-lg">
                            <li className="leading-relaxed">Never invest money you can't afford to lose</li>
                            <li className="leading-relaxed">Don't chase losses — stick to your strategy</li>
                            <li className="leading-relaxed">
                              <JargonTooltip term="Diversification" definition="Spreading your money across different investments (stocks, bonds, gold, etc.) so you don't lose everything if one goes down." /> is your shield against <JargonTooltip term="volatility" definition="How much an investment's value goes up and down. Higher volatility means bigger swings — both gains and losses." />
                            </li>
                          </ol>
                        </CardContent>
                      </Card>

                      {/* Risk Quiz */}
                      <Card className="border-2 border-slate-700 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-xl">Quick Risk Tolerance Check</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                          {/* Question 1 */}
                          <div>
                            <p className="font-semibold text-lg mb-4">1. Your investment drops 20% in a month. You:</p>
                            <div className="space-y-3">
                              {[
                                { value: 'conservative', label: 'Sell everything immediately — too stressful' },
                                { value: 'moderate', label: 'Hold and monitor closely' },
                                { value: 'aggressive', label: 'Buy more at the lower price — it's a deal!' }
                              ].map(opt => (
                                <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                                  userData.quizAnswers.q1 === opt.value
                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                    : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'
                                }`}>
                                  <input
                                    type="radio"
                                    name="q1"
                                    value={opt.value}
                                    checked={userData.quizAnswers.q1 === opt.value}
                                    onChange={(e) => setUserData(prev => ({
                                      ...prev,
                                      quizAnswers: { ...prev.quizAnswers, q1: e.target.value }
                                    }))}
                                    className="w-5 h-5 accent-emerald-500"
                                  />
                                  <span className="text-lg">{opt.label}</span>
                                  {userData.quizAnswers.q1 === opt.value && <FiCheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Question 2 */}
                          <div>
                            <p className="font-semibold text-lg mb-4">2. How much of your surplus would you allocate to higher-risk investments?</p>
                            <div className="space-y-3">
                              {[
                                { value: 'conservative', label: '0-10% — I prefer safety' },
                                { value: 'moderate', label: '10-30% — Balanced approach' },
                                { value: 'aggressive', label: '30%+ — I'm comfortable with risk' }
                              ].map(opt => (
                                <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                                  userData.quizAnswers.q2 === opt.value
                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                    : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'
                                }`}>
                                  <input
                                    type="radio"
                                    name="q2"
                                    value={opt.value}
                                    checked={userData.quizAnswers.q2 === opt.value}
                                    onChange={(e) => setUserData(prev => ({
                                      ...prev,
                                      quizAnswers: { ...prev.quizAnswers, q2: e.target.value }
                                    }))}
                                    className="w-5 h-5 accent-emerald-500"
                                  />
                                  <span className="text-lg">{opt.label}</span>
                                  {userData.quizAnswers.q2 === opt.value && <FiCheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Question 3 */}
                          <div>
                            <p className="font-semibold text-lg mb-4">3. Your investment time horizon is:</p>
                            <div className="space-y-3">
                              {[
                                { value: 'conservative', label: 'Less than 3 years — need money soon' },
                                { value: 'moderate', label: '3-10 years — medium-term goals' },
                                { value: 'aggressive', label: '10+ years — long-term wealth building' }
                              ].map(opt => (
                                <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                                  userData.quizAnswers.q3 === opt.value
                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                    : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'
                                }`}>
                                  <input
                                    type="radio"
                                    name="q3"
                                    value={opt.value}
                                    checked={userData.quizAnswers.q3 === opt.value}
                                    onChange={(e) => setUserData(prev => ({
                                      ...prev,
                                      quizAnswers: { ...prev.quizAnswers, q3: e.target.value }
                                    }))}
                                    className="w-5 h-5 accent-emerald-500"
                                  />
                                  <span className="text-lg">{opt.label}</span>
                                  {userData.quizAnswers.q3 === opt.value && <FiCheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                                </label>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Risk Profile Result */}
                      {isScreen4Complete && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-transparent shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <CardContent className="p-8 text-center">
                              <div className="text-sm text-emerald-400 mb-3 uppercase tracking-wide">Your Risk Profile</div>
                              <div className="text-4xl font-bold text-emerald-400 mb-4">
                                {(() => {
                                  const answers = Object.values(userData.quizAnswers)
                                  const aggressiveCount = answers.filter(a => a === 'aggressive').length
                                  const conservativeCount = answers.filter(a => a === 'conservative').length

                                  let profile = 'Moderate Investor'
                                  if (aggressiveCount >= 2) profile = 'Aggressive Investor'
                                  else if (conservativeCount >= 2) profile = 'Conservative Investor'

                                  setTimeout(() => {
                                    setUserData(prev => ({ ...prev, riskProfile: profile }))
                                    callAdvisor(`User completed risk quiz. Profile: ${profile}. Monthly surplus: ₹${calculateSurplus()}`)
                                  }, 0)

                                  return profile
                                })()}
                              </div>
                              <p className="text-lg text-slate-300">
                                This profile helps tailor investment recommendations to your comfort level
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Navigation */}
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={goToPrevScreen} className="px-6 py-6 text-lg">
                          <FiChevronLeft className="mr-2 w-5 h-5" />
                          Back
                        </Button>
                        <Button
                          size="lg"
                          disabled={!isScreen4Complete}
                          onClick={goToNextScreen}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300"
                        >
                          View Your Battle Plan
                          <FiChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 5: Final Battle Plan */}
                  {currentScreen === 5 && (
                    <div className="space-y-8">
                      <div className="mb-8">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4 flex items-center gap-3">
                          <FiAward className="w-10 h-10 lg:w-12 lg:h-12 text-emerald-400" />
                          Your Battle Plan
                        </h2>
                        <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed">
                          Congratulations! You've completed your financial battle plan.
                        </p>
                      </div>

                      {/* Confetti Animation */}
                      {powerLevel >= 100 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6 }}
                          className="text-center py-8 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-2xl border-2 border-emerald-500/50"
                        >
                          <div className="text-7xl mb-4">
                            <FiAward className="w-20 h-20 text-emerald-400 mx-auto animate-pulse" />
                          </div>
                          <div className="text-4xl font-bold text-emerald-400 mb-2">
                            POWER LEVEL: 100!
                          </div>
                          <div className="text-xl text-slate-300">You've mastered your financial future!</div>
                        </motion.div>
                      )}

                      {/* Summary Certificate */}
                      <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-transparent shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CardHeader>
                          <CardTitle className="text-2xl text-emerald-400 text-center">
                            FINANCIAL READINESS CERTIFICATE
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                          {/* Financial Intel */}
                          <div>
                            <h3 className="font-bold text-xl mb-4 text-emerald-400 flex items-center gap-2">
                              <FiDollarSign className="w-5 h-5" />
                              THE INTEL
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-4 bg-slate-800/50 rounded-lg">
                                <span className="text-sm text-slate-400">Monthly Income</span>
                                <div className="text-2xl font-bold">₹{userData.income.toLocaleString()}</div>
                              </div>
                              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <span className="text-sm text-slate-400">Investment Surplus</span>
                                <div className="text-2xl font-bold text-emerald-400">₹{calculateSurplus().toLocaleString()}</div>
                              </div>
                            </div>
                          </div>

                          {/* The Shield */}
                          <div>
                            <h3 className="font-bold text-xl mb-4 text-emerald-400 flex items-center gap-2">
                              <FiShield className="w-5 h-5" />
                              THE SHIELD
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="p-4 bg-slate-800/50 rounded-lg">
                                <span className="text-sm text-slate-400">Term Insurance</span>
                                <div className={`text-lg font-bold ${userData.termInsurance ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {userData.termInsurance ? (
                                    <span className="flex items-center gap-2"><FiCheckCircle /> Protected</span>
                                  ) : (
                                    'Unprotected'
                                  )}
                                </div>
                              </div>
                              <div className="p-4 bg-slate-800/50 rounded-lg">
                                <span className="text-sm text-slate-400">Health Insurance</span>
                                <div className={`text-lg font-bold ${userData.healthInsurance ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {userData.healthInsurance ? (
                                    <span className="flex items-center gap-2"><FiCheckCircle /> Protected</span>
                                  ) : (
                                    'Unprotected'
                                  )}
                                </div>
                              </div>
                              <div className="p-4 bg-slate-800/50 rounded-lg">
                                <span className="text-sm text-slate-400">Emergency Fund</span>
                                <div className="text-lg font-bold">{userData.emergencyFundMonths} months</div>
                              </div>
                            </div>
                          </div>

                          {/* The Deployment */}
                          <div>
                            <h3 className="font-bold text-xl mb-4 text-emerald-400 flex items-center gap-2">
                              <FiTrendingUp className="w-5 h-5" />
                              THE DEPLOYMENT
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="p-4 bg-slate-800/50 rounded-lg">
                                <span className="text-sm text-slate-400">Monthly SIP</span>
                                <div className="text-2xl font-bold">₹{userData.sipAmount.toLocaleString()}</div>
                              </div>
                              <div className="p-4 bg-slate-800/50 rounded-lg">
                                <span className="text-sm text-slate-400">Time Horizon</span>
                                <div className="text-2xl font-bold">{userData.sipYears} years</div>
                              </div>
                              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <span className="text-sm text-slate-400">Projected Value</span>
                                <div className="text-2xl font-bold text-emerald-400">₹{calculateSIPValue().toLocaleString()}</div>
                              </div>
                            </div>
                          </div>

                          {/* Risk Profile */}
                          <div>
                            <h3 className="font-bold text-xl mb-4 text-emerald-400 flex items-center gap-2">
                              <FiCrosshair className="w-5 h-5" />
                              RISK PROFILE
                            </h3>
                            <div className="p-6 bg-gradient-to-br from-emerald-500/20 to-transparent border-2 border-emerald-500/30 rounded-lg text-center">
                              <div className="text-3xl font-bold">{userData.riskProfile || 'Moderate Investor'}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Next 3 Steps */}
                      <Card className="border-2 border-slate-700 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-xl">Your Next 3 Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ol className="space-y-4">
                            <li className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                              <FiCheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                              <div>
                                <div className="font-semibold text-lg mb-1">Set up automatic SIP transfers</div>
                                <div className="text-sm text-slate-400">Open a mutual fund account and automate your monthly investments</div>
                              </div>
                            </li>
                            <li className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                              <FiCheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                              <div>
                                <div className="font-semibold text-lg mb-1">Review insurance coverage annually</div>
                                <div className="text-sm text-slate-400">Ensure your protection keeps pace with your income growth</div>
                              </div>
                            </li>
                            <li className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                              <FiCheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                              <div>
                                <div className="font-semibold text-lg mb-1">Track and rebalance quarterly</div>
                                <div className="text-sm text-slate-400">Monitor your portfolio and adjust based on goals and market conditions</div>
                              </div>
                            </li>
                          </ol>
                        </CardContent>
                      </Card>

                      {/* Download Button */}
                      <div className="text-center pt-4">
                        <Button
                          size="lg"
                          onClick={downloadCertificate}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 text-lg rounded-xl shadow-lg transition-all duration-300"
                        >
                          <FiDownload className="mr-2 w-5 h-5" />
                          Download Your Battle Plan
                        </Button>
                      </div>

                      {/* Navigation */}
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={goToPrevScreen} className="px-6 py-6 text-lg">
                          <FiChevronLeft className="mr-2 w-5 h-5" />
                          Back
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (confirm('Start a new mission? This will reset all progress.')) {
                              localStorage.removeItem('moneyCommanderState')
                              window.location.reload()
                            }
                          }}
                          className="px-6 py-6 text-lg"
                        >
                          Start New Mission
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel - Agent Messages */}
          {showRightPanel && currentScreen > 0 && (
            <div className="hidden xl:block w-96 border-l border-emerald-500/20 bg-slate-950/50 backdrop-blur-sm p-6 overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-emerald-400">Agent Intel</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRightPanel(false)}
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>

              {loading && (
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg mb-3">
                  <FiLoader className="w-5 h-5 animate-spin text-emerald-400" />
                  <span className="text-sm text-slate-300">Agent analyzing...</span>
                </div>
              )}

              <div className="space-y-3">
                {agentMessages.slice(-5).reverse().map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-2 border-slate-700 bg-slate-900/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-emerald-400">{msg.agent}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300 leading-relaxed">{msg.message}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {agentMessages.length === 0 && !loading && (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Agent insights will appear here as you progress through your journey.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Toggle Right Panel Button (when hidden) */}
          {!showRightPanel && currentScreen > 0 && (
            <Button
              className="fixed right-4 top-4 z-50 hidden xl:block"
              onClick={() => setShowRightPanel(true)}
            >
              Agent Intel
            </Button>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-lg w-full"
          >
            <Card className={`border-2 ${
              modalContent.type === 'warning'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-emerald-500 bg-emerald-500/10'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-xl ${modalContent.type === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {modalContent.type === 'warning' && <FiAlertTriangle className="w-6 h-6 inline mr-2" />}
                    {modalContent.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setModalContent(null)}
                  >
                    <FiX className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-6 leading-relaxed text-lg">{modalContent.content}</p>
                <Button
                  className="w-full py-6 text-lg"
                  onClick={() => setModalContent(null)}
                >
                  Got it
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}

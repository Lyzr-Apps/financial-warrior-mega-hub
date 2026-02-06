'use client'

import { useState, useEffect } from 'react'
import { callAIAgent, type NormalizedAgentResponse } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Loader2, Shield, TrendingUp, Award, Target,
  CheckCircle2, Circle, AlertTriangle, Sword,
  Download, ChevronRight, ChevronLeft, X,
  Zap, DollarSign, Lock, TrendingDown
} from 'lucide-react'
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

export default function Home() {
  // Core App State
  const [currentScreen, setCurrentScreen] = useState(1)
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
      // Confetti animation would trigger here
      console.log('CONFETTI!')
    }
  }, [powerLevel])

  // Screen validation
  const isScreen1Complete = userData.income > 0 && userData.fixedBills > 0
  const isScreen2Complete = true // Always can proceed
  const isScreen3Complete = userData.sipAmount > 0
  const isScreen4Complete = userData.quizAnswers.q1 && userData.quizAnswers.q2 && userData.quizAnswers.q3

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Layout */}
      <div className="relative flex h-screen">
        {/* Left Sidebar - Power Level & Progress */}
        <div className="w-80 border-r border-emerald-500/20 bg-slate-950/50 backdrop-blur-sm p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Zap className="w-8 h-8" />
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
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${powerLevel}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Screen Progress */}
          <div className="space-y-3 flex-1">
            {[
              { num: 1, title: 'The Intel', desc: 'Income & Leaks', power: 20 },
              { num: 2, title: 'The Shield', desc: 'Insurance & Emergency', power: 30 },
              { num: 3, title: 'The Deployment', desc: 'SIP Strategy', power: 20 },
              { num: 4, title: 'The Recon', desc: 'Risk Assessment', power: 15 },
              { num: 5, title: 'Battle Plan', desc: 'Final Summary', power: 15 },
            ].map((screen) => (
              <Card
                key={screen.num}
                className={`border-2 transition-all cursor-pointer ${
                  currentScreen === screen.num
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : currentScreen > screen.num
                    ? 'border-emerald-700/50 bg-slate-800/50'
                    : 'border-slate-700 bg-slate-800/30'
                }`}
                onClick={() => setCurrentScreen(screen.num)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentScreen > screen.num
                        ? 'bg-emerald-500 text-white'
                        : currentScreen === screen.num
                        ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {currentScreen > screen.num ? <CheckCircle2 className="w-5 h-5" /> : screen.num}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{screen.title}</div>
                      <div className="text-xs text-slate-400">{screen.desc}</div>
                    </div>
                    <div className="text-xs text-emerald-400 font-bold">+{screen.power}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Central Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* SCREEN 1: The Intel */}
                {currentScreen === 1 && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                        <DollarSign className="w-10 h-10 text-emerald-400" />
                        The Intel: Income & Leak Detection
                      </h2>
                      <p className="text-lg text-slate-300">
                        Identify your financial ammunition and plug the leaks.
                      </p>
                    </div>

                    {/* Income Input */}
                    <Card className="border-2 border-slate-700 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-emerald-400">Monthly Income</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">₹</span>
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
                            className="text-2xl h-14 bg-slate-800 border-emerald-500/30 focus:border-emerald-500"
                            placeholder="80000"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fixed Bills */}
                    <Card className="border-2 border-slate-700 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-emerald-400">Fixed Bills (Rent, EMI, Utilities)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">₹</span>
                          <Input
                            type="number"
                            value={userData.fixedBills || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0
                              setUserData(prev => ({ ...prev, fixedBills: val }))
                            }}
                            className="text-2xl h-14 bg-slate-800 border-emerald-500/30 focus:border-emerald-500"
                            placeholder="45000"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Leaky Bucket Visualization */}
                    <Card className="border-2 border-amber-500/30 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-amber-400 flex items-center gap-2">
                          <TrendingDown className="w-6 h-6" />
                          Leaky Bucket: Plug These Holes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { key: 'dining' as const, label: 'Dining Out', save: 5000 },
                            { key: 'subscriptions' as const, label: 'Unused Subscriptions', save: 3000 },
                            { key: 'impulseBuys' as const, label: 'Impulse Buys', save: 4000 },
                          ].map((leak) => (
                            <Button
                              key={leak.key}
                              variant={userData.pluggedLeaks[leak.key] ? 'default' : 'outline'}
                              className={`h-24 flex flex-col gap-2 ${
                                userData.pluggedLeaks[leak.key]
                                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                                  : 'border-amber-500/50 hover:border-emerald-500'
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
                              <span className="font-semibold">{leak.label}</span>
                              <span className="text-xs">Save ₹{leak.save.toLocaleString()}/mo</span>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Surplus Display */}
                    {userData.income > 0 && userData.fixedBills > 0 && (
                      <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-transparent">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-sm text-emerald-400 mb-2">INVESTMENT AMMO (Monthly Surplus)</div>
                            <div className="text-5xl font-bold text-emerald-400">
                              ₹{calculateSurplus().toLocaleString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Next Button */}
                    <div className="flex justify-end">
                      <Button
                        size="lg"
                        disabled={!isScreen1Complete}
                        onClick={goToNextScreen}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                      >
                        Proceed to Shield
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* SCREEN 2: The Shield */}
                {currentScreen === 2 && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                        <Shield className="w-10 h-10 text-emerald-400" />
                        The Shield: Protection First
                      </h2>
                      <p className="text-lg text-slate-300">
                        Build your financial defense before investing.
                      </p>
                    </div>

                    {/* Insurance Toggles */}
                    <div className="grid grid-cols-2 gap-6">
                      <Card className={`border-2 transition-all ${
                        userData.termInsurance
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-amber-500 bg-amber-500/10'
                      }`}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-6 h-6" />
                            Term Insurance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant={userData.termInsurance ? 'default' : 'destructive'}
                            className="w-full"
                            onClick={() => {
                              if (userData.termInsurance) {
                                setModalContent({
                                  title: 'Warning: Removing Term Insurance',
                                  content: 'Term insurance protects your family in case of an emergency. Are you sure you want to remove this critical protection?',
                                  type: 'warning'
                                })
                              }
                              setUserData(prev => ({ ...prev, termInsurance: !prev.termInsurance }))
                              callAdvisor(`User ${userData.termInsurance ? 'disabled' : 'enabled'} term insurance`)
                            }}
                          >
                            {userData.termInsurance ? 'Protected' : 'Unprotected'}
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className={`border-2 transition-all ${
                        userData.healthInsurance
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-amber-500 bg-amber-500/10'
                      }`}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lock className="w-6 h-6" />
                            Health Insurance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant={userData.healthInsurance ? 'default' : 'destructive'}
                            className="w-full"
                            onClick={() => {
                              if (userData.healthInsurance) {
                                setModalContent({
                                  title: 'Warning: Removing Health Insurance',
                                  content: 'Health insurance is your safety net against medical emergencies. Removing it exposes you to significant financial risk.',
                                  type: 'warning'
                                })
                              }
                              setUserData(prev => ({ ...prev, healthInsurance: !prev.healthInsurance }))
                              callCoach(`User ${userData.healthInsurance ? 'disabled' : 'enabled'} health insurance`)
                            }}
                          >
                            {userData.healthInsurance ? 'Protected' : 'Unprotected'}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Emergency Fund Slider */}
                    <Card className="border-2 border-slate-700 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-emerald-400">Emergency Fund Buffer</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Months of Coverage</span>
                            <span className="text-3xl font-bold text-emerald-400">{userData.emergencyFundMonths}</span>
                          </div>
                          <Slider
                            value={[userData.emergencyFundMonths]}
                            onValueChange={([val]) => setUserData(prev => ({ ...prev, emergencyFundMonths: val }))}
                            min={0}
                            max={12}
                            step={1}
                            className="py-4"
                          />
                          <div className="text-sm text-slate-400">
                            Amount needed: ₹{(userData.fixedBills * userData.emergencyFundMonths).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={goToPrevScreen}>
                        <ChevronLeft className="mr-2 w-5 h-5" />
                        Back
                      </Button>
                      <Button
                        size="lg"
                        onClick={goToNextScreen}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                      >
                        Deploy Capital
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* SCREEN 3: The Deployment */}
                {currentScreen === 3 && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                        <TrendingUp className="w-10 h-10 text-emerald-400" />
                        The Deployment: SIP Strategy
                      </h2>
                      <p className="text-lg text-slate-300">
                        Deploy your capital systematically for exponential growth.
                      </p>
                    </div>

                    {/* Financial Goal Input */}
                    <Card className="border-2 border-slate-700 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-emerald-400 flex items-center gap-2">
                          <Target className="w-6 h-6" />
                          What's Your Financial Goal?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Input
                          value={userData.financialGoal}
                          onChange={(e) => setUserData(prev => ({ ...prev, financialGoal: e.target.value }))}
                          placeholder="e.g., Retirement fund, Home down payment, Child's education"
                          className="bg-slate-800 border-emerald-500/30 focus:border-emerald-500"
                          onFocus={() => callAdvisor(`User is setting financial goal. Monthly surplus: ₹${calculateSurplus()}`)}
                        />
                      </CardContent>
                    </Card>

                    {/* SIP Amount Slider */}
                    <Card className="border-2 border-slate-700 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-emerald-400">Monthly SIP Amount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Investment per month</span>
                            <span className="text-3xl font-bold text-emerald-400">₹{userData.sipAmount.toLocaleString()}</span>
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
                        </div>
                      </CardContent>
                    </Card>

                    {/* Years Slider */}
                    <Card className="border-2 border-slate-700 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-emerald-400">Investment Horizon</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Years</span>
                            <span className="text-3xl font-bold text-emerald-400">{userData.sipYears}</span>
                          </div>
                          <Slider
                            value={[userData.sipYears]}
                            onValueChange={([val]) => setUserData(prev => ({ ...prev, sipYears: val }))}
                            min={1}
                            max={30}
                            step={1}
                            className="py-4"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Growth Projection */}
                    <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-transparent">
                      <CardHeader>
                        <CardTitle className="text-emerald-400 flex items-center gap-2">
                          <Award className="w-6 h-6" />
                          Projected Wealth (@ 12% annual return)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="text-5xl font-bold text-emerald-400">
                            ₹{calculateSIPValue().toLocaleString()}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-slate-400">Total Invested</div>
                              <div className="text-2xl font-bold text-white">
                                ₹{(userData.sipAmount * userData.sipYears * 12).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400">Gains from Compounding</div>
                              <div className="text-2xl font-bold text-emerald-400">
                                ₹{(calculateSIPValue() - userData.sipAmount * userData.sipYears * 12).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => callEducator('User clicked on SIP tooltip. Explain what SIP means in simple terms.')}
                          >
                            What is SIP?
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={goToPrevScreen}>
                        <ChevronLeft className="mr-2 w-5 h-5" />
                        Back
                      </Button>
                      <Button
                        size="lg"
                        disabled={!isScreen3Complete}
                        onClick={goToNextScreen}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                      >
                        Assess Risk
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* SCREEN 4: The Recon */}
                {currentScreen === 4 && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                        <Sword className="w-10 h-10 text-emerald-400" />
                        The Recon: Risk Assessment
                      </h2>
                      <p className="text-lg text-slate-300">
                        Understand your risk tolerance before entering the battlefield.
                      </p>
                    </div>

                    {/* 3 Commandments */}
                    <Card className="border-2 border-amber-500 bg-amber-500/10">
                      <CardHeader>
                        <CardTitle className="text-amber-400">3 Commandments of Trading</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-3 list-decimal list-inside">
                          <li className="text-lg">Never invest money you can't afford to lose</li>
                          <li className="text-lg">Don't chase losses - stick to your strategy</li>
                          <li className="text-lg">Diversification is your shield against volatility</li>
                        </ol>
                      </CardContent>
                    </Card>

                    {/* Risk Quiz */}
                    <Card className="border-2 border-slate-700 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-emerald-400">Risk Tolerance Quiz</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Question 1 */}
                        <div>
                          <p className="font-semibold mb-3">1. Your investment drops 20% in a month. You:</p>
                          <div className="space-y-2">
                            {[
                              { value: 'conservative', label: 'Sell everything immediately (Conservative)' },
                              { value: 'moderate', label: 'Hold and monitor closely (Moderate)' },
                              { value: 'aggressive', label: 'Buy more at the lower price (Aggressive)' }
                            ].map(opt => (
                              <label key={opt.value} className="flex items-center gap-3 p-3 rounded border border-slate-700 hover:border-emerald-500 cursor-pointer">
                                <input
                                  type="radio"
                                  name="q1"
                                  value={opt.value}
                                  checked={userData.quizAnswers.q1 === opt.value}
                                  onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    quizAnswers: { ...prev.quizAnswers, q1: e.target.value }
                                  }))}
                                  className="w-4 h-4"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Question 2 */}
                        <div>
                          <p className="font-semibold mb-3">2. How much of your surplus would you allocate to high-risk investments?</p>
                          <div className="space-y-2">
                            {[
                              { value: 'conservative', label: '0-10% (Conservative)' },
                              { value: 'moderate', label: '10-30% (Moderate)' },
                              { value: 'aggressive', label: '30%+ (Aggressive)' }
                            ].map(opt => (
                              <label key={opt.value} className="flex items-center gap-3 p-3 rounded border border-slate-700 hover:border-emerald-500 cursor-pointer">
                                <input
                                  type="radio"
                                  name="q2"
                                  value={opt.value}
                                  checked={userData.quizAnswers.q2 === opt.value}
                                  onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    quizAnswers: { ...prev.quizAnswers, q2: e.target.value }
                                  }))}
                                  className="w-4 h-4"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Question 3 */}
                        <div>
                          <p className="font-semibold mb-3">3. Your investment time horizon is:</p>
                          <div className="space-y-2">
                            {[
                              { value: 'conservative', label: 'Less than 3 years (Conservative)' },
                              { value: 'moderate', label: '3-10 years (Moderate)' },
                              { value: 'aggressive', label: '10+ years (Aggressive)' }
                            ].map(opt => (
                              <label key={opt.value} className="flex items-center gap-3 p-3 rounded border border-slate-700 hover:border-emerald-500 cursor-pointer">
                                <input
                                  type="radio"
                                  name="q3"
                                  value={opt.value}
                                  checked={userData.quizAnswers.q3 === opt.value}
                                  onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    quizAnswers: { ...prev.quizAnswers, q3: e.target.value }
                                  }))}
                                  className="w-4 h-4"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Risk Profile Result */}
                    {isScreen4Complete && (
                      <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-transparent">
                        <CardContent className="p-6 text-center">
                          <div className="text-sm text-emerald-400 mb-2">YOUR RISK PROFILE</div>
                          <div className="text-3xl font-bold text-emerald-400 mb-4">
                            {(() => {
                              const answers = Object.values(userData.quizAnswers)
                              const aggressiveCount = answers.filter(a => a === 'aggressive').length
                              const conservativeCount = answers.filter(a => a === 'conservative').length

                              let profile = 'Moderate Investor'
                              if (aggressiveCount >= 2) profile = 'Aggressive Speculator'
                              else if (conservativeCount >= 2) profile = 'Conservative Investor'

                              // Update state
                              setTimeout(() => {
                                setUserData(prev => ({ ...prev, riskProfile: profile }))
                                callAdvisor(`User completed risk quiz. Profile: ${profile}. Monthly surplus: ₹${calculateSurplus()}`)
                              }, 0)

                              return profile
                            })()}
                          </div>
                          <p className="text-slate-300">
                            Based on your responses, you're comfortable with{' '}
                            {userData.riskProfile.includes('Aggressive') ? 'higher' :
                             userData.riskProfile.includes('Conservative') ? 'lower' : 'moderate'} risk
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={goToPrevScreen}>
                        <ChevronLeft className="mr-2 w-5 h-5" />
                        Back
                      </Button>
                      <Button
                        size="lg"
                        disabled={!isScreen4Complete}
                        onClick={goToNextScreen}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                      >
                        View Battle Plan
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* SCREEN 5: Final Battle Plan */}
                {currentScreen === 5 && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                        <Award className="w-10 h-10 text-emerald-400" />
                        Your Financial Battle Plan
                      </h2>
                      <p className="text-lg text-slate-300">
                        Mission accomplished! Here's your complete strategy.
                      </p>
                    </div>

                    {/* Confetti Animation */}
                    {powerLevel >= 100 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <div className="text-6xl mb-4">🎉</div>
                        <div className="text-3xl font-bold text-emerald-400">
                          POWER LEVEL: 100!
                        </div>
                        <div className="text-lg text-slate-300">You've mastered your financial future!</div>
                      </motion.div>
                    )}

                    {/* Summary Certificate */}
                    <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-transparent">
                      <CardHeader>
                        <CardTitle className="text-2xl text-emerald-400 text-center">
                          CERTIFICATE OF FINANCIAL READINESS
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Financial Intel */}
                        <div>
                          <h3 className="font-bold text-lg mb-3 text-emerald-400">THE INTEL</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Monthly Income:</span>
                              <div className="text-xl font-bold">₹{userData.income.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Investment Surplus:</span>
                              <div className="text-xl font-bold text-emerald-400">₹{calculateSurplus().toLocaleString()}</div>
                            </div>
                          </div>
                        </div>

                        {/* The Shield */}
                        <div>
                          <h3 className="font-bold text-lg mb-3 text-emerald-400">THE SHIELD</h3>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Term Insurance:</span>
                              <div className={`text-lg font-bold ${userData.termInsurance ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {userData.termInsurance ? 'Protected' : 'Unprotected'}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400">Health Insurance:</span>
                              <div className={`text-lg font-bold ${userData.healthInsurance ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {userData.healthInsurance ? 'Protected' : 'Unprotected'}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400">Emergency Fund:</span>
                              <div className="text-lg font-bold">{userData.emergencyFundMonths} months</div>
                            </div>
                          </div>
                        </div>

                        {/* The Deployment */}
                        <div>
                          <h3 className="font-bold text-lg mb-3 text-emerald-400">THE DEPLOYMENT</h3>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Monthly SIP:</span>
                              <div className="text-xl font-bold">₹{userData.sipAmount.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Time Horizon:</span>
                              <div className="text-xl font-bold">{userData.sipYears} years</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Projected Value:</span>
                              <div className="text-xl font-bold text-emerald-400">₹{calculateSIPValue().toLocaleString()}</div>
                            </div>
                          </div>
                        </div>

                        {/* Risk Profile */}
                        <div>
                          <h3 className="font-bold text-lg mb-3 text-emerald-400">RISK PROFILE</h3>
                          <div className="text-xl font-bold">{userData.riskProfile || 'Moderate Investor'}</div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Next 3 Steps */}
                    <Card className="border-2 border-slate-700 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-emerald-400">Next 3 Mission Steps</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-3 list-decimal list-inside text-lg">
                          <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                            <span>Set up automatic SIP transfers with your bank or brokerage</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                            <span>Review insurance coverage annually to ensure adequate protection</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                            <span>Monitor and rebalance portfolio quarterly based on your goals</span>
                          </li>
                        </ol>
                      </CardContent>
                    </Card>

                    {/* Download Button */}
                    <div className="text-center">
                      <Button
                        size="lg"
                        onClick={downloadCertificate}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-12"
                      >
                        <Download className="mr-2 w-5 h-5" />
                        Download Battle Plan
                      </Button>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={goToPrevScreen}>
                        <ChevronLeft className="mr-2 w-5 h-5" />
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
                      >
                        New Mission
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - Agent Messages */}
        {showRightPanel && (
          <div className="w-96 border-l border-emerald-500/20 bg-slate-950/50 backdrop-blur-sm p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-emerald-400">Agent Intel</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRightPanel(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {loading && (
              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg mb-3">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span className="text-sm text-slate-300">Agent processing...</span>
              </div>
            )}

            <div className="space-y-3">
              {agentMessages.slice(-5).reverse().map((msg, idx) => (
                <Card key={idx} className="border-2 border-slate-700 bg-slate-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-emerald-400">{msg.agent}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300">{msg.message}</p>
                  </CardContent>
                </Card>
              ))}
              {agentMessages.length === 0 && !loading && (
                <p className="text-sm text-slate-500 text-center py-8">
                  Agent insights will appear here as you progress through your mission.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Toggle Right Panel Button (when hidden) */}
        {!showRightPanel && (
          <Button
            className="fixed right-4 top-4 z-50"
            onClick={() => setShowRightPanel(true)}
          >
            Agent Intel
          </Button>
        )}
      </div>

      {/* Modal Dialog */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full"
          >
            <Card className={`border-2 ${
              modalContent.type === 'warning'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-emerald-500 bg-emerald-500/10'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={modalContent.type === 'warning' ? 'text-amber-400' : 'text-emerald-400'}>
                    {modalContent.type === 'warning' && <AlertTriangle className="w-6 h-6 inline mr-2" />}
                    {modalContent.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setModalContent(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-6">{modalContent.content}</p>
                <Button
                  className="w-full"
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

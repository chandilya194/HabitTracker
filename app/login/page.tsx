"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useTaskStore } from "@/lib/task-store"
import { auth } from "@/lib/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react"

type Step = "welcome" | "login" | "register" | "forgot"

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useTaskStore()
  
  const [step, setStep] = useState<Step>("welcome")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  
  // UI states
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  const clearMessages = () => {
    setAuthError("")
    setInfoMessage("")
  }

  const handleBack = () => {
    clearMessages()
    if (step === "forgot" || step === "register") {
      setStep("login")
    } else if (step === "login") {
      setStep("welcome")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    clearMessages()
    
    if (!email.trim() || !password.trim()) {
      setAuthError("Please fill in all fields.")
      return
    }
    
    setIsSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.push("/")
    } catch (err: any) {
      console.error(err)
      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setAuthError("Invalid email or password.")
      } else if (err.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address.")
      } else {
        setAuthError(err.message || "An error occurred during log in.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    clearMessages()
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      setAuthError("Please fill in all fields.")
      return
    }
    
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.")
      return
    }
    
    setIsSubmitting(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(userCredential.user, {
        displayName: username.trim(),
      })
      router.push("/")
    } catch (err: any) {
      console.error(err)
      if (err.code === "auth/email-already-in-use") {
        setAuthError("This email is already registered.")
      } else if (err.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address.")
      } else {
        setAuthError(err.message || "An error occurred during registration.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    clearMessages()
    
    if (!email.trim()) {
      setAuthError("Please enter your email address.")
      return
    }
    
    setIsSubmitting(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setInfoMessage("Reset link has been sent to your email!")
      setTimeout(() => {
        setStep("login")
        clearMessages()
      }, 3000)
    } catch (err: any) {
      console.error(err)
      if (err.code === "auth/user-not-found") {
        setAuthError("No account found with this email.")
      } else if (err.code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address.")
      } else {
        setAuthError(err.message || "An error occurred.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Social Buttons Component
  const SocialLogins = () => (
    <div className="space-y-4">
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <span className="relative px-3 bg-white text-xs text-muted-foreground uppercase">Or</span>
      </div>
      
      <div className="flex justify-center gap-4">
        {/* Facebook */}
        <button
          type="button"
          className="flex items-center justify-center w-14 h-10 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* Google */}
        <button
          type="button"
          className="flex items-center justify-center w-14 h-10 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </button>

        {/* Apple */}
        <button
          type="button"
          className="flex items-center justify-center w-14 h-10 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-black fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
          </svg>
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fec5bb] flex items-center justify-center">
        <div className="animate-pulse text-[#ff5f40] font-semibold text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fec5bb] flex items-center justify-center px-4 py-8 md:py-16">
      <div className="w-full max-w-sm md:max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-white/20 transition-all duration-300">
        
        {/* Welcome / Avenue Screen */}
        {step === "welcome" && (
          <div className="p-8 flex flex-col items-center text-center space-y-6">
            <h1 className="text-xl font-bold tracking-widest text-[#ff5f40] uppercase mt-2">Avenue</h1>
            
            <div className="relative w-full aspect-[4/3] max-w-[280px] bg-slate-50/50 rounded-2xl overflow-hidden flex items-center justify-center p-4">
              <Image 
                src="/welcome_illustration.png" 
                alt="Welcome to Avenue" 
                fill
                priority
                className="object-contain p-2"
              />
            </div>
            
            <div className="space-y-4 w-full pt-4">
              <Button 
                onClick={() => setStep("login")}
                className="w-full h-12 rounded-full bg-[#ff5f40] hover:bg-[#e04f33] text-white font-semibold text-base transition-all active:scale-[0.98]"
              >
                Log In
              </Button>
              <Button 
                onClick={() => setStep("register")}
                variant="outline"
                className="w-full h-12 rounded-full border border-[#ff5f40] text-[#ff5f40] bg-transparent hover:bg-[#ff5f40]/5 font-semibold text-base transition-all active:scale-[0.98]"
              >
                Register
              </Button>
            </div>
          </div>
        )}

        {/* Login Screen */}
        {step === "login" && (
          <div className="p-8">
            <div className="flex items-center mb-6">
              <button 
                onClick={handleBack} 
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-[#ff5f40]">Welcome Back!</h2>
              <p className="text-sm text-muted-foreground">Login to continue using the app.</p>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-600 pl-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-[#ff5f40] placeholder:text-gray-400 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-xs font-semibold text-gray-600">Password</Label>
                  <button
                    type="button"
                    onClick={() => setStep("forgot")}
                    className="text-xs font-semibold text-[#ff5f40] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-[#ff5f40] placeholder:text-gray-400 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#ff5f40] hover:bg-[#e04f33] text-white font-semibold text-sm mt-6 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Logging In..." : "Log In"}
              </Button>
            </form>

            <SocialLogins />

            <p className="text-xs text-center text-muted-foreground mt-8">
              Didn't have account?{" "}
              <button 
                onClick={() => setStep("register")} 
                className="font-bold text-[#ff5f40] hover:underline"
              >
                Register
              </button>
            </p>
          </div>
        )}

        {/* Register Screen */}
        {step === "register" && (
          <div className="p-8">
            <div className="flex items-center mb-6">
              <button 
                onClick={handleBack} 
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-[#ff5f40]">Everything You Need!</h2>
              <p className="text-sm text-muted-foreground">Create account and start exploring.</p>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="username" className="text-xs font-semibold text-gray-600 pl-1">User Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter User name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 pl-10 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-[#ff5f40] placeholder:text-gray-400 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-600 pl-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-[#ff5f40] placeholder:text-gray-400 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-600 pl-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-[#ff5f40] placeholder:text-gray-400 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#ff5f40] hover:bg-[#e04f33] text-white font-semibold text-sm mt-6 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Creating Account..." : "Register"}
              </Button>
            </form>

            <SocialLogins />

            <p className="text-xs text-center text-muted-foreground mt-8">
              Already have an account?{" "}
              <button 
                onClick={() => setStep("login")} 
                className="font-bold text-[#ff5f40] hover:underline"
              >
                Log In
              </button>
            </p>
          </div>
        )}

        {/* Forgot Password Screen */}
        {step === "forgot" && (
          <div className="p-8">
            <div className="flex items-center mb-6">
              <button 
                onClick={handleBack} 
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-[#ff5f40]">Forgot Password?</h2>
              <p className="text-sm text-muted-foreground">Don't worry, it happens! Please enter registered email.</p>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {infoMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium mb-4">
                <AlertCircle className="h-4 w-4 shrink-0 text-green-600" />
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-600 pl-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-[#ff5f40] placeholder:text-gray-400 text-sm"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#ff5f40] hover:bg-[#e04f33] text-white font-semibold text-sm mt-6 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Sending Link..." : "Send Reset Email"}
              </Button>
            </form>
          </div>
        )}
        
      </div>
    </div>
  )
}

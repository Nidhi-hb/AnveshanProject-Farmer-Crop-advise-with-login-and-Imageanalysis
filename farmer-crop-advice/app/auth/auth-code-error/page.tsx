import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, AlertCircle } from "lucide-react"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo and branding */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-800">CropWise</h1>
            </div>
          </div>

          <Card className="border-red-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-800">Authentication Error</CardTitle>
              <CardDescription className="text-red-600">
                There was an issue confirming your email. Please try signing in again.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  If you continue to have issues, please contact support or try creating a new account.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/auth/login">Try Signing In Again</Link>
                  </Button>
                  <Button variant="outline" asChild className="border-green-200 bg-transparent">
                    <Link href="/auth/sign-up">Create New Account</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

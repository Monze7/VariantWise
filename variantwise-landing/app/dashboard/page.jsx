import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 py-8 bg-primary-500">
      <h1 className="text-3xl font-bold mb-6 text-white">Welcome to your Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary-400 shadow-md hover:shadow-lg transition-all duration-300 bg-primary-400">
          <CardHeader className="bg-gradient-to-r from-black to-primary-400 rounded-t-lg">
            <CardTitle className="text-white">Recent Searches</CardTitle>
            <CardDescription className="text-primary-200">Your recent car searches and comparisons</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-primary-200 mb-4">You haven't made any searches yet.</p>
            <Link href="/consultant">
              <Button className="bg-black hover:bg-primary-500 text-white border border-primary-300">
                Start Searching
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary-400 shadow-md hover:shadow-lg transition-all duration-300 bg-primary-400">
          <CardHeader className="bg-gradient-to-r from-black to-primary-400 rounded-t-lg">
            <CardTitle className="text-white">Saved Cars</CardTitle>
            <CardDescription className="text-primary-200">Cars you've saved for later comparison</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-primary-200 mb-4">You haven't saved any cars yet.</p>
            <Link href="/consultant">
              <Button variant="outline" className="border-primary-300 text-white hover:bg-primary-500">
                Find Cars
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary-400 shadow-md hover:shadow-lg transition-all duration-300 bg-primary-400">
          <CardHeader className="bg-gradient-to-r from-black to-primary-400 rounded-t-lg">
            <CardTitle className="text-white">AI Consultant</CardTitle>
            <CardDescription className="text-primary-200">Get personalized car recommendations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-primary-200 mb-4">Our AI can help you find the perfect car.</p>
            <Link href="/consultant">
              <Button className="bg-black hover:bg-primary-500 text-white border border-primary-300">Talk to AI</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


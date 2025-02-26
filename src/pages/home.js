import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
            Your All-in-One Smart Planning Solution
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform how you plan work, study, and workouts with AI-powered tools that adapt to your needs.
          </p>
          <div className="space-x-4">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate("/Dashboard")}>
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/Analytics")}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              View Analytics
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Features that Empower Your Planning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Smart Planning Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intelligent planning tools for work, study, and workout sessions with customizable templates.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI Content Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate summaries, quizzes, and study materials from PDFs and YouTube videos automatically.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your progress with detailed analytics and insights across all your planning activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Tailored for Your Success
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4">For Students</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Optimize study sessions with AI-generated materials</li>
                <li>• Track exam preparation progress</li>
                <li>• Create effective study schedules</li>
                <li>• Generate quick summaries and quizzes</li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4">For Professionals</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Streamline work planning and task management</li>
                <li>• Balance work and continuous learning</li>
                <li>• Track professional development</li>
                <li>• Optimize time management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Planning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who have revolutionized their planning approach.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate("/Dashboard")}>
            Start Planning Smarter
          </Button>
        </div>
      </section>
    </div>
  );
}

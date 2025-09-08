import Link from 'next/link';
import { 
  FileText, 
  Variable, 
  Zap, 
  Bot,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Settings
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Prompt Bulk Tool
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link 
                href="/templates" 
                className="btn btn-outline btn-md"
              >
                Templates
              </Link>
              <Link 
                href="/variable-presets" 
                className="btn btn-outline btn-md"
              >
                Variable Presets
              </Link>
              <Link 
                href="/generation" 
                className="btn btn-primary btn-md"
              >
                Generate
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                Create Bulk Prompts
                <span className="block text-primary-600">Execute Automatically</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
                Create prompt templates with placeholders, define variables and generate 
                hundreds of prompts for automated execution on AI platforms.
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <Link 
                  href="/templates"
                  className="btn btn-primary btn-lg"
                >
                  Create Templates
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  href="/generation"
                  className="btn btn-outline btn-lg"
                >
                  Generate Prompts
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                How does it work?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                From templates to automated AI prompts in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  1. Create Templates
                </h3>
                <p className="mt-4 text-gray-600">
                  Create prompt templates with <code className="bg-gray-100 px-1 rounded">{'{{variable_name}}'}</code> 
                  placeholders for dynamic content.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                  <code className="text-sm text-gray-700">
                    Create a <span className="text-primary-600">{'{{style}}'}</span> product description 
                    for <span className="text-primary-600">{'{{product}}'}</span>
                  </code>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Settings className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  2. Create Variable Presets
                </h3>
                <p className="mt-4 text-gray-600">
                  Create reusable variable presets with semicolon-separated values 
                  for your template placeholders.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                  <div className="text-sm text-gray-700">
                    <div><strong>style:</strong> modern;classic;creative;minimalistic</div>
                    <div><strong>product:</strong> Smartphone;Laptop;Tablet;Smartwatch</div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  3. Generate in Bulk
                </h3>
                <p className="mt-4 text-gray-600">
                  The system creates all combinations automatically. 
                  3 Templates × 3 Styles × 3 Products = 27 Prompts!
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">
                    ✨ 27 unique prompts generated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Automation Preview */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Automated Execution
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Execute your generated prompts automatically on AI platforms
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'ChatGPT', icon: '🤖', status: 'Configured' },
                { name: 'Claude', icon: '🧠', status: 'Configured' },
                { name: 'Gemini', icon: '💎', status: 'Configured' }
              ].map((platform) => (
                <div key={platform.name} className="card">
                  <div className="card-body text-center">
                    <div className="text-4xl mb-4">{platform.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {platform.name}
                    </h3>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        {platform.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Browser automation via Playwright with cookie management for persistent sessions.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                <Bot className="w-5 h-5" />
                <span className="font-medium">
                  Automation feature coming soon
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-16 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: 'Templates', value: '∞' },
                { label: 'Variables', value: '∞' },
                { label: 'Generated Prompts', value: '∞' },
                { label: 'AI-Plattformen', value: '3+' }
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-primary-100">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>
              Prompt Bulk Tool - Bulk prompt creation and automated execution
            </p>
            <div className="mt-2 space-x-4">
              <Link href="/templates" className="text-primary-600 hover:text-primary-700">
                Templates
              </Link>
              <Link href="/variable-presets" className="text-primary-600 hover:text-primary-700">
                Variable Presets
              </Link>
              <Link href="/generation" className="text-primary-600 hover:text-primary-700">
                Generation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { useState } from 'react'
import { User, MapPin, Target, Palette, LogOut } from 'lucide-react'
import { useAuth } from './AuthContext'
import MindMapView from './MindMapView'

interface UserProfile {
  name: string
  company: string
  skills: string[]
  vision: string
}

interface NetworkConnection {
  industry: string
  strength: string
}

export default function VisionMapCreator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showMindMap, setShowMindMap] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    company: '',
    skills: [],
    vision: ''
  })
  const [network, setNetwork] = useState<NetworkConnection[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const { logout, token } = useAuth()

  const industries = [
    'IT Industry',
    'Finance Industry',
    'Healthcare Industry',
    'Education Industry',
    'Manufacturing Industry',
    'Retail Industry',
    'Consulting Industry',
    'Media & Entertainment',
    'Real Estate',
    'Government & Public Sector'
  ]

  const visions = [
    'Innovation Leader',
    'Problem Solver',
    'Team Builder',
    'Strategic Thinker',
    'Customer Champion',
    'Growth Driver',
    'Quality Expert',
    'Sustainability Advocate'
  ]

  const templates = [
    { id: 'mindmap', name: 'Mind Map Style', description: 'Hierarchical visual representation' },
    { id: 'dashboard', name: 'Dashboard Style', description: 'Clean, organized layout' },
    { id: 'infographic', name: 'Infographic Style', description: 'Creative visual storytelling' }
  ]

  const addSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addNetworkConnection = (industry: string, strength: string) => {
    const existingConnection = network.find(conn => conn.industry === industry)
    if (!existingConnection) {
      setNetwork(prev => [...prev, { industry, strength }])
    }
  }

  const generateVisionMap = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      })

      for (const connection of network) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/network`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(connection)
        })
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vision-map?template=${selectedTemplate}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      console.log('Vision Map Generated:', result)
      
      if (selectedTemplate === 'mindmap') {
        setShowMindMap(true)
      } else {
        alert('Vision Map generated successfully! Check console for details.')
      }
    } catch (error) {
      console.error('Error generating vision map:', error)
      alert('Error generating vision map. Please try again.')
    }
  }

  if (showMindMap) {
    return (
      <MindMapView 
        profile={profile}
        network={network}
        onBack={() => setShowMindMap(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 relative">
          <button
            onClick={logout}
            className="absolute top-0 right-0 flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Synergy Link</h1>
          <p className="text-lg text-gray-600">Personal Vision Map Generator</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <User className="mr-2 text-blue-600" />
                <h2 className="text-2xl font-semibold">Profile Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} &times;
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!profile.name || !profile.company}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <MapPin className="mr-2 text-blue-600" />
                <h2 className="text-2xl font-semibold">Professional Network</h2>
              </div>

              <p className="text-gray-600 mb-4">
                Add your professional connections by industry for privacy protection.
              </p>

              <div className="space-y-4">
                {industries.map((industry) => {
                  const connection = network.find(conn => conn.industry === industry)
                  return (
                    <div key={industry} className="flex items-center justify-between p-3 border rounded-md">
                      <span className="font-medium">{industry}</span>
                      <select
                        value={connection?.strength || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            addNetworkConnection(industry, e.target.value)
                          }
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">No Connection</option>
                        <option value="Normal">Normal</option>
                        <option value="Strong">Strong</option>
                        <option value="Very Strong">Very Strong</option>
                      </select>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="mr-2 text-blue-600" />
                <h2 className="text-2xl font-semibold">Personal Vision</h2>
              </div>

              <p className="text-gray-600 mb-4">
                Select a personal mission/vision that represents you.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {visions.map((vision) => (
                  <button
                    key={vision}
                    onClick={() => setProfile(prev => ({ ...prev, vision }))}
                    className={`p-3 text-center rounded-md border-2 transition-colors ${
                      profile.vision === vision
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {vision}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Palette className="mr-2 text-blue-600" />
                <h2 className="text-2xl font-semibold">Choose Template</h2>
              </div>

              <p className="text-gray-600 mb-4">
                Select a design template for your vision map.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 text-left rounded-md border-2 transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                    <p className="text-gray-600">{template.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={generateVisionMap}
                  disabled={!selectedTemplate}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Generate Vision Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

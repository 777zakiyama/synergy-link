import React, { useRef } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, User, Target, Lightbulb, Network } from 'lucide-react'
import { toPng } from 'html-to-image'

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

interface MindMapViewProps {
  profile: UserProfile
  network: NetworkConnection[]
  onBack: () => void
}

export default function MindMapView({ profile, network, onBack }: MindMapViewProps) {
  const mindMapRef = useRef<HTMLDivElement>(null)

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return '#1e40af'
      case 'Strong': return '#3b82f6'
      case 'Normal': return '#93c5fd'
      default: return '#e5e7eb'
    }
  }

  const bubbleData = network.map((conn, index) => ({
    x: index + 1,
    y: Math.random() * 10 + 5,
    z: conn.strength === 'Very Strong' ? 100 : conn.strength === 'Strong' ? 70 : 40,
    industry: conn.industry,
    strength: conn.strength,
    fill: getStrengthColor(conn.strength)
  }))

  const downloadAsPNG = async () => {
    if (mindMapRef.current) {
      try {
        const dataUrl = await toPng(mindMapRef.current, {
          quality: 1.0,
          pixelRatio: 2
        })
        const link = document.createElement('a')
        link.download = `${profile.name}-vision-map.png`
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error('Error downloading image:', error)
        alert('Error downloading image. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 relative">
          <button
            onClick={onBack}
            className="absolute top-0 left-0 flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Form
          </button>
          <button
            onClick={downloadAsPNG}
            className="absolute top-0 right-0 flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Vision Map</h1>
          <p className="text-lg text-gray-600">Mind Map Style</p>
        </header>

        <div ref={mindMapRef} className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="relative min-h-[600px] flex items-center justify-center">
            
            <div className="absolute z-10 bg-blue-600 text-white rounded-full w-48 h-48 flex flex-col items-center justify-center text-center shadow-lg">
              <User className="h-8 w-8 mb-2" />
              <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
              <p className="text-sm opacity-90">{profile.company}</p>
            </div>

            <div className="absolute top-0 left-0 w-64">
              <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center mb-3">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute top-20 right-0 w-32 h-0.5 bg-green-500 transform rotate-45 origin-right"></div>
            </div>

            <div className="absolute top-0 right-0 w-64">
              <div className="bg-purple-500 text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center mb-3">
                  <Target className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">Personal Vision</h3>
                </div>
                <p className="text-lg font-medium">{profile.vision}</p>
              </div>
              <div className="absolute top-20 left-0 w-32 h-0.5 bg-purple-500 transform -rotate-45 origin-left"></div>
            </div>

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
              <div className="bg-orange-500 text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center mb-3">
                  <Network className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">Professional Network</h3>
                </div>
                
                <div className="bg-white rounded-lg p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={bubbleData}>
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        domain={[0, network.length + 1]}
                        hide
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        domain={[0, 15]}
                        hide
                      />
                      <ZAxis 
                        type="number" 
                        dataKey="z" 
                        range={[20, 200]}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
                                <p className="font-semibold">{data.industry}</p>
                                <p className="text-sm">Strength: {data.strength}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Scatter dataKey="z">
                        {bubbleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="absolute top-0 left-1/2 w-0.5 h-16 bg-orange-500 transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

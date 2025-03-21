import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ImagePlus, Share2, Mail } from 'lucide-react';
import PhotoEditor from './components/PhotoEditor';
import PosterEditor from './components/PosterEditor';
import 'react-tabs/style/react-tabs.css';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold neon-text flex items-center gap-2">
              <ImagePlus className="w-8 h-8" />
              PicX 2.0
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs
          selectedIndex={activeTab}
          onSelect={index => setActiveTab(index)}
          className="bg-gray-800 rounded-lg shadow-lg p-6 neon-border"
        >
          <TabList className="flex gap-4 border-b border-gray-700 mb-6">
            <Tab className="tab-button">Photo Editor</Tab>
            <Tab className="tab-button">Poster Editor</Tab>
          </TabList>

          <TabPanel>
            <PhotoEditor />
          </TabPanel>
          <TabPanel>
            <PosterEditor />
          </TabPanel>
        </Tabs>
      </main>
    </div>
  );
}

export default App
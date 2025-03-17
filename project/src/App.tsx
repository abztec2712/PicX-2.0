import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ImagePlus, Share2, Undo2, Redo2, Save, Download, Mail } from 'lucide-react';
import PhotoEditor from './components/PhotoEditor';
import PosterEditor from './components/PosterEditor';
import 'react-tabs/style/react-tabs.css';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ImagePlus className="w-8 h-8 text-blue-600" />
              PicX 2.0
            </h1>
            <div className="flex items-center gap-4">
              <button className="btn-primary">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="btn-secondary">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs
          selectedIndex={activeTab}
          onSelect={index => setActiveTab(index)}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <TabList className="flex gap-4 border-b border-gray-200 mb-6">
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

export default App;
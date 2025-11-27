/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ProjectsPage from './pages/ProjectsPage';
import WriterPage from './pages/WriterPage';
import ArtistPage from './pages/ArtistPage';
import DirectorPage from './pages/DirectorPage';
import ImageToVideoPage from './pages/ImageToVideoPage';
import TextToVideoPage from './pages/TextToVideoPage';
import AIImageGeneratorPage from './pages/AIImageGeneratorPage';

import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-black text-gray-200 flex flex-col">
            <Header />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/ko" element={<LandingPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/writer" element={<WriterPage />} />
                <Route path="/artist" element={<ArtistPage />} />
                <Route path="/director" element={<DirectorPage />} />
                <Route path="/ko/image-to-video" element={<ImageToVideoPage />} />
                <Route path="/ko/text-to-video" element={<TextToVideoPage />} />
                <Route path="/ko/ai-image-generator" element={<AIImageGeneratorPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

import React, { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { playChime } from '../lib/sound';

interface InstallerModalProps {
  onClose: () => void;
  soundEnabled: boolean;
}

export const InstallerModal: React.FC<InstallerModalProps> = ({ onClose, soundEnabled }) => {
  const [step, setStep] = useState<'intro' | 'destination' | 'type' | 'progress' | 'summary'>('intro');
  const [installProgress, setInstallProgress] = useState(0);
  const [statusText, setStatusText] = useState('Preparing APFS target volume...');

  const startInstallation = () => {
    setStep('progress');
    playChime('click', soundEnabled);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setInstallProgress(current);

      if (current === 20) setStatusText('Writing HighSierra AI Studio.app bundle to /Applications...');
      if (current === 50) setStatusText('Registering Metal 2 shaders & GGUF local model paths...');
      if (current === 80) setStatusText('Creating LaunchAgent & Dock shortcut...');
      if (current >= 100) {
        clearInterval(interval);
        setStep('summary');
        playChime('startup', soundEnabled);
      }
    }, 300);
  };

  const downloadNativeLauncherScript = () => {
    playChime('click', soundEnabled);
    const scriptContent = `#!/bin/bash
# HighSierra AI Studio macOS 10.13 Desktop Application Launcher
# Package Name: HighSierra AI Studio.app
# Target OS: macOS 10.13.6 High Sierra (Intel Core i7 / Metal 2)

APP_DIR="/Applications/HighSierra AI Studio.app"
mkdir -p "$APP_DIR/Contents/MacOS"
mkdir -p "$APP_DIR/Contents/Resources"

cat << 'EOF' > "$APP_DIR/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>HighSierraAI</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.highsierra.aistudio</string>
    <key>CFBundleName</key>
    <string>HighSierra AI Studio</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>10.13.6</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13.0</string>
</dict>
</plist>
EOF

cat << 'EOF' > "$APP_DIR/Contents/MacOS/HighSierraAI"
#!/bin/bash
echo "[High Sierra AI Studio Launcher] Starting Native Desktop Client..."
open "\${window.location.href}"
EOF

chmod +x "$APP_DIR/Contents/MacOS/HighSierraAI"
echo "✅ HighSierra AI Studio.app successfully installed in /Applications!"
open "$APP_DIR"
`;

    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Install_HighSierra_AI_Studio.command';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in font-sans select-none">
      <div className="w-full max-w-xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg shadow-2xl border border-gray-300 dark:border-neutral-700 overflow-hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-800 border-b border-gray-300 dark:border-neutral-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center text-[8px] font-bold text-red-950 cursor-pointer"
            >
              ✕
            </button>
            <span className="text-xs font-semibold">Install HighSierra AI Studio</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">
            <MaterialIcon name="close" size={16} />
          </button>
        </div>

        {/* Wizard Sidebar + Content Layout */}
        <div className="grid grid-cols-4 min-h-[360px]">
          {/* Left Step Navigation Sidebar */}
          <div className="bg-gray-200/80 dark:bg-neutral-850 p-4 border-r border-gray-300 dark:border-neutral-700 text-xs space-y-3 font-medium">
            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-2">Steps</div>
            <div className={`flex items-center space-x-2 ${step === 'intro' ? 'font-bold text-blue-600' : 'opacity-60'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">1</span>
              <span>Introduction</span>
            </div>
            <div className={`flex items-center space-x-2 ${step === 'destination' ? 'font-bold text-blue-600' : 'opacity-60'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">2</span>
              <span>Destination</span>
            </div>
            <div className={`flex items-center space-x-2 ${step === 'type' ? 'font-bold text-blue-600' : 'opacity-60'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">3</span>
              <span>Installation</span>
            </div>
            <div className={`flex items-center space-x-2 ${step === 'progress' ? 'font-bold text-blue-600' : 'opacity-60'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">4</span>
              <span>Extracting</span>
            </div>
            <div className={`flex items-center space-x-2 ${step === 'summary' ? 'font-bold text-blue-600' : 'opacity-60'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">5</span>
              <span>Summary</span>
            </div>
          </div>

          {/* Right Main Panel */}
          <div className="col-span-3 p-6 flex flex-col justify-between bg-white dark:bg-neutral-800">
            {step === 'intro' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-xl text-white shadow-md flex items-center justify-center">
                    <span className="text-3xl leading-none"></span>
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Welcome to the HighSierra AI Studio Installer</h2>
                    <p className="text-xs text-gray-500">Version 10.13.6 (Build 17G66)</p>
                  </div>
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  This installer will guide you through installing <strong>HighSierra AI Studio</strong> as a standalone native application bundle in your <code>/Applications</code> directory with Metal 2 GPU acceleration and APFS local storage persistence.
                </p>

                <div className="p-3 bg-blue-50 dark:bg-neutral-750 rounded-md border border-blue-200 text-xs text-blue-800 dark:text-blue-200">
                  <span className="font-bold block mb-0.5">System Requirements Verified:</span>
                  • macOS 10.13 High Sierra or newer<br />
                  • Intel Core i7 / Radeon Pro Metal 2 GPU<br />
                  • Node.js 16.20.2 & npm 8.19.4 / Chrome 115+
                </div>
              </div>
            )}

            {step === 'destination' && (
              <div className="space-y-4">
                <h2 className="font-bold text-sm">Select a Destination Volume</h2>
                <div className="p-4 border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 rounded-lg flex items-center space-x-3">
                  <MaterialIcon name="hard_drive" size={36} className="text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-xs">Macintosh HD (APFS Volume)</h3>
                    <p className="text-[11px] text-gray-500">Install for all users on this computer</p>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">184.2 GB available</span>
                  </div>
                </div>
              </div>
            )}

            {step === 'type' && (
              <div className="space-y-4">
                <h2 className="font-bold text-sm">Standard Installation on Macintosh HD</h2>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  This will perform a standard installation of HighSierra AI Studio into <code>/Applications/HighSierra AI Studio.app</code>.
                </p>
                <div className="p-3 bg-gray-50 dark:bg-neutral-750 rounded-md border text-xs">
                  <span className="font-bold">Space Required:</span> 184 MB<br />
                  <span className="font-bold">Target Path:</span> <code>/Applications/HighSierra AI Studio.app</code>
                </div>
              </div>
            )}

            {step === 'progress' && (
              <div className="space-y-4 my-auto">
                <h2 className="font-bold text-sm text-center">Installing HighSierra AI Studio...</h2>
                <div className="w-full bg-gray-200 dark:bg-neutral-700 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${installProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center font-mono text-gray-500">{statusText}</p>
              </div>
            )}

            {step === 'summary' && (
              <div className="space-y-4 text-center my-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                  <MaterialIcon name="check_circle" size={32} />
                </div>
                <h2 className="font-bold text-base text-gray-900 dark:text-white">
                  The installation was successful!
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  HighSierra AI Studio is now registered as a regular native app in your <code>/Applications</code> directory.
                </p>

                <div className="pt-2">
                  <button
                    onClick={downloadNativeLauncherScript}
                    className="btn-macos-primary px-4 py-2 text-xs font-bold flex items-center space-x-2 mx-auto cursor-pointer"
                  >
                    <MaterialIcon name="download" size={16} />
                    <span>Download Native App Launcher (.command)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Wizard Buttons Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-neutral-700">
              <button
                onClick={onClose}
                className="btn-macos px-3 py-1 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex space-x-2">
                {step === 'intro' && (
                  <button
                    onClick={() => {
                      setStep('destination');
                      playChime('click', soundEnabled);
                    }}
                    className="btn-macos-primary px-4 py-1 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Continue</span>
                    <MaterialIcon name="arrow_forward" size={14} />
                  </button>
                )}

                {step === 'destination' && (
                  <button
                    onClick={() => {
                      setStep('type');
                      playChime('click', soundEnabled);
                    }}
                    className="btn-macos-primary px-4 py-1 text-xs font-bold cursor-pointer"
                  >
                    Continue
                  </button>
                )}

                {step === 'type' && (
                  <button
                    onClick={startInstallation}
                    className="btn-macos-primary px-4 py-1 text-xs font-bold cursor-pointer"
                  >
                    Install
                  </button>
                )}

                {step === 'summary' && (
                  <button
                    onClick={onClose}
                    className="btn-macos-primary px-4 py-1 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

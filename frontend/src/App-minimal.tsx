import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            PropertyEscrow Platform
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Secure blockchain-powered property transactions on Polygon Mainnet
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-3 text-blue-300">Secure Escrow</h3>
            <p className="text-gray-300">Smart contracts ensure funds are safely held until all conditions are met.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-3 text-purple-300">Polygon Network</h3>
            <p className="text-gray-300">Fast, low-cost transactions on the Polygon blockchain network.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-3 text-indigo-300">Transparent Process</h3>
            <p className="text-gray-300">All transactions are recorded on-chain for complete transparency.</p>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">React Frontend Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Dependencies:</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full">✓ Installed</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Server Status:</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full">✓ Running</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Port Configuration:</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">Port 3000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
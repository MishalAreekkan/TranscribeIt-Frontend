import React from "react";
import Recording from "./components/Recording";
import Uploading from "./components/Uploading";

function App() {
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-800 to-gray-900 p-4 md:p-8 flex flex-col md:flex-row items-center justify-center gap-6">
      <div className="w-full md:w-1/2 lg:w-1/3 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
    
      {/* <div className="w-full h-full bg-yellow-500">hello</div> */}
        <Recording />
      </div>
      <div className="w-full md:w-1/2 lg:w-1/3 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
        <Uploading />
      </div>
    </div>
    </>
  );
}

export default App;

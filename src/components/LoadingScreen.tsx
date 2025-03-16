import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <div className="text-white text-2xl">로딩 중...</div>
    </div>
  );
};

export default LoadingScreen;

import React from 'react';

interface UIProps {
  children?: React.ReactNode;
}

/**
 * UI 컴포넌트
 * 
 * 게임 UI 요소를 포함하는 컨테이너입니다.
 */
export const UI: React.FC<UIProps> = ({ children }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="p-4 text-white">
        <div className="pointer-events-auto">
          <h1 className="text-2xl font-bold mb-2">3D 오픈월드 게임</h1>
          <div className="bg-black bg-opacity-50 p-2 rounded">
            <p className="text-sm">
              조작 방법:
              <br />
              - 이동: W, A, S, D 또는 화살표 키
              <br />
              - 달리기: Shift
              <br />
              - 점프: Space
              <br />
              - 공격: 1
              <br />
              - 카메라: 마우스
            </p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

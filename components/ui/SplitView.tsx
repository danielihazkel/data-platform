import React from 'react';

interface SplitViewProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  showDetail: boolean;
  onCloseDetail: () => void;
}

const SplitView: React.FC<SplitViewProps> = ({ list, detail, showDetail, onCloseDetail }) => {
  return (
    <div className={`flex flex-col lg:flex-row h-[calc(100vh-140px)] min-h-[600px] transition-all duration-300 ${showDetail ? 'gap-6' : 'gap-0'}`}>
      {/* List Panel */}
      <div className={`flex flex-col transition-all duration-300 h-full ${showDetail ? 'lg:w-7/12 xl:w-8/12 hidden lg:flex' : 'w-full flex'}`}>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          {list}
        </div>
      </div>

      {/* Detail Panel */}
      <div 
        className={`
          fixed inset-0 z-40 bg-slate-900/50 lg:static lg:bg-transparent lg:z-auto lg:h-full overflow-hidden
          ${showDetail ? 'flex lg:w-5/12 xl:w-4/12' : 'hidden lg:hidden w-0'}
        `}
        onClick={(e) => {
            if (e.target === e.currentTarget) onCloseDetail();
        }}
      >
        <div className={`
          w-full h-full lg:h-full bg-white lg:rounded-xl shadow-xl lg:shadow-sm flex flex-col 
          animate-slideInRight lg:animate-none ml-auto lg:ml-0 max-w-lg lg:max-w-none
          ${showDetail ? 'border border-slate-200' : 'border-none'}
        `}>
          {detail}
        </div>
      </div>
    </div>
  );
};

export default SplitView;

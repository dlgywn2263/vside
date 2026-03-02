"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Folder,
  Book,
  FlaskConical,
  Rocket,
  User,
  Settings,
  LogOut,
  MessageSquare,
  X,
  SendHorizonal,
} from "lucide-react";

export default function IDELayout({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* 1. 최좌측 아이콘 바 (VS Code 스타일) */}
      <div className="w-14 flex flex-col justify-between border-r border-slate-200 bg-white items-center py-6 z-20">
        <div className="flex flex-col space-y-8">
          <Link href="#">
            <Folder className="w-6 h-6 text-slate-400 hover:text-slate-900 transition-colors" />
          </Link>
          <Link href="#">
            <Book className="w-6 h-6 text-slate-400 hover:text-slate-900 transition-colors" />
          </Link>
          <Link href="/api-test" className="text-slate-900">
            <FlaskConical className="w-6 h-6" />
          </Link>
          <Link href="#">
            <Rocket className="w-6 h-6 text-slate-400 hover:text-slate-900 transition-colors" />
          </Link>
        </div>
        <div className="flex flex-col space-y-8 mb-4">
          <User className="w-6 h-6 text-slate-400 cursor-pointer" />
          <Settings className="w-6 h-6 text-slate-400 cursor-pointer" />
          <LogOut className="w-6 h-6 text-slate-400 cursor-pointer" />
        </div>
      </div>

      {/* 2. 중앙 메인 영역 (페이지 컴포넌트가 들어가는 곳) */}
      <div className="flex-1 flex overflow-hidden">{children}</div>

      {/* 3. 우측 팀 채팅 패널 (토글 가능) */}
      {isChatOpen ? (
        <div className="w-80 border-l border-slate-200 flex flex-col bg-white shadow-sm animate-in slide-in-from-right duration-300">
          <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>팀 채팅</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-slate-100 p-1 rounded-full"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">
                  김
                </span>
                <span className="font-bold text-slate-700">김철수</span>
                <span>오후 2:30</span>
              </div>
              <p className="text-sm bg-slate-50 p-2 rounded-lg ml-6">
                API 문서 작성 완료했습니다!
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">
                  이
                </span>
                <span className="font-bold text-slate-700">이영희</span>
                <span>오후 2:32</span>
              </div>
              <p className="text-sm bg-slate-50 p-2 rounded-lg ml-6">
                확인했어요. 배포 준비되면 알려주세요
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                className="w-full bg-slate-100 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-1.5 p-1.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors">
                <SendHorizonal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="w-12 border-l border-slate-200 flex flex-col items-center py-6 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare className="w-5 h-5 text-slate-400" />
        </div>
      )}
    </div>
  );
}

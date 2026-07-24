import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-[45%] bg-slate-950 p-12 flex-col justify-between relative overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.18) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 10%, rgba(99,102,241,0.12) 0%, transparent 50%)
          `,
        }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg">
              <Image src={"/logo-mark.svg"} width={90} height={90} alt="logo" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Hostmind
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Admin Platform
          </p>
          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            AI-powered chatbots for every hotel
          </h2>
          <p className="text-slate-400 text-[15px] leading-relaxed mb-10">
            Manage properties, upload knowledge documents, and deploy trained
            chatbots — all from one place.
          </p>

          <div className="space-y-4">
            {[
              {
                icon: "🏨",
                text: "Manage multiple properties from one dashboard",
              },
              {
                icon: "📄",
                text: "Upload documents to build your knowledge base",
              },
              {
                icon: "⚡",
                text: "Deploy chatbots trained on your hotel's data",
              },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center shrink-0 text-base border border-white/10">
                  {item.icon}
                </div>
                <p className="text-slate-300 text-[15px] leading-relaxed pt-1.5">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          © 2026 Hostmind. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-10 sm:px-8">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg">
              🤖
            </div>
            <span className="text-2xl font-bold text-slate-900">Hostmind</span>
          </div>
          <p className="text-slate-500 text-[15px]">
            AI-powered hotel chatbot platform
          </p>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-7 sm:p-9">
          {children}
        </div>
      </div>
    </div>
  );
}

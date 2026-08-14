// Split-screen shell shared by Login and Register.
export default function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-mint">
      {/* Brand panel */}
      <div
        className="relative hidden w-1/2 flex-col bg-plum p-12 text-white lg:flex bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/BackgroungLogin.jpg")' }}
      >
        <div className="relative z-10 flex flex-col h-full justify-between flex-1">
          <div className="flex items-center gap-0">
            <img src="/Logo.png" alt="ITSMDeskPro Logo" className="h-28 w-28 object-contain rounded-2xl -mr-5" />
            <span className="text-4xl font-black tracking-tight">ITSMDeskPro</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-6xl font-extrabold leading-tight">
              Enterprise IT Service
              <br />
              Management Desk
            </h1>
            <div className="mt-20 flex gap-6 text-sm">
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

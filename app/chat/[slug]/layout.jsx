export default function ChatLayout({ children }) {
  return (
    <>
      <style>{`
        html, body { 
          background: transparent !important; 
          margin: 0;
          padding: 0;
          height: 100%;
        }
      `}</style>
      {children}
    </>
  );
}
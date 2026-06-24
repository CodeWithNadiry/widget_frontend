export default function ChatLayout({ children }) {
  return (
    <>
      <style>{`
        html, body { 
          background: transparent !important; 
          margin: 0;
          padding: 0;
          height: 0;
          width: 0;
        }
      `}</style>
      {children}
    </>
  );
}
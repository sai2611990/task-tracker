import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
// AI Chat - uncomment when ANTHROPIC_API_KEY is configured
// import { ChatProvider } from '@/components/chat/chat-provider';
// import { ChatWidget } from '@/components/chat/chat-widget';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrap with <ChatProvider> when enabling AI chat
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
      </div>

      {/* AI Chat Widget - uncomment when ANTHROPIC_API_KEY is configured */}
      {/* <ChatWidget /> */}
    </div>
  );
}

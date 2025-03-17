"use client"
import { Button } from "@/components/ui/button"
import { PlusCircle, MessageSquare, Trash2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarFooter,
} from "@/components/ui/sidebar"

export function ConsultantSidebar({ chats = [], activeChat, onSelectChat, onNewChat, onDeleteChat }) {
  return (
    <Sidebar side="left" collapsible="offcanvas" className="border-r border-primary-400 z-20">
      <SidebarHeader className="border-b border-primary-400 p-4">
        <Button
          onClick={onNewChat}
          className="w-full bg-black hover:bg-primary-400 text-white border border-primary-300 flex items-center gap-2"
        >
          <PlusCircle size={16} />
          <span>New Chat</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectChat(chat.id)}
                      isActive={activeChat === chat.id}
                      className="text-white"
                    >
                      <MessageSquare size={16} />
                      <span>{chat.title}</span>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      onClick={() => onDeleteChat(chat.id)}
                      className="text-primary-200 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-primary-200">No chats yet. Start a new conversation!</div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

